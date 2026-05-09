import * as ManufacturerDAO from '../daos/manufacturer.js';
import Manufacturer from '../models/manufacturer.js';

// Mock the Manufacturer model
jest.mock('../models/manufacturer.js');

describe('Manufacturer DAO Logic Tests', () => {
    const mockManufacturer = {
        name: 'Gulfstream Aerospace',
        code: 'GULF',
        country: 'USA'
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createOneManufacturer', () => {
        it('should successfully create a manufacturer', async () => {
            Manufacturer.create.mockResolvedValue(mockManufacturer);

            const result = await ManufacturerDAO.createOneManufacturer(mockManufacturer);

            expect(Manufacturer.create).toHaveBeenCalledWith(mockManufacturer);
            expect(result.name).toBe(mockManufacturer.name);
        });
    });

    describe('findByCode', () => {
        it('should find a manufacturer by code (case-insensitive) and use lean', async () => {
            // DAO Chain: findOne().lean()
            Manufacturer.findOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockManufacturer)
            });

            const result = await ManufacturerDAO.findByCode('gulf'); // lowercase input

            expect(Manufacturer.findOne).toHaveBeenCalledWith({ code: 'GULF' });
            expect(result.code).toBe('GULF');
        });

        it('should throw wrapped DAO error on failure', async () => {
            Manufacturer.findOne.mockImplementation(() => {
                throw new Error('Database connection lost');
            });

            await expect(ManufacturerDAO.findByCode('GULF'))
                .rejects.toThrow('DAO Error (FindByCode): Database connection lost');
        });
    });

    describe('findAllManufacturers', () => {
        it('should return all manufacturers using lean', async () => {
            Manufacturer.find.mockReturnValue({
                lean: jest.fn().mockResolvedValue([mockManufacturer])
            });

            const result = await ManufacturerDAO.findAllManufacturers();

            expect(Manufacturer.find).toHaveBeenCalled();
            expect(result).toHaveLength(1);
        });
    });

    describe('updateOneManufacturerByCode', () => {
        it('should update the record using uppercase code and return new doc', async () => {
            const updateData = { country: 'International' };
            Manufacturer.findOneAndUpdate.mockResolvedValue({ ...mockManufacturer, ...updateData });

            const result = await ManufacturerDAO.updateOneManufacturerByCode('gulf', updateData);

            expect(Manufacturer.findOneAndUpdate).toHaveBeenCalledWith(
                { code: 'GULF' },
                updateData,
                { new: true, runValidators: true }
            );
            expect(result.country).toBe('International');
        });
    });

    describe('deleteOneManufacturerByCode', () => {
        it('should successfully delete the manufacturer by uppercase code', async () => {
            Manufacturer.findOneAndDelete.mockResolvedValue(mockManufacturer);

            const result = await ManufacturerDAO.deleteOneManufacturerByCode('gulf');

            expect(Manufacturer.findOneAndDelete).toHaveBeenCalledWith({ code: 'GULF' });
            expect(result.code).toBe('GULF');
        });

        it('should throw wrapped DAO error when deletion fails', async () => {
            Manufacturer.findOneAndDelete.mockRejectedValue(new Error('Delete Error'));

            await expect(ManufacturerDAO.deleteOneManufacturerByCode('GULF'))
                .rejects.toThrow('DAO Error (DeleteByCode): Delete Error');
        });
    });
});