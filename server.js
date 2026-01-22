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

// ১. ফ্যামিলি মেম্বার মডেল (আগে Student ছিল, এখন Member হিসেবে উন্নত করা হয়েছে)
const Member = mongoose.model('Member', {
    name: { type: String, required: true },
    blood_group: String,
    phone: String,
    dob: String,       // জন্মদিন (Format: YYYY-MM-DD)
    relation: String,  // সম্পর্ক (যেমন: Cousin, Uncle)
    address: String
});

// ২. নোটিশ বোর্ড মডেল
const Notice = mongoose.model('Notice', {
    title: String,
    content: String,
    type: { type: String, default: 'normal' }, // normal অথবা urgent
    date: { type: Date, default: Date.now }
});

// --- API ROUTES (Member/Student) ---

// READ: সব মেম্বার নিয়ে আসা (home.html-এর কাউন্টারের জন্য জরুরি)
app.get('/api/students', async (req, res) => {
    try {
        const members = await Member.find();
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE: নতুন মেম্বার যোগ করা
app.post('/api/students', async (req, res) => {
    try {
        const newMember = new Member(req.body);
        await newMember.save();
        res.status(201).json(newMember);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE: মেম্বার তথ্য আপডেট করা
app.put('/api/students/:id', async (req, res) => {
    try {
        const updated = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE: মেম্বার মুছে ফেলা
app.delete('/api/students/:id', async (req, res) => {
    try {
        await Member.findByIdAndDelete(req.params.id);
        res.json({ message: "Member Deleted Successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- API ROUTES (Notice Board) ---

// সব নোটিশ দেখা
app.get('/api/notices', async (req, res) => {
    try {
        const notices = await Notice.find().sort({ date: -1 }); // নতুন নোটিশ আগে দেখাবে
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// নতুন নোটিশ পাবলিশ করা
app.post('/api/notices', async (req, res) => {
    try {
        const newNotice = new Notice(req.body);
        await newNotice.save();
        res.status(201).json(newNotice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// পুরনো নোটিশ ডিলিট করা
app.delete('/api/notices/:id', async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ message: "Notice Removed" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- Server Start ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📌 Member API: http://localhost:${PORT}/api/students`);
    console.log(`📌 Notice API: http://localhost:${PORT}/api/notices`);
});