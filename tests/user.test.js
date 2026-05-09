// 1. Set the secret BEFORE any imports so middleware detects it
process.env.JWT_SECRET = 'your_super_secret_key'; 

import request from 'supertest';
import app from '../server.js';
import * as UserDAO from '../daos/user.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // Ensure this matches the import/require in your controller

// 2. Mock the DAO module
jest.mock('../daos/user.js');

describe('User Controller & Routes', () => {
  let adminToken;
  let regularToken;
  const mockAdminId = new mongoose.Types.ObjectId().toString();
  const mockUserId = new mongoose.Types.ObjectId().toString();

  beforeAll(() => {
    // 3. Create tokens with IDs that match our mocks
    adminToken = jwt.sign({ id: mockAdminId, role: 'admin', email: 'admin@jet.com' }, process.env.JWT_SECRET);
    regularToken = jwt.sign({ id: mockUserId, role: 'regular', email: 'user@jet.com' }, process.env.JWT_SECRET);

    // 4. Mock the internal middleware lookup.
    UserDAO.findById.mockImplementation(async (id) => {
      if (id === mockAdminId) return { _id: mockAdminId, role: 'admin', email: 'admin@jet.com' };
      if (id === mockUserId) return { _id: mockUserId, role: 'regular', email: 'user@jet.com' };
      return null;
    });

    // Safety net for Mongoose Model lookups
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

  // --- REGISTRATION ---
  describe('POST /user (Register)', () => {
    it('should register a new user and return user data without password', async () => {
      UserDAO.findByEmail.mockResolvedValue(null);
      UserDAO.createOneUser.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        email: 'new@jet.com',
        role: 'regular'
      });

      const res = await request(app)
        .post('/user')
        .send({ email: 'new@jet.com', password: 'password123' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('email', 'new@jet.com');
      expect(res.body).not.toHaveProperty('password');
    });
  });

  // --- PASSWORD CHANGE ---
  describe('PATCH /user/change-password', () => {
    it('should update password when old password matches', async () => {
      UserDAO.findByEmail.mockResolvedValue({
        email: 'user@jet.com',
        password: 'hashed_old_password'
      });

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new_hashed_password');
      UserDAO.updatePasswordByEmail.mockResolvedValue(true);

      const res = await request(app)
        .patch('/user/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ oldPassword: 'old123', newPassword: 'new123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Password updated successfully");
    });

    it('should fail if old password is incorrect', async () => {
      UserDAO.findByEmail.mockResolvedValue({ email: 'user@jet.com', password: 'hashed' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const res = await request(app)
        .patch('/user/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ oldPassword: 'wrong', newPassword: 'new' });

      expect(res.statusCode).toEqual(401);
    });
  });

  // --- ADMIN MANAGEMENT ---
  describe('Admin Routes', () => {
    it('GET /user - should allow admin to see all users', async () => {
      UserDAO.findAllUsers.mockResolvedValue([{ email: 'u1@t.com' }, { email: 'u2@t.com' }]);

      const res = await request(app)
        .get('/user')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.count).toBe(2);
    });

    it('GET /user/:email - should get a single user by email', async () => {
      UserDAO.findByEmail.mockResolvedValue({
        email: 'target@jet.com',
        role: 'regular',
        toObject: function() { return { email: this.email, role: this.role }; }
      });

      const res = await request(app)
        .get('/user/target@jet.com')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.email).toBe('target@jet.com');
    });

    it('PUT /user/:email - should update user data', async () => {
      UserDAO.updateOneUser.mockResolvedValue({ email: 'target@jet.com', role: 'admin' });

      const res = await request(app)
        .put('/user/target@jet.com')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.role).toBe('admin');
    });

    it('DELETE /user/:email - should delete a user', async () => {
      UserDAO.deleteOneUser.mockResolvedValue({ email: 'delete@jet.com' });

      const res = await request(app)
        .delete('/user/delete@jet.com')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('deleted');
    });

    it('should return 403 if a regular user tries to access admin routes', async () => {
      const res = await request(app)
        .get('/user')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });
});