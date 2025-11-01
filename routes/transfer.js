import express from "express";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const { toEmail, amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: "Invalid Amount" });

    const sender = await User.findById(req.user.id);
    const receiver = await User.findOne({ email: toEmail });

    if (!receiver) return res.status(404).json({ message: "Receiver not found" });
    if (sender.email === toEmail) return res.status(400).json({ message: "Self transfer not allowed" });

    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient Balance ❌" });
    }

    // ✅ Update Balances
    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();

    // ✅ Save Transaction Record
    const txn = new Transaction({
      from: sender._id,
      to: receiver._id,
      amount
    });
    await txn.save();

    res.json({ message: "Transfer Successful ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
