// 1. Set the secret BEFORE any imports so middleware detects it
process.env.JWT_SECRET = 'your_super_secret_key';

import request from 'supertest';
import app from '../server.js';
import * as UserDAO from '../daos/user.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// 2. Mock the DAO module
jest.mock('../daos/user.js');

describe('User Controller & Routes', () => {
  let adminToken;
  let regularToken;
  const mockAdminId = new mongoose.Types.ObjectId().toString();
  const mockUserId = new mongoose.Types.ObjectId().toString();

  beforeAll(() => {
    // Create tokens for different roles
    adminToken = jwt.sign({ id: mockAdminId, role: 'admin', email: 'admin@jet.com' }, process.env.JWT_SECRET);
    regularToken = jwt.sign({ id: mockUserId, role: 'regular', email: 'user@jet.com' }, process.env.JWT_SECRET);

    // Mock internal middleware lookups
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

  // --- REGISTRATION ---
  describe('POST /user (Register)', () => {
    it('should register a new user successfully', async () => {
      UserDAO.findByEmail.mockResolvedValue(null);
      UserDAO.createOneUser.mockResolvedValue({ _id: mockUserId, email: 'new@jet.com', role: 'regular' });

      const res = await request(app)
        .post('/user')
        .send({ email: 'new@jet.com', password: 'password123' });

      expect(res.statusCode).toEqual(201);
    });

    it('should return 400 if user email already exists', async () => {
      UserDAO.findByEmail.mockResolvedValue({ email: 'exists@jet.com' });

      const res = await request(app)
        .post('/user')
        .send({ email: 'exists@jet.com', password: 'password123' });

      expect(res.statusCode).toEqual(400);
    });

    it('should return 401 if token is malformed', async () => {
      const res = await request(app)
        .get('/user')
        .set('Authorization', 'Bearer not-a-valid-token');
      expect(res.statusCode).toEqual(401);
    });

  });

  // --- PASSWORD CHANGE ---
  describe('PATCH /user/change-password', () => {
    it('should return 401 if old password is incorrect', async () => {
      UserDAO.findByEmail.mockResolvedValue({ email: 'user@jet.com', password: 'hashed' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const res = await request(app)
        .patch('/user/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ oldPassword: 'wrong', newPassword: 'new' });

      expect(res.statusCode).toEqual(401);
    });

    it('should return 400 if database update fails (success is false)', async () => {
      UserDAO.findByEmail.mockResolvedValue({ email: 'user@jet.com', password: 'hashed' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      UserDAO.updatePasswordByEmail.mockResolvedValue(false); // Fails here

      const res = await request(app)
        .patch('/user/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ oldPassword: 'old', newPassword: 'new' });

      expect(res.statusCode).toEqual(400);
    });

    it('should return 400 if password update fails in database', async () => {
      UserDAO.findByEmail.mockResolvedValue({ email: 'user@jet.com', password: 'hashed' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      UserDAO.updatePasswordByEmail.mockResolvedValue(false); // Triggers the 'else' branch

      const res = await request(app)
        .patch('/user/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ oldPassword: 'old', newPassword: 'new' });
      expect(res.statusCode).toEqual(400);
    });
  });

  // --- THE 404 SWEEP (Admin Management) ---
  describe('Admin Routes - Not Found Branches', () => {
    it('GET /user/:email - should return 404 if user not found', async () => {
      UserDAO.findByEmail.mockResolvedValue(null);
      const res = await request(app)
        .get('/user/missing@jet.com')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });

    it('PUT /user/:email - should return 404 if user to update not found', async () => {
      UserDAO.updateOneUser.mockResolvedValue(null);
      const res = await request(app)
        .put('/user/missing@jet.com')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });
      expect(res.statusCode).toEqual(404);
    });

    it('DELETE /user/:email - should return 404 if user to delete not found', async () => {
      UserDAO.deleteOneUser.mockResolvedValue(null);
      const res = await request(app)
        .delete('/user/missing@jet.com')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });

    it('should return 404 if deleting a non-existent user', async () => {
      UserDAO.deleteOneUser.mockResolvedValue(null);
      const res = await request(app)
        .delete('/user/notfound@test.com')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });
  });

  // --- CATCH BLOCK COVERAGE (500 Errors) ---
  describe('Global Error Handling', () => {
    it('should return 500 when DAO crashes unexpectedly', async () => {
      UserDAO.findAllUsers.mockRejectedValue(new Error('Database Failure'));
      const res = await request(app)
        .get('/user')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(500);
    });
  });

  describe('User Controller - Branch Boosters', () => {
    it('should return 404 if changing password for non-existent user', async () => {
      UserDAO.findByEmail.mockResolvedValue(null); // Line 104
      const res = await request(app)
        .patch('/user/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ oldPassword: 'any', newPassword: 'new' });
      expect(res.statusCode).toEqual(404);
    });

    it('should return 404 if deleting non-existent user', async () => {
      UserDAO.deleteOneUser.mockResolvedValue(null); // Line 119
      const res = await request(app)
        .delete('/user/fake@test.com')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });
  });
});