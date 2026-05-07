const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');

// CREATE A PROJECT
router.post('/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE A TASK
router.post('/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET ALL TASKS
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo').populate('project');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;