process.env.JWT_SECRET = 'your_super_secret_key';

import request from 'supertest';
import app from '../server.js';
import * as ManufacturerDAO from '../daos/manufacturer.js';
import * as UserDAO from '../daos/user.js';
import User from '../models/user.js';
import Jet from '../models/jet.js';

import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

jest.mock('../daos/manufacturer.js');
jest.mock('../daos/user.js');

describe('Manufacturer Controller & Routes', () => {
    let adminToken;
    let regularToken;
    const mockAdminId = new mongoose.Types.ObjectId().toString();
    const mockUserId = new mongoose.Types.ObjectId().toString();

    beforeAll(() => {
        adminToken = jwt.sign({ id: mockAdminId, role: 'admin' }, process.env.JWT_SECRET);
        regularToken = jwt.sign({ id: mockUserId, role: 'regular' }, process.env.JWT_SECRET);
        UserDAO.findById.mockImplementation(async (id) => {
            if (id === mockAdminId) return { _id: mockAdminId, role: 'admin' };
            if (id === mockUserId) return { _id: mockUserId, role: 'regular' };
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

    describe('GET /manufacturer', () => {
        it('should allow public access to list all manufacturers', async () => {
            ManufacturerDAO.findAllManufacturers.mockResolvedValue([
                { name: 'Bombardier', code: 'BOM' },
                { name: 'Gulfstream', code: 'GULF' }
            ]);

            const res = await request(app).get('/manufacturer');

            expect(res.statusCode).toEqual(200);
            expect(res.body.count).toBe(2);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /manufacturer/:code', () => {
        it('should return a manufacturer by its code', async () => {
            ManufacturerDAO.findByCode.mockResolvedValue({
                name: 'Cessna',
                code: 'CESS',
                country: 'USA'
            });

            const res = await request(app).get('/manufacturer/CESS');

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.code).toBe('CESS');
        });

        it('should return 404 if the manufacturer code does not exist', async () => {
            ManufacturerDAO.findByCode.mockResolvedValue(null);

            const res = await request(app).get('/manufacturer/FAKE');

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toContain('not found');
        });
    });

    describe('POST /manufacturer', () => {
        const newMan = { name: 'Embraer', code: 'EMB', country: 'Brazil' };

        it('should allow admin to create a new manufacturer', async () => {
            ManufacturerDAO.findByCode.mockResolvedValue(null);
            ManufacturerDAO.createOneManufacturer.mockResolvedValue(newMan);

            const res = await request(app)
                .post('/manufacturer')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newMan);

            expect(res.statusCode).toEqual(201);

            const result = res.body.data || res.body;
            expect(result).toBeDefined();
            expect(result.code).toBe('EMB');
        });

        it('should return 409 if the manufacturer code already exists', async () => {
            ManufacturerDAO.findByCode.mockResolvedValue({ code: 'EMB', name: 'Existing' });

            const res = await request(app)
                .post('/manufacturer')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newMan);

            expect(res.statusCode).toEqual(409);
            expect(res.body.message).toMatch(/already exists/i);
        });

        it('should return 403 if regular user tries to create', async () => {
            const res = await request(app)
                .post('/manufacturer')
                .set('Authorization', `Bearer ${regularToken}`)
                .send(newMan);

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('PUT /manufacturer/:code', () => {
        it('should allow admin to update a manufacturer', async () => {
            const updatedData = { code: 'BOM', name: 'Bombardier Aerospace' };

            jest.spyOn(ManufacturerDAO, 'updateOneManufacturerByCode').mockResolvedValue(updatedData);

            const res = await request(app)
                .put('/manufacturer/BOM')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Bombardier Aerospace' });

            expect(res.statusCode).toEqual(200);
            const result = res.body.data || res.body;
            expect(result.name).toBe('Bombardier Aerospace');
        });
    });

    describe('DELETE /manufacturer/:code', () => {
        it('should allow admin to delete a manufacturer', async () => {
            const mockCode = 'BOM';
            const mockId = new mongoose.Types.ObjectId();
            ManufacturerDAO.findByCode.mockResolvedValue({
                _id: mockId,
                code: mockCode
            });

            jest.spyOn(Jet, 'countDocuments').mockResolvedValue(0);
            const mockDelete = jest.spyOn(ManufacturerDAO, 'deleteOneManufacturerByCode')
                .mockResolvedValue(true);

            const res = await request(app)
                .delete(`/manufacturer/${mockCode}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toMatch(new RegExp(`${mockCode} deleted`, 'i'));
            expect(mockDelete).toHaveBeenCalledWith(mockCode);
        });
    });

    describe('Manufacturer - Extra Coverage', () => {
        it('should return 404 if manufacturer not found by code', async () => {
            ManufacturerDAO.findByCode.mockResolvedValue(null);
            const res = await request(app)
                .get('/manufacturer/FAKE')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(404); // Covers line 20
        });

        it('should return 404 if updating non-existent manufacturer', async () => {
            ManufacturerDAO.updateOneManufacturerByCode.mockResolvedValue(null);
            const res = await request(app)
                .patch('/manufacturer/FAKE')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'New Name' });
            expect(res.statusCode).toEqual(404); // Covers line 64
        });
    });
}); 