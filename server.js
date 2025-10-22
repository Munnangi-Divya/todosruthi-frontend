


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// initialize app
const app = express();

// config
dotenv.config();

// connect database
connectDB();

// middlewares
const allowedOrigins = [
  'https://todosruthi-frontend1-94a7.vercel.app',
  'http://localhost:3000' // for local dev
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/todos', require('./routes/todo'));

// health route
app.get('/', (req, res) => {
  res.send('Todo API is running...');
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
