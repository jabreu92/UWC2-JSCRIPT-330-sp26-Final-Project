import * as JetDAO from '../daos/jet.js';
import Jet from '../models/jet.js';

jest.mock('../models/jet.js');

describe('Jet DAO Logic Tests', () => {
    const mockJet = {
        sku: 'G650-ER',
        modelName: 'Gulfstream G650ER',
        isAvailable: true,
        manufacturer: 'mock-manufacturer-id'
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createOneJet', () => {
        it('should successfully create a jet', async () => {
            Jet.create.mockResolvedValue(mockJet);

            const result = await JetDAO.createOneJet(mockJet);

            expect(Jet.create).toHaveBeenCalledWith(mockJet);
            expect(result.sku).toBe('G650-ER');
        });

        it('should throw a custom DAO error if creation fails', async () => {
            Jet.create.mockRejectedValue(new Error('Validation Failed'));

            await expect(JetDAO.createOneJet(mockJet))
                .rejects.toThrow('DAO Error (Create): Validation Failed');
        });
    });

    describe('findJetBySku', () => {
        it('should find a jet by SKU (case-insensitive) with populate and lean', async () => {
            Jet.findOne.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockJet)
            });

            const result = await JetDAO.findJetBySku('g650-er');

            expect(Jet.findOne).toHaveBeenCalledWith({ sku: 'G650-ER' });
            expect(result.sku).toBe('G650-ER');
        });
    });

    describe('getAllJets', () => {
        it('should return all jets with manufacturer names sorted by creation date', async () => {
            Jet.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(), 
                lean: jest.fn().mockResolvedValue([mockJet])
            });

            const result = await JetDAO.getAllJets();

            expect(Jet.find).toHaveBeenCalled();
            const jetFindCall = Jet.find();
            expect(jetFindCall.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(result).toHaveLength(1);
        });
    });

    describe('findAvailableJets', () => {
        it('should only query jets where isAvailable is true and sort by price', async () => {
            Jet.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(), // Added sort to the mock chain
                lean: jest.fn().mockResolvedValue([mockJet])
            });

            await JetDAO.findAvailableJets();

            expect(Jet.find).toHaveBeenCalledWith({ isAvailable: true });
            const jetFindCall = Jet.find({ isAvailable: true });
            expect(jetFindCall.sort).toHaveBeenCalledWith({ price: 1 });
        });
    });

    describe('updateOneJetBySku', () => {
        it('should update a jet and populate the manufacturer', async () => {
            const updateData = { isAvailable: false };
            Jet.findOneAndUpdate.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ ...mockJet, ...updateData })
            });

            const result = await JetDAO.updateOneJetBySku('G650-ER', updateData);

            expect(Jet.findOneAndUpdate).toHaveBeenCalledWith(
                { sku: 'G650-ER' },
                updateData,
                { new: true, runValidators: true }
            );
            expect(result.isAvailable).toBe(false);
        });
    });

    describe('deleteOneJetBySku', () => {
        it('should delete the jet using the uppercase SKU', async () => {
            Jet.findOneAndDelete.mockResolvedValue(mockJet);

            const result = await JetDAO.deleteOneJetBySku('g650-er');

            expect(Jet.findOneAndDelete).toHaveBeenCalledWith({ sku: 'G650-ER' });
            expect(result.sku).toBe('G650-ER');
        });
    });
});