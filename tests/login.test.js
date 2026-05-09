import request from 'supertest';
import app from '../server.js';
import * as UserDAO from '../daos/user.js';
const bcrypt = require('bcrypt'); // Use require to match your controller

// 1. Mock the dependencies
jest.mock('../daos/user.js');
jest.mock('bcrypt');

describe('Login Controller', () => {
    const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: '$2b$10$hashedpassword', // A fake hash
        role: 'regular'
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should login successfully with correct credentials', async () => {
        // Mocking the DAO to return our user
        UserDAO.findByEmail.mockResolvedValue(mockUser);
        
        // Mocking bcrypt to return true (password match)
        bcrypt.compare.mockResolvedValue(true);

        const res = await request(app)
            .post('/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toBe('test@example.com');
        expect(res.body.user.role).toBe('regular');
    });

    it('should return 401 for an email that does not exist', async () => {
        // Mocking the DAO to return null
        UserDAO.findByEmail.mockResolvedValue(null);

        const res = await request(app)
            .post('/login')
            .send({
                email: 'wrong@example.com',
                password: 'anyPassword'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe("Invalid email or password");
    });

    it('should return 401 for an incorrect password', async () => {
        UserDAO.findByEmail.mockResolvedValue(mockUser);
        
        // Mocking bcrypt to return false (wrong password)
        bcrypt.compare.mockResolvedValue(false);

        const res = await request(app)
            .post('/login')
            .send({
                email: 'test@example.com',
                password: 'wrongPassword'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe("Invalid email or password");
    });

    it('should return 500 if an internal error occurs', async () => {
        UserDAO.findByEmail.mockRejectedValue(new Error("Database connection failed"));

        const res = await request(app)
            .post('/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toBe("Database connection failed");
    });
});