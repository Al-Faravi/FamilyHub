const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- MongoDB Connection ---
const mongoURI = "mongodb+srv://shakawat2075_db_user:6s015P9VqQGOTIeR@cluster0.etmpqqp.mongodb.net/CousinsDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Success: MongoDB Connected!"))
    .catch(err => console.error("❌ Connection Error:", err));

// --- Database Models ---

// ১. ফ্যামিলি মেম্বার মডেল (মেম্বার লিস্ট এখান থেকেই ড্রপডাউনে যাবে)
const Member = mongoose.model('Member', {
    name: { type: String, required: true },
    blood_group: String,
    phone: String,
    dob: String,       // জন্মদিন (Format: YYYY-MM-DD)
    relation: String,  
    address: String
});

// ২. নোটিশ বোর্ড মডেল
const Notice = mongoose.model('Notice', {
    title: { type: String, required: true },
    content: String,
    type: { type: String, default: 'normal' }, // normal অথবা urgent
    date: { type: Date, default: Date.now }
});

// ৩. ফ্যামিলি ফান্ড ও খরচ মডেল
const Transaction = mongoose.model('Transaction', {
    memberName: { type: String, required: true }, // মেম্বার নাম এখন বাধ্যতামূলক
    amount: { type: Number, required: true, min: 0 }, // নেগেটিভ অ্যামাউন্ট ঠেকাবে
    type: { type: String, enum: ['Deposit', 'Expense'], required: true }, 
    description: String,
    date: { type: Date, default: Date.now }
});

// --- API ROUTES (Member Management) ---

app.get('/api/students', async (req, res) => {
    try {
        const members = await Member.find().sort({ name: 1 }); // নাম অনুযায়ী সাজানো (A-Z)
        res.json(members);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const newMember = new Member(req.body);
        await newMember.save();
        res.status(201).json(newMember);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const updated = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Member not found" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        const deleted = await Member.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Member not found" });
        res.json({ message: "Member Deleted Successfully" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// --- API ROUTES (Notice Board) ---

app.get('/api/notices', async (req, res) => {
    try {
        const notices = await Notice.find().sort({ date: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/notices', async (req, res) => {
    try {
        const newNotice = new Notice(req.body);
        await newNotice.save();
        res.status(201).json(newNotice);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// --- API ROUTES (Family Fund & Expenses) ---

app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        // নতুন লেনদেন সেভ করার আগে অ্যামাউন্ট ভ্যালিডেশন
        if (req.body.amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than zero" });
        }
        const newTx = new Transaction(req.body);
        await newTx.save();
        res.status(201).json(newTx);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// অটোমেটিক ক্যালকুলেশন রুট
app.get('/api/fund-summary', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        let totalDeposit = 0;
        let totalExpense = 0;

        transactions.forEach(tx => {
            if (tx.type === 'Deposit') totalDeposit += tx.amount;
            else if (tx.type === 'Expense') totalExpense += tx.amount;
        });

        res.json({
            balance: totalDeposit - totalExpense, // অবশিষ্ট টাকা
            deposit: totalDeposit,               // মোট জমা
            expense: totalExpense,               // মোট খরচ
            count: transactions.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const deleted = await Transaction.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "Transaction Record Deleted" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});