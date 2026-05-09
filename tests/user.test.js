// 1. Set the secret BEFORE any imports so the middleware sees it
process.env.JWT_SECRET = 'your_super_secret_key'; 

import request from 'supertest';
import app from '../server.js';
import * as UserDAO from '../daos/user.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// 2. Mock the DAO module
jest.mock('../daos/user.js');

describe('User Controller & Routes', () => {
  let adminToken;
  let regularToken;
  const mockAdminId = new mongoose.Types.ObjectId().toString();
  const mockUserId = new mongoose.Types.ObjectId().toString();

  beforeAll(() => {
    // 3. Create tokens with IDs that match our mocks
    adminToken = jwt.sign({ id: mockAdminId, role: 'admin' }, process.env.JWT_SECRET);
    regularToken = jwt.sign({ id: mockUserId, role: 'regular' }, process.env.JWT_SECRET);

    /**
     * 4. Mock the internal middleware lookup.
     * If your middleware calls UserDAO.findById, we mock that.
     * If your middleware calls User.findById (the model), we spy on that.
     */
    
    // Mocking the DAO version
    UserDAO.findById.mockImplementation(async (id) => {
      if (id === mockAdminId) return { _id: mockAdminId, role: 'admin', email: 'admin@jet.com' };
      if (id === mockUserId) return { _id: mockUserId, role: 'regular', email: 'user@jet.com' };
      return null;
    });

    // Mocking the Mongoose Model version (as a safety net)
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
    // Close connection in case any code triggered a real buffering attempt
    await mongoose.connection.close(); 
  });

  describe('GET /user', () => {
    it('should allow admin to retrieve all users', async () => {
      // Mock the specific response for this controller action
      UserDAO.findAllUsers.mockResolvedValue([
        { email: 'admin@jet.com', role: 'admin' },
        { email: 'pilot@jet.com', role: 'regular' }
      ]);

      const res = await request(app)
        .get('/user')
        .set('Authorization', `Bearer ${adminToken}`);

      // If this still fails with 401, check the 'protect' middleware 
      // logic to see if it uses a different key for the user ID.
      expect(res.statusCode).toEqual(200);
      expect(res.body.count).toBe(2);
      expect(res.body.data[0].email).toBe('admin@jet.com');
    });
  });
});