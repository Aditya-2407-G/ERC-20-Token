"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const port = 3000;
app.use(body_parser_1.default.json());
let balances = {};
let allowances = {};
app.post('/create', (req, res) => {
    const { userId, initialBalance } = req.body;
    if (balances[userId]) {
        return res.status(400).send("Account already exists!");
    }
    balances[userId] = initialBalance;
    res.send(`Account for ${userId} created with balance: ${initialBalance}`);
});
app.post('/transfer', (req, res) => {
    const { fromUserId, toUserId, amount } = req.body;
    if (!balances[fromUserId] || !balances[toUserId]) {
        return res.status(400).send("Account doesn't exist!");
    }
    if (balances[fromUserId] < amount) {
        return res.status(400).send("Insufficient funds!");
    }
    balances[fromUserId] -= amount;
    balances[toUserId] += amount;
    res.send(`Transferred ${amount} tokens from ${fromUserId} to ${toUserId}`);
});
app.post('/approve', (req, res) => {
    const { ownerId, spenderId, amount } = req.body;
    if (!balances[ownerId]) {
        return res.status(400).send("Account doesn't exist!");
    }
    if (!allowances[ownerId]) {
        allowances[ownerId] = {};
    }
    allowances[ownerId][spenderId] = amount;
    res.send(`${ownerId} has approved ${spenderId} to spend ${amount} tokens on their behalf.`);
});
app.post('/transferFrom', (req, res) => {
    const { fromUserId, toUserId, spenderId, amount } = req.body;
    if (!balances[fromUserId] || !balances[toUserId]) {
        return res.status(400).send("Account doesn't exist!");
    }
    const allowedAmount = allowances[fromUserId] && allowances[fromUserId][spenderId];
    if (!allowedAmount || allowedAmount < amount) {
        return res.status(400).send("Insufficient allowance!");
    }
    if (balances[fromUserId] < amount) {
        return res.status(400).send("Insufficient funds!");
    }
    balances[fromUserId] -= amount;
    balances[toUserId] += amount;
    allowances[fromUserId][spenderId] -= amount;
    res.send(`${spenderId} transferred ${amount} tokens from ${fromUserId} to ${toUserId}`);
});
app.get('/balance/:userId', (req, res) => {
    const balance = balances[req.params.userId];
    if (balance === undefined) {
        return res.status(404).send("Account not found!");
    }
    res.send(`Balance of ${req.params.userId}: ${balance}`);
});
app.listen(port, () => {
    console.log(`Token simulator app listening on http://localhost:${port}`);
});
