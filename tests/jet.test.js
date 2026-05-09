
// 1. Set the secret BEFORE any imports
process.env.JWT_SECRET = 'your_super_secret_key';

import request from 'supertest';
import app from '../server.js';
import * as JetDAO from '../daos/jet.js';
import * as ManufacturerDAO from '../daos/manufacturer.js';
import User from '../models/user.js'; // Needed for middleware lookup mock
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import * as UserDAO from '../daos/user.js';

// 2. Mock the DAOs
jest.mock('../daos/jet.js');
jest.mock('../daos/manufacturer.js');
jest.mock('../daos/user.js');

describe('Jet Controller & Routes', () => {
    let adminToken;
    let regularToken;
    const mockAdminId = new mongoose.Types.ObjectId().toString();
    const mockUserId = new mongoose.Types.ObjectId().toString();

    beforeAll(() => {
        adminToken = jwt.sign({ id: mockAdminId, role: 'admin' }, process.env.JWT_SECRET);
        regularToken = jwt.sign({ id: mockUserId, role: 'regular' }, process.env.JWT_SECRET);

        // 3. Mock Middleware User Lookup (findById)
        // This allows the 'protect' middleware to pass
        UserDAO.findById.mockImplementation(async (id) => {
            if (id === mockAdminId) return { _id: mockAdminId, role: 'admin', email: 'admin@jet.com' };
            if (id === mockUserId) return { _id: mockUserId, role: 'regular', email: 'user@jet.com' };
            return null;
        });
        jest.spyOn(User, 'findById').mockImplementation((id) => ({
            exec: jest.fn().mockResolvedValue(
                id === mockAdminId
                    ? { _id: mockAdminId, role: 'admin' }
                    : { _id: mockUserId, role: 'regular' }
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

    // --- GET ALL JETS (Role-based logic) ---
    describe('GET /jet', () => {
        it('should allow admin to see ALL jets', async () => {
            JetDAO.getAllJets.mockResolvedValue([
                { sku: 'J-1', isAvailable: true },
                { sku: 'J-2', isAvailable: false }
            ]);

            const res = await request(app)
                .get('/jet')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.count).toBe(2);
            expect(JetDAO.getAllJets).toHaveBeenCalled();
        });

        it('should allow regular user to see ONLY available jets', async () => {
            JetDAO.findAvailableJets.mockResolvedValue([
                { sku: 'J-1', isAvailable: true }
            ]);

            const res = await request(app)
                .get('/jet')
                .set('Authorization', `Bearer ${regularToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.count).toBe(1);
            expect(JetDAO.findAvailableJets).toHaveBeenCalled();
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/jet');
            expect(res.statusCode).toEqual(401);
        });
        it('should return 500 if the database crashes during jet lookup', async () => {
            JetDAO.getAllJets.mockRejectedValue(new Error('DB CRASH'));
            const res = await request(app)
                .get('/jet')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(500);
        });
    });

    // --- GET SINGLE JET BY SKU ---
    describe('GET /jet/:sku', () => {
        it('should return a jet by SKU (Public Access)', async () => {
            JetDAO.findJetBySku.mockResolvedValue({ sku: 'G650', name: 'Gulfstream G650' });

            const res = await request(app).get('/jet/G650');

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.sku).toBe('G650');
        });

        it('should return 404 if jet is not found', async () => {
            JetDAO.findJetBySku.mockResolvedValue(null);
            const res = await request(app).get('/jet/NONEXISTENT');
            expect(res.statusCode).toEqual(404);
        });
    });

    // --- CREATE JET (Admin Only) ---
    describe('POST /jet', () => {
        const newJetData = {
            sku: 'G700',
            name: 'Gulfstream G700',
            manufacturerCode: 'GULF',
            price: 75000000
        };

        it('should allow admin to create a jet if manufacturer exists', async () => {
            ManufacturerDAO.findByCode.mockResolvedValue({ _id: 'man_123', name: 'Gulfstream' });
            JetDAO.createOneJet.mockResolvedValue({ ...newJetData, manufacturer: 'man_123' });

            const res = await request(app)
                .post('/jet')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newJetData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.message).toBe("Jet created successfully");
        });

        it('should return 404 if manufacturerCode is invalid', async () => {
            ManufacturerDAO.findByCode.mockResolvedValue(null);

            const res = await request(app)
                .post('/jet')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newJetData);

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toContain('Manufacturer with code');
        });

        it('should return 403 if regular user tries to create a jet', async () => {
            const res = await request(app)
                .post('/jet')
                .set('Authorization', `Bearer ${regularToken}`)
                .send(newJetData);

            expect(res.statusCode).toEqual(403);
        });
    });

    // --- UPDATE JET (Admin Only) ---
    describe('PATCH /jet/:sku', () => {
        it('should allow admin to update a jet', async () => {
            JetDAO.updateOneJetBySku.mockResolvedValue({ sku: 'G650', price: 80000000 });

            const res = await request(app)
                .patch('/jet/G650')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ price: 80000000 });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.price).toBe(80000000);
        });

        it('should return 400 for invalid price update', async () => {
            const res = await request(app)
                .patch('/jet/G650')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ price: -500 });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe("Price must be a positive number.");
        });

        it('should return 404 if updating a non-existent jet', async () => {
            JetDAO.updateOneJetBySku.mockResolvedValue(null);
            const res = await request(app)
                .patch('/jet/MISSING-123')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ price: 1000 });
            expect(res.statusCode).toEqual(404);
        });

        it('should return 404 if deleting a non-existent jet', async () => {
            JetDAO.deleteOneJetBySku.mockResolvedValue(null);
            const res = await request(app)
                .delete('/jet/MISSING-123')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    // --- DELETE JET (Admin Only) ---
    describe('DELETE /jet/:sku', () => {
        it('should allow admin to delete a jet', async () => {
            JetDAO.deleteOneJetBySku.mockResolvedValue({ sku: 'G650' });

            const res = await request(app)
                .delete('/jet/G650')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toContain('deleted successfully');
        });

        it('should return 404 if updating a non-existent jet', async () => {
            JetDAO.updateOneJetBySku.mockResolvedValue(null);
            const res = await request(app)
                .patch('/jet/MISSING-123')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ price: 1000 });
            expect(res.statusCode).toEqual(404);
        });

        it('should return 404 if deleting a non-existent jet', async () => {
            JetDAO.deleteOneJetBySku.mockResolvedValue(null);
            const res = await request(app)
                .delete('/jet/MISSING-123')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(404);
        });
    });
});