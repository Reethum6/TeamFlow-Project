const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 1. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ Connection error:', err));

// 2. DATA MODELS
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' }
});
const User = mongoose.model('User', UserSchema);

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['Todo', 'Doing', 'Done'], default: 'Todo' },
  createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', TaskSchema);

// 3. RBAC MIDDLEWARE (The Security Guard)
const isAdmin = (req, res, next) => {
  const role = req.headers['x-user-role'];
  if (role === 'Admin') next();
  else res.status(403).json({ message: "Forbidden: Admins only" });
};

// 4. AUTH ROUTES (Secured with Bcrypt)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'Member' // SECURITY: Everyone defaults to Member
    });
    await user.save();
    res.status(201).json({ message: "User registered securely!" });
  } catch (err) { 
    res.status(400).json({ message: "Registration failed. Email might exist." }); 
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (isMatch) res.json({ user });
    else res.status(401).json({ message: "Invalid credentials" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// 5. TASK ROUTES
app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post('/api/tasks', isAdmin, async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ error: "Failed to create task" }); }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(task);
  } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));