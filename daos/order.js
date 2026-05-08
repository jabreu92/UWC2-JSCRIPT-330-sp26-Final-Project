import Order from '../models/order.js';
import Jet from '../models/jet.js';
import { findJetBySku } from './jet.js';

/**
 * --- CREATE ---
 * Captures a snapshot of the price and creates a pending order.
 */
export const createOneOrder = async (userId, sku) => {
    try {
        // 1. Find the jet by its unique SKU instead of ID
        // .findOne is used because SKU is a unique string
        const jetTemplate = await findJetBySku({ sku: sku.toUpperCase() });

        if (!jetTemplate) {
            throw new Error(`No jet found with SKU: ${sku}`);
        }

        if (!jetTemplate.isAvailable) {
            throw new Error("This jet is already sold or unavailable.");
        }

        // 2. Create the order record
        // We still store the jet's _id in the database for the relationship
        const createdOrder = await Order.create({
            user: userId,
            jet: jetTemplate._id, 
            finalSalePrice: jetTemplate.price,
            status: 'pending'
        });

        // 3. Mark the jet as unavailable immediately
        jetTemplate.isAvailable = false;
        await jetTemplate.save();
        
        // 4. Return populated data so Postman shows the Jet Name and User Email
        return await Order.findById(createdOrder._id)
            .populate('user', 'email')
            .populate('jet', 'name sku year')
            .lean();

    } catch (error) {
        // Pass the error up to the controller to handle the res.status
        throw new Error(error.message);
    }
};

/**
 * --- READ (User/Admin) ---
 */
export const findOrdersByUser = async (userId) => {
    return await Order.find({ user: userId }).populate('jet').sort({ createdAt: -1 });
};

export const findAllOrdersAdmin = async () => {
    return await Order.find().populate('user jet').sort({ createdAt: -1 });
};

/**
 * --- UPDATE ---
 * Approves an order by serial number and flips the jet availability.
 */
export const updateOrderBySerial = async (serialNumber, newStatus) => {
    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { instanceSerialNumber: serialNumber },
            { status: newStatus },
            { new: true }
        ).populate('user jet');

        if (!updatedOrder) return null;

        // If the order is completed, mark the jet as sold
        if (newStatus === 'completed') {
            await Jet.findByIdAndUpdate(updatedOrder.jet, { isAvailable: false });
        }

        return updatedOrder;
    } catch (error) {
        console.error("DAO Error (updateOrderBySerial):", error.message);
        throw error;
    }
};

/**
 * --- DELETE ---
 * Removes the order record. Optional: Re-lists the jet as available.
 */
export const deleteOneOrder = async (id) => {
    try {
        const order = await Order.findById(id);
        if (order) {
            // If the order was completed, deleting it makes the jet available again
            await Jet.findByIdAndUpdate(order.jet, { isAvailable: true });
            return await Order.findByIdAndDelete(id);
        }
        return null;
    } catch (error) {
        throw new Error(`DAO Error (DeleteOrder): ${error.message}`);
    }
};