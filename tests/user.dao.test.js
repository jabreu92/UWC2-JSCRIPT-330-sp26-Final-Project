import * as UserDAO from '../daos/user.js';
import User from '../models/user.js';

jest.mock('../models/user.js');

describe('User DAO', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // Matches: User.find().select('-password').lean()
    it('should find all users', async () => {
        User.find.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([{ email: 'user1@test.com' }])
            })
        });

        const res = await UserDAO.findAllUsers();
        expect(res).toHaveLength(1);
        expect(res[0].email).toBe('user1@test.com');
    });

    // Matches: User.findOne({ email: ... }) -> No chain mentioned in your error!
    it('should find a user by email', async () => {
        User.findOne.mockResolvedValue({ email: 'test@test.com' });

        const res = await UserDAO.findByEmail('test@test.com');
        expect(res.email).toBe('test@test.com');
    });

    it('should find a user by id', async () => {
        // Match the DAO: it uses findOne, and has NO .select() or .lean()
        User.findOne.mockResolvedValue({ _id: '123' });

        const res = await UserDAO.findById('123');

        expect(User.findOne).toHaveBeenCalledWith({ _id: '123' });
        expect(res._id).toBe('123');
    });

    it('should create a user', async () => {
        User.create.mockResolvedValue({ email: 'new@test.com' });
        const res = await UserDAO.createOneUser({ email: 'new@test.com' });
        expect(res.email).toBe('new@test.com');
    });

    // Matches: User.findOneAndUpdate(...).select('-password')
    it('should update a user', async () => {
        User.findOneAndUpdate.mockReturnValue({
            select: jest.fn().mockResolvedValue({ email: 'updated@test.com' })
        });

        const res = await UserDAO.updateOneUser('old@test.com', { email: 'updated@test.com' });
        expect(res.email).toBe('updated@test.com');
    });

    it('should delete a user', async () => {
        User.findOneAndDelete.mockResolvedValue({ email: 'deleted@test.com' });
        const res = await UserDAO.deleteOneUser('deleted@test.com');
        expect(res.email).toBe('deleted@test.com');
    });

    // Matches: User.findOneAndUpdate(...).select('-password')
    it('should update password by email', async () => {
        User.findOneAndUpdate.mockReturnValue({
            select: jest.fn().mockResolvedValue({ email: 'test@test.com' })
        });

        const res = await UserDAO.updatePasswordByEmail('test@test.com', 'newHash');
        expect(res.email).toBe('test@test.com');
    });
});