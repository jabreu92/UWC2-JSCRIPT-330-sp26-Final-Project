process.env.JWT_SECRET = 'your_super_secret_key';

import request from 'supertest';
import app from '../server.js';
import * as JetDAO from '../daos/jet.js';
import * as UserDAO from '../daos/user.js';
import * as ManufacturerDAO from '../daos/manufacturer.js';
import User from '../models/user.js';
import Jet from '../models/jet.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

jest.mock('../daos/jet.js');
jest.mock('../daos/user.js');
jest.mock('../daos/manufacturer.js');

describe('Jet Controller & Routes - Final Suite', () => {
  let adminToken;
  let userToken;
  const mockAdminId = new mongoose.Types.ObjectId().toString();
  const mockUserId = new mongoose.Types.ObjectId().toString();

  beforeAll(() => {
    adminToken = jwt.sign({ id: mockAdminId, role: 'admin' }, process.env.JWT_SECRET);
    userToken = jwt.sign({ id: mockUserId, role: 'user' }, process.env.JWT_SECRET);
    jest.spyOn(Jet, 'find').mockImplementation(() => ({
      sort: jest.fn().mockReturnThis(),
      explain: jest.fn().mockResolvedValue({
        queryPlanner: { winningPlan: { stage: 'FETCH', inputStage: { stage: 'IXSCAN' } } },
        executionStats: { totalDocsExamined: 1, nReturned: 1 }
      })
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /jet (Read/Catalog)', () => {
    it('should call getAllJets for admin users', async () => {
      UserDAO.findById.mockResolvedValue({ _id: mockAdminId, role: 'admin' });
      JetDAO.getAllJets.mockResolvedValue([{ sku: 'ADMIN-JET' }]);

      const res = await request(app)
        .get('/jet')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(JetDAO.getAllJets).toHaveBeenCalled();
    });

    it('should call findAvailableJets for regular users (Coverage Boost)', async () => {
      UserDAO.findById.mockResolvedValue({ _id: mockUserId, role: 'user' });
      JetDAO.findAvailableJets.mockResolvedValue([{ sku: 'USER-JET' }]);

      const res = await request(app)
        .get('/jet')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(JetDAO.findAvailableJets).toHaveBeenCalled();
    });
  });

  describe('POST /jet (Create)', () => {
    it('should return 400 if SKU or Manufacturer Code is missing', async () => {
      UserDAO.findById.mockResolvedValue({ _id: mockAdminId, role: 'admin' });
      const res = await request(app)
        .post('/jet')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Incomplete' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if manufacturer does not exist (Mock Fix)', async () => {
      UserDAO.findById.mockResolvedValue({ _id: mockAdminId, role: 'admin' });
      ManufacturerDAO.findByCode.mockResolvedValue(null);

      const res = await request(app)
        .post('/jet')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ sku: 'NEW-JET', manufacturerCode: 'MISSING' });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });

  describe('PATCH /jet/:sku (Update)', () => {
    it('should return 404 if jet to update is not found', async () => {
      UserDAO.findById.mockResolvedValue({ _id: mockAdminId, role: 'admin' });
      JetDAO.updateOneJetBySku.mockResolvedValue(null);

      const res = await request(app)
        .patch('/jet/G500')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 1000000 });
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /jet/:sku', () => {
    it('should return 404 if jet to delete is not found', async () => {
      UserDAO.findById.mockResolvedValue({ _id: mockAdminId, role: 'admin' });
      JetDAO.deleteOneJetBySku.mockResolvedValue(null);

      const res = await request(app)
        .delete('/jet/VANISH')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Error Handling (Catch Blocks)', () => {
    it('should return 500 when getAllJets throws', async () => {
      UserDAO.findById.mockResolvedValue({ _id: mockAdminId, role: 'admin' });
      JetDAO.getAllJets.mockRejectedValue(new Error('Database Failure'));

      const res = await request(app)
        .get('/jet')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Error retrieving catalog');
    });
  });
});