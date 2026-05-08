import * as OrderDAO from '../daos/order.js';
import mongoose from 'mongoose';

// --- CREATE ---
export const createPurchase = async (req, res) => {
  try {
    const { sku } = req.body; // Changed from jetId to sku
    const userId = req.user.id;

    if (!sku) {
      return res.status(400).json({ message: "SKU is required to make a purchase." });
    }

    // Call the DAO with the SKU string
    const order = await OrderDAO.createOneOrder(userId, sku);

    res.status(201).json({
      message: "Purchase order created successfully",
      data: order
    });
  } catch (error) {
    // Catching the "No jet found" or "Already sold" errors from the DAO
    res.status(400).json({ message: error.message });
  }
};

// --- READ (History) ---
export const getOrders = async (req, res) => {
  try {
    // Admin sees all orders; Regular user sees only their own
    const orders = req.user.role === 'admin' 
      ? await OrderDAO.findAllOrdersAdmin() 
      : await OrderDAO.findOrdersByUser(req.user.id);

    res.status(200).json({
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order history", error: error.message });
  }
};

// --- UPDATE (Approve) ---
export const approveOrderBySerial = async (req, res) => {
  try {
    const { serialNumber } = req.body;

    if (!serialNumber) {
      return res.status(400).json({ message: "Serial number is required" });
    }

    const approvedOrder = await OrderDAO.updateOrderBySerial(serialNumber, 'completed');

    if (!approvedOrder) {
      return res.status(404).json({ message: `No order found with serial: ${serialNumber}` });
    }

    res.status(200).json({
      message: `Order ${serialNumber} has been approved and jet is now sold.`,
      data: approvedOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- DELETE ---
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Order ID format." });
    }

    const deleted = await OrderDAO.deleteOneOrder(id);

    if (!deleted) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ message: "Order deleted and jet re-listed as available." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};