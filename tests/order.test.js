process.env.JWT_SECRET = 'your_super_secret_key';

import request from 'supertest';
import app from '../server.js';
import * as OrderDAO from '../daos/order.js';
import * as JetDAO from '../daos/jet.js';
import * as UserDAO from '../daos/user.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

jest.mock('../daos/order.js');
jest.mock('../daos/jet.js');
jest.mock('../daos/user.js');

describe('Order Controller & Routes', () => {
    let adminToken;
    let regularToken;
    let otherUserToken;
    const mockAdminId = new mongoose.Types.ObjectId().toString();
    const mockUserId = new mongoose.Types.ObjectId().toString();
    const mockOtherUserId = new mongoose.Types.ObjectId().toString();

    beforeAll(() => {
        adminToken = jwt.sign({ id: mockAdminId, _id: mockAdminId, role: 'admin' }, process.env.JWT_SECRET);
        regularToken = jwt.sign({ id: mockUserId, _id: mockUserId, role: 'regular' }, process.env.JWT_SECRET);
        otherUserToken = jwt.sign({ id: mockOtherUserId, _id: mockOtherUserId, role: 'regular' }, process.env.JWT_SECRET);

        UserDAO.findById.mockImplementation(async (id) => {
            if (id === mockAdminId) return { _id: mockAdminId, id: mockAdminId, role: 'admin' };
            if (id === mockUserId) return { _id: mockUserId, id: mockUserId, role: 'regular' };
            if (id === mockOtherUserId) return { _id: mockOtherUserId, id: mockOtherUserId, role: 'regular' };
            return null;
        });

        jest.spyOn(User, 'findById').mockImplementation((id) => ({
            exec: jest.fn().mockResolvedValue(
                id === mockAdminId ? { _id: mockAdminId, role: 'admin' } :
                    id === mockUserId ? { _id: mockUserId, role: 'regular' } :
                        { _id: mockOtherUserId, role: 'regular' }
            )
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        jest.restoreAllMocks();
        await mongoose.connection.close();
    });

    describe('POST /order', () => {
        it('should create an order for a logged-in user', async () => {
            const orderData = { sku: 'G650' };

            jest.spyOn(JetDAO, 'findJetBySku').mockResolvedValue({
                sku: 'G650',
                isAvailable: true,
                price: 50000000
            });

            const mockCreate = jest.spyOn(OrderDAO, 'createOneOrder').mockResolvedValue({
                orderNumber: 'ORD-123',
                userId: mockUserId
            });

            const res = await request(app)
                .post('/order')
                .set('Authorization', `Bearer ${regularToken}`)
                .send(orderData);

            expect(res.statusCode).toEqual(201);
            expect(mockCreate).toHaveBeenCalled();
        });
    });

    describe('GET /order', () => {
        it('should allow Admin to see all orders', async () => {
            const mockSpy = jest.spyOn(OrderDAO, 'findAllOrdersAdmin')
                .mockResolvedValue([{ orderNumber: 'ORD-1' }, { orderNumber: 'ORD-2' }]);

            const res = await request(app)
                .get('/order')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.count).toBe(2);
            expect(mockSpy).toHaveBeenCalled();
        });

        it('should allow Regular User to see only their orders', async () => {
            const mockSpy = jest.spyOn(OrderDAO, 'findOrdersByUser')
                .mockResolvedValue([{ orderNumber: 'ORD-1', userId: mockUserId }]);

            const res = await request(app)
                .get('/order')
                .set('Authorization', `Bearer ${regularToken}`);

            expect(res.statusCode).toEqual(200);
            expect(mockSpy).toHaveBeenCalledWith(mockUserId);
        });

        it('should return 500 if getAllOrders fails', async () => {
            OrderDAO.findAllOrdersAdmin.mockRejectedValue(new Error('DB Fail')); // Line 10
            const res = await request(app)
                .get('/order')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('GET /order/:orderNumber', () => {
        it('should allow a user to view their own order', async () => {
            const mockOrder = {
                orderNumber: 'ORD-123',
                user: { _id: mockUserId }
            };

            jest.spyOn(OrderDAO, 'findOrderByNumber').mockResolvedValue(mockOrder);

            const res = await request(app)
                .get('/order/ORD-123')
                .set('Authorization', `Bearer ${regularToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.orderNumber).toBe('ORD-123');
        });

        it('should return 403 if user attempts to view another user\'s order', async () => {
            const mockOrder = {
                orderNumber: 'ORD-999',
                user: { _id: mockAdminId }
            };

            jest.spyOn(OrderDAO, 'findOrderByNumber').mockResolvedValue(mockOrder);

            const res = await request(app)
                .get('/order/ORD-999')
                .set('Authorization', `Bearer ${regularToken}`);

            expect(res.statusCode).toEqual(403);
        });

        it('should return 404 if getting specific order fails', async () => {
            OrderDAO.findOrderByNumber.mockResolvedValue(null);
            const res = await request(app)
                .get('/order/123')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('PATCH /order/:orderNumber', () => {
        it('should allow admin to update order status', async () => {
            const updatePayload = { status: 'completed' };
            const mockUpdated = { orderNumber: 'ORD-123', status: 'completed' };

            jest.spyOn(OrderDAO, 'updateOrderStatus').mockResolvedValue(mockUpdated);

            const res = await request(app)
                .patch('/order/ORD-123')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updatePayload);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.status).toBe('completed');
        });
    });

    describe('DELETE /order/:orderNumber', () => {
        it('should allow admin to delete an order record', async () => {
            const mockSpy = jest.spyOn(OrderDAO, 'deleteOrderByNum')
                .mockResolvedValue({ orderNumber: 'ORD-123' });

            const res = await request(app)
                .delete('/order/ORD-123')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toMatch(/deleted/i);
            expect(mockSpy).toHaveBeenCalledWith('ORD-123');
        });

        it('should return 403 if non-admin tries to delete', async () => {
            const res = await request(app)
                .delete('/order/ORD-123')
                .set('Authorization', `Bearer ${regularToken}`);

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('Order - Extra Coverage', () => {
        it('should return 404 if order ID does not exist', async () => {
            OrderDAO.findOrderByNumber.mockResolvedValue(null);
            const res = await request(app)
                .get('/order/645645645')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(404); 
        });

        it('should return 500 if order creation crashes', async () => {
            OrderDAO.createOneOrder.mockRejectedValue(new Error('Crash'));
            const res = await request(app)
                .post('/order')
                .set('Authorization', `Bearer ${regularToken}`)
                .send({ jetSku: 'G650' });
            expect(res.statusCode).toEqual(400); 
        });
    });
});