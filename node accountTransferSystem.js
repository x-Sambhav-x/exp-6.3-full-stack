/**
 * Account Transfer System with Balance Validation
 * -----------------------------------------------
 * Single-file Node.js project using Express.
 * Features:
 *  - Create user accounts
 *  - Check balances
 *  - Transfer between accounts with validation
 *  - In-memory datastore (no DB setup)
 *
 * Run:  node accountTransferSystem.js
 * Test: Use Postman or curl as shown at bottom
 */

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// ==============================
// In-Memory Data Store
// ==============================
const accounts = [
  { id: 1, name: "Alice", balance: 1000 },
  { id: 2, name: "Bob", balance: 500 },
  { id: 3, name: "Charlie", balance: 750 },
];

// Utility: Find account by ID
function findAccount(id) {
  return accounts.find((a) => a.id === parseInt(id));
}

// ==============================
// Routes
// ==============================

// Root
app.get("/", (req, res) => {
  res.send("💳 Account Transfer System API is running...");
});

// Get all accounts
app.get("/accounts", (req, res) => {
  res.json(accounts);
});

// Get balance by account ID
app.get("/accounts/:id/balance", (req, res) => {
  const acc = findAccount(req.params.id);
  if (!acc) return res.status(404).json({ error: "Account not found" });
  res.json({ id: acc.id, name: acc.name, balance: acc.balance });
});

// Create new account
app.post("/accounts", (req, res) => {
  const { name, balance } = req.body;
  if (!name || balance == null || balance < 0)
    return res.status(400).json({ error: "Invalid name or balance" });

  const newAcc = {
    id: accounts.length + 1,
    name,
    balance: Number(balance),
  };
  accounts.push(newAcc);
  res.status(201).json(newAcc);
});

// Transfer endpoint
app.post("/transfer", (req, res) => {
  const { fromId, toId, amount } = req.body;
  const amt = Number(amount);

  if (!fromId || !toId || isNaN(amt) || amt <= 0)
    return res.status(400).json({ error: "Invalid input" });

  const fromAcc = findAccount(fromId);
  const toAcc = findAccount(toId);

  if (!fromAcc || !toAcc)
    return res.status(404).json({ error: "One or both accounts not found" });

  if (fromAcc.id === toAcc.id)
    return res.status(400).json({ error: "Cannot transfer to same account" });

  if (fromAcc.balance < amt)
    return res.status(400).json({ error: "Insufficient balance" });

  // Perform transaction
  fromAcc.balance -= amt;
  toAcc.balance += amt;

  res.json({
    message: "✅ Transfer successful",
    from: { id: fromAcc.id, balance: fromAcc.balance },
    to: { id: toAcc.id, balance: toAcc.balance },
  });
});

// ==============================
// Start Server
// ==============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ==============================
// Example curl commands
// ==============================
/*
# View all accounts
curl http://localhost:3000/accounts

# Check balance
curl http://localhost:3000/accounts/1/balance

# Add new account
curl -X POST http://localhost:3000/accounts \
     -H "Content-Type: application/json" \
     -d '{"name":"David","balance":300}'

# Transfer from Alice(1) to Bob(2)
curl -X POST http://localhost:3000/transfer \
     -H "Content-Type: application/json" \
     -d '{"fromId":1,"toId":2,"amount":200}'
*/
