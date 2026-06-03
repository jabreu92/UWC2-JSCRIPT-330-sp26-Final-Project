import Order from '../models/order.js';
import Jet from '../models/jet.js';
import { findJetBySku } from './jet.js';

export const createOneOrder = async (userId, sku) => {
    try {
        const jetTemplate = await findJetBySku(sku);
        if (!jetTemplate || !jetTemplate.isAvailable) {
            throw new Error("Jet unavailable or not found.");
        }

        // Generate a human-readable order number
        const orderNumber = `ORD-${Date.now()}-${sku.split('-')[0]}`;
        const createdOrder = await Order.create({
            orderNumber,
            user: userId,
            jet: jetTemplate._id,
            finalSalePrice: jetTemplate.price,
            status: 'pending'
        });
        await Jet.findByIdAndUpdate(jetTemplate._id, { isAvailable: false });
        return await Order.findOne({ orderNumber }).populate('user jet').lean();
    } catch (error) {
        throw new Error(error.message);
    }
};

export const findOrdersByUser = async (userId) => {
    return await Order.find({ user: userId }).populate('jet').sort({ createdAt: -1 });
};

export const findAllOrdersAdmin = async () => {
    return await Order.find().populate('user jet').sort({ createdAt: -1 });
};

export const findOrderByNumber = async (orderNumber) => {
    try {
        return await Order.findOne({ orderNumber: orderNumber.toUpperCase() })
            .populate('user', 'email')
            .populate({
                path: 'jet',
                populate: { path: 'manufacturer', select: 'name code' }
            })
            .lean();
    } catch (error) {
        throw new Error(`DAO Error (FindByNumber): ${error.message}`);
    }
};

export const updateOrderStatus = async (orderNumber, newStatus) => {
    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { orderNumber: orderNumber.toUpperCase() },
            { status: newStatus },
            { new: true }
        ).populate('user jet');

        if (!updatedOrder) return null;

        if (newStatus === 'cancelled' && updatedOrder) {
            await Jet.findByIdAndUpdate(updatedOrder.jet._id, { isAvailable: true });
        }

        // If the order is completed, mark the jet as sold
        if (newStatus === 'completed') {
            await Jet.findByIdAndUpdate(updatedOrder.jet, { isAvailable: false });
        }

        return updatedOrder;
    } catch (error) {
        console.error("DAO Error (updateOrderStatus):", error.message);
        throw error;
    }
};

export const deleteOrderByNum = async (orderNumber) => {
    try {
        const order = await Order.findOne({ orderNumber: orderNumber.toUpperCase() });
        if (order) {
            // If the order was completed, deleting it makes the jet available again
            await Jet.findByIdAndUpdate(order.jet, { isAvailable: true });
            return await Order.findOneAndDelete({ orderNumber: orderNumber.toUpperCase() });
        }
        return null;
    } catch (error) {
        throw new Error(`DAO Error (DeleteOrder): ${error.message}`);
    }
};