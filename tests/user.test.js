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

describe('User Controller & Routes - Comprehensive Coverage Suite', () => {
  let adminToken;
  let regularToken;
  const mockAdminId = new mongoose.Types.ObjectId().toString();
  const mockUserId = new mongoose.Types.ObjectId().toString();

  beforeAll(() => {
    // Create tokens for different roles
    adminToken = jwt.sign({ id: mockAdminId, role: 'admin', email: 'admin@jet.com' }, process.env.JWT_SECRET);
    regularToken = jwt.sign({ id: mockUserId, role: 'regular', email: 'user@jet.com' }, process.env.JWT_SECRET);

    // Mock internal middleware lookups for auth protection
    UserDAO.findById.mockImplementation(async (id) => {
      if (id === mockAdminId) return { _id: mockAdminId, role: 'admin', email: 'admin@jet.com' };
      if (id === mockUserId) return { _id: mockUserId, role: 'regular', email: 'user@jet.com' };
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await mongoose.connection.close();
  });

  // --- REGISTRATION & AUTH ---
  describe('POST /user (Register)', () => {
    it('should register a new user successfully', async () => {
      UserDAO.findByEmail.mockResolvedValue(null);
      UserDAO.createOneUser.mockResolvedValue({ _id: mockUserId, email: 'new@jet.com', role: 'regular' });

      const res = await request(app)
        .post('/user')
        .send({ email: 'new@jet.com', password: 'password123' });

      expect(res.statusCode).toEqual(201);
    });

    it('should return 400 if user email already exists (Line 27)', async () => {
      UserDAO.findByEmail.mockResolvedValue({ email: 'exists@jet.com' });
      const res = await request(app)
        .post('/user')
        .send({ email: 'exists@jet.com', password: 'password123' });
      expect(res.statusCode).toEqual(400);
    });

    it('should return 500 if registration crashes (Line 37)', async () => {
      UserDAO.findByEmail.mockRejectedValue(new Error('Fatal Crash'));
      const res = await request(app)
        .post('/user')
        .send({ email: 'crash@jet.com', password: '123' });
      expect(res.statusCode).toEqual(500);
    });
  });

  // --- MIDDLEWARE & GAPS ---
  describe('Middleware & Access Control (Lines 23, 33)', () => {
    it('should return 401 if token is malformed', async () => {
      const res = await request(app)
        .get('/user')
        .set('Authorization', 'Bearer not-a-valid-token');
      expect(res.statusCode).toEqual(401);
    });

    it('should return 401 if No Authorization header is provided (Line 23)', async () => {
      const res = await request(app).get('/user'); 
      expect(res.statusCode).toEqual(401);
    });

    it('should return 403 if regular user tries to access admin routes (Line 33)', async () => {
      const res = await request(app)
        .get('/user')
        .set('Authorization', `Bearer ${regularToken}`);
      expect(res.statusCode).toEqual(403);
    });
  });

  // --- PASSWORD CHANGE ---
  describe('PATCH /user/change-password', () => {
    it('should return 404 if user not found for password change (Line 104)', async () => {
      UserDAO.findByEmail.mockResolvedValue(null);
      const res = await request(app)
        .patch('/user/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ oldPassword: 'old', newPassword: 'new' });
      expect(res.statusCode).toEqual(404);
    });

    it('should return 401 if old password is incorrect', async () => {
      UserDAO.findByEmail.mockResolvedValue({ email: 'user@jet.com', password: 'hashed' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      const res = await request(app)
        .patch('/user/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ oldPassword: 'wrong', newPassword: 'new' });
      expect(res.statusCode).toEqual(401);
    });

    it('should return 400 if database update fails (Line 110)', async () => {
      UserDAO.findByEmail.mockResolvedValue({ email: 'user@jet.com', password: 'hashed' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      UserDAO.updatePasswordByEmail.mockResolvedValue(false); 
      const res = await request(app)
        .patch('/user/change-password')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ oldPassword: 'old', newPassword: 'new' });
      expect(res.statusCode).toEqual(400);
    });
  });

  // --- ADMIN MANAGEMENT (404 & 500 branches) ---
  describe('Admin Operations - Branch Coverage', () => {
    it('GET /user - should return 500 if findAll fails (Line 44)', async () => {
      UserDAO.findAllUsers.mockRejectedValue(new Error('Fail'));
      const res = await request(app)
        .get('/user')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(500);
    });

    it('GET /user/:email - should return 404 if user not found (Line 55-58)', async () => {
      UserDAO.findByEmail.mockResolvedValue(null);
      const res = await request(app)
        .get('/user/missing@jet.com')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });

    it('PUT /user/:email - should return 500 if update fails (Line 75-77)', async () => {
      UserDAO.updateOneUser.mockRejectedValue(new Error('Update Crash'));
      const res = await request(app)
        .put('/user/edit@jet.com')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });
      expect(res.statusCode).toEqual(500);
    });

    it('DELETE /user/:email - should return 404 if user to delete not found (Line 119)', async () => {
      UserDAO.deleteOneUser.mockResolvedValue(null);
      const res = await request(app)
        .delete('/user/missing@jet.com')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(404);
    });

    it('DELETE /user/:email - should return 500 if delete crashes (Line 121)', async () => {
      UserDAO.deleteOneUser.mockRejectedValue(new Error('Delete Fatal'));
      const res = await request(app)
        .delete('/user/crash@jet.com')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(500);
    });
  });
});