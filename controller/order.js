import { createOneOrder, updateOrderBySerial } from '../daos/order'

export const createPurchase = async (req, res) => {
  try {
    const { jetId } = req.body;
    const userId = req.user.id; // Extracted from the JWT by 'protect' middleware

    if (!jetId) {
      return res.status(400).json({ message: "jetId is required to make a purchase." });
    }

    const order = await createOneOrder(userId, jetId);

    res.status(201).json({
      message: "Purchase order created successfully",
      orderDetails: order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveOrderBySerial = async (req, res) => {
    try {
        const { serialNumber } = req.body; // Getting it from the JSON body

        if (!serialNumber) {
            return res.status(400).json({ message: "Serial number is required" });
        }

        const approvedOrder = await updateOrderBySerial(serialNumber, 'completed');

        if (!approvedOrder) {
            return res.status(404).json({ message: "No order found with that serial number" });
        }

        res.status(200).json({
            message: `Order ${serialNumber} has been approved.`,
            order: approvedOrder
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
