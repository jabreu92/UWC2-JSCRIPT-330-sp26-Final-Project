import * as OrderDAO from '../daos/order.js';
import Order from '../models/order.js';
import Jet from '../models/jet.js';
import * as JetDAO from '../daos/jet.js';
import mongoose from 'mongoose';

jest.mock('../models/order.js');
jest.mock('../models/jet.js');
jest.mock('../daos/jet.js');

describe('Order DAO Logic Tests', () => {
    const mockUserId = new mongoose.Types.ObjectId().toString();
    const mockJetId = new mongoose.Types.ObjectId().toString();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createOneOrder', () => {
        it('should create an order and mark jet as unavailable', async () => {
            const mockJet = { _id: mockJetId, price: 500, isAvailable: true };
            
            JetDAO.findJetBySku.mockResolvedValue(mockJet);
            Order.create.mockResolvedValue({ _id: 'newOrder', orderNumber: 'ORD-123' });
            Jet.findByIdAndUpdate.mockResolvedValue({});
            Order.findOne.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue({ orderNumber: 'ORD-123', status: 'pending' })
                })
            });

            const result = await OrderDAO.createOneOrder(mockUserId, 'JET-SKU');

            expect(result.orderNumber).toBe('ORD-123');
            expect(Jet.findByIdAndUpdate).toHaveBeenCalledWith(mockJetId, { isAvailable: false });
        });

        it('should throw error if jet is not available', async () => {
            JetDAO.findJetBySku.mockResolvedValue({ isAvailable: false });

            await expect(OrderDAO.createOneOrder(mockUserId, 'SKU'))
                .rejects.toThrow("Jet unavailable or not found.");
        });
    });

    describe('findOrdersByUser', () => {
        it('should return sorted orders for a user', async () => {
            Order.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue([{ orderNumber: 'ORD-1' }])
                })
            });

            const result = await OrderDAO.findOrdersByUser(mockUserId);
            expect(result).toHaveLength(1);
            expect(Order.find).toHaveBeenCalledWith({ user: mockUserId });
        });
    });

    describe('updateOrderStatus', () => {
        it('should update status and re-list jet if cancelled', async () => {
            const mockOrder = { 
                orderNumber: 'ORD-1', 
                status: 'cancelled', 
                jet: { _id: mockJetId } 
            };
            Order.findOneAndUpdate.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockOrder)
            });

            const result = await OrderDAO.updateOrderStatus('ORD-1', 'cancelled');

            expect(result.status).toBe('cancelled');
            expect(Jet.findByIdAndUpdate).toHaveBeenCalledWith(mockJetId, { isAvailable: true });
        });
    });

    describe('deleteOrderByNum', () => {
        it('should find the order, update the jet, then delete', async () => {
            const mockOrder = { orderNumber: 'ORD-1', jet: mockJetId };
            
            Order.findOne.mockResolvedValue(mockOrder);
            Jet.findByIdAndUpdate.mockResolvedValue({});
            Order.findOneAndDelete.mockResolvedValue(mockOrder);

            const result = await OrderDAO.deleteOrderByNum('ORD-1');

            expect(result).not.toBeNull();
            expect(Jet.findByIdAndUpdate).toHaveBeenCalledWith(mockJetId, { isAvailable: true });
            expect(Order.findOneAndDelete).toHaveBeenCalledWith({ orderNumber: 'ORD-1' });
        });

        it('should return null if order to delete does not exist', async () => {
            Order.findOne.mockResolvedValue(null);
            const result = await OrderDAO.deleteOrderByNum('NONEXISTENT');
            expect(result).toBeNull();
        });
    });
});