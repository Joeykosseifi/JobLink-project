const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Sign In Route
app.post('/api/auth/signin', (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // In a real application, you would:
  // 1. Check if the email is already registered
  // 2. Hash the password
  // 3. Save the user to the database
  // 4. Generate a JWT token

  // For now, we'll just return a success message with a mock token
  res.status(201).json({
    message: 'User registered successfully',
    token: 'mock-jwt-token',
    user: {
      username,
      email
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 