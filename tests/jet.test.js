// 1. Set the secret BEFORE any imports
process.env.JWT_SECRET = 'your_super_secret_key';

import request from 'supertest';
import app from '../server.js';
import * as JetDAO from '../daos/jet.js';
import * as ManufacturerDAO from '../daos/manufacturer.js';
import User from '../models/user.js'; 
import Jet from '../models/jet.js'; // Import Jet to mock the explain call
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

        // Mock User lookup for the 'protect' middleware
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

        // 3. THE FIX: Mock the .explain() chain used by logIndexReport
        // This prevents Mongoose from trying to connect to a real DB during tests
        jest.spyOn(Jet, 'find').mockImplementation(() => ({
            sort: jest.fn().mockReturnThis(),
            explain: jest.fn().mockResolvedValue({
                queryPlanner: {
                    winningPlan: { stage: 'IXSCAN' } // Fake "Gold Medal" for the test
                },
                executionStats: {
                    totalDocsExamined: 0,
                    nReturned: 0
                }
            })
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        jest.restoreAllMocks();
        await mongoose.connection.close();
    });

    // --- GET ALL JETS ---
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
        });
    });

    // --- GET SINGLE JET BY SKU ---
    describe('GET /jet/:sku', () => {
        it('should return a jet by SKU', async () => {
            JetDAO.findJetBySku.mockResolvedValue({ sku: 'G650', name: 'Gulfstream G650' });

            const res = await request(app).get('/jet/G650');

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.sku).toBe('G650');
        });
    });

    // --- CREATE JET ---
    describe('POST /jet', () => {
        const newJetData = {
            sku: 'G700',
            name: 'Gulfstream G700',
            manufacturerCode: 'GULF',
            price: 75000000
        };

        it('should allow admin to create a jet', async () => {
            ManufacturerDAO.findByCode.mockResolvedValue({ _id: 'man_123', name: 'Gulfstream' });
            JetDAO.createOneJet.mockResolvedValue({ ...newJetData, manufacturer: 'man_123' });

            const res = await request(app)
                .post('/jet')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newJetData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.message).toBe("Jet created successfully");
        });
    });

    // --- UPDATE JET ---
    describe('PATCH /jet/:sku', () => {
        it('should return 400 for invalid price update (negative number)', async () => {
            // We don't even need to mock the DAO here because the controller 
            // should return 400 before it even calls the DAO.
            const res = await request(app)
                .patch('/jet/G650')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ price: -500 });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe("Price must be a positive number.");
        });

        it('should allow admin to update a jet', async () => {
            // Mock a successful return so it doesn't 404
            JetDAO.updateOneJetBySku.mockResolvedValue({ sku: 'G650', price: 80000000 });

            const res = await request(app)
                .patch('/jet/G650')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ price: 80000000 });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe("Jet updated successfully");
        });
    });

    // --- DELETE JET ---
    describe('DELETE /jet/:sku', () => {
        it('should allow admin to delete a jet', async () => {
            // Mock a successful return
            JetDAO.deleteOneJetBySku.mockResolvedValue({ sku: 'G650' });

            const res = await request(app)
                .delete('/jet/G650')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            // This will now pass because the controller sends "deleted successfully."
            expect(res.body.message).toContain('deleted successfully');
        });
    });
});