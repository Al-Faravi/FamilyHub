const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection String
const mongoURI = "mongodb+srv://shakawat2075_db_user:6s015P9VqQGOTIeR@cluster0.etmpqqp.mongodb.net/CousinsDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Success: MongoDB Connected!"))
    .catch(err => console.error("❌ Connection Error:", err));

// Schema definition
const Student = mongoose.model('Student', {
    name: String,
    blood_group: String,
    phone: String // নতুন একটি ফিল্ড যোগ করা হলো
});

// --- API ROUTES ---

// READ: সব ডাটা নিয়ে আসা
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE: নতুন ডাটা সেভ করা
app.post('/api/students', async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        await newStudent.save();
        res.status(201).json(newStudent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE: নির্দিষ্ট আইডি ধরে আপডেট করা
app.put('/api/students/:id', async (req, res) => {
    try {
        const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE: ডাটা মুছে ফেলা
app.delete('/api/students/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: "Data Deleted Successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));