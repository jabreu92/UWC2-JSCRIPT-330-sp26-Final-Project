import * as OrderDAO from '../daos/order.js';
import mongoose from 'mongoose';

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

export const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await OrderDAO.findOrderByNumber(orderNumber);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Security Check: If not an admin, check if this order belongs to the user
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied. You can only view your own orders." });
    }

    res.status(200).json({ data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status } = req.body; // e.g., { "status": "completed" }

    const updated = await OrderDAO.updateOrderStatus(orderNumber, status);
    if (!updated) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order updated", data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    
    const { orderNumber } = req.params;
    const deleted = await OrderDAO.deleteOrderByNum(orderNumber);
    if (!deleted) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: `Order ${orderNumber} deleted and jet re-listed.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};