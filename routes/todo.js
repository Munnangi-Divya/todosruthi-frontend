const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');
const { createTodoSchema, updateTodoSchema } = require('../validators/todoValidators');

// GET /api/todos?filter=all|completed|pending&search=&page=1&limit=10
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter = 'all', search = '', page = 1, limit = 0 } = req.query;

    const query = { user: userId };
    if (filter === 'completed') query.isCompleted = true;
    if (filter === 'pending') query.isCompleted = false;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = Math.max(0, (parseInt(page) - 1)) * (parseInt(limit) || 0);

    const q = Todo.find(query).sort({ createdAt: -1 });
    if (limit) q.skip(skip).limit(parseInt(limit));

    const todos = await q.exec();
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/todos
router.post('/', auth, async (req, res) => {
  try {
    const { error } = createTodoSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const todo = new Todo({ user: req.user.id, ...req.body });
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/todos/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { error } = updateTodoSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    let todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    if (todo.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    Object.assign(todo, req.body);
    await todo.save();
    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/todos/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    if (todo.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await todo.remove();
    res.json({ message: 'Todo removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/todos/stats - simple analytics: counts
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const total = await Todo.countDocuments({ user: userId });
    const completed = await Todo.countDocuments({ user: userId, isCompleted: true });
    const pending = total - completed;
    res.json({ total, completed, pending });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const completed = await Todo.countDocuments({ user: userId, isCompleted: true });
    const pending = await Todo.countDocuments({ user: userId, isCompleted: false });
    res.json({ completed, pending });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
    
module.exports = router;

