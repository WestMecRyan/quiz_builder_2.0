// App/server/routes.js

const express = require('express');
const router = express.Router();
const HttpClient = require('./HttpClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi'); // For validation

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Should be in .env
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 'admin_password_hash';
const USER_PASSWORD_HASHES = process.env.USER_PASSWORD_HASHES
  ? process.env.USER_PASSWORD_HASHES.split(',')
  : [];


// Utility functions for shuffling
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const character = str.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash &= hash; // Convert to 32bit integer
  }
  return hash;
}

function seededRandom(seed) {
  return Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);
}

function shuffleArray(array, seed) {
  const result = array.slice();
  let correctIndex = 0;
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
    if (j === correctIndex) {
      correctIndex = i;
    } else if (i === correctIndex) {
      correctIndex = j;
    }
  }
  return { shuffled: result, correctIndex };
}

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid access token' });
    req.user = user;
    next();
  });
};

// Login Route
router.post('/login', async (req, res) => {
  const { password } = req.body;

  // Basic validation using Joi
  const schema = Joi.object({
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate({ password });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Check if password matches admin password
    const isAdmin = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (isAdmin) {
      const payload = { role: 'admin' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
      return res.json({ token, role: 'admin' });
    }

    // Check if password matches any user password
    for (let i = 0; i < USER_PASSWORD_HASHES.length; i++) {
      const isUser = await bcrypt.compare(password, USER_PASSWORD_HASHES[i]);
      if (isUser) {
        const payload = { role: 'user' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
        return res.json({ token, role: 'user' });
      }
    }

    // If no match
    return res.status(401).json({ error: 'Invalid password' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Admin Routes - Protected
// GET /api/quizzes - List all private quizzes (Admin only)
router.get('/quizzes', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
}, async (req, res) => {
  try {
    const quizzes = await HttpClient.listQuizzes();
    res.json({ quizzes });
  } catch (error) {
    console.error('Error listing quizzes:', error);
    res.status(500).json({ error: 'Failed to list quizzes' });
  }
});

// GET /api/quizzes/:quizName - Get a specific private quiz (Admin only)
router.get('/quizzes/:quizName', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
}, async (req, res) => {
  const quizName = req.params.quizName;
  try {
    const quizData = await HttpClient.getQuiz(`${quizName}.json`);
    const { quizInfo, quizQuestions } = quizData;

    // Process shuffling
    const processedQuestions = quizQuestions.map(question => {
      const seed = hashString(question.questionName + quizInfo.seedExtension + quizInfo.version);
      const { shuffled, correctIndex } = shuffleArray(question.options, seed);
      return {
        id: question.id,
        questionName: question.questionName,
        question: question.question,
        options: shuffled,
        optionLang: question.optionLang,
        correctIndex: correctIndex
      };
    });

    res.json({ quizInfo, quizQuestions: processedQuestions });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// POST /api/quizzes - Create a new private quiz (Admin only)
router.post('/quizzes', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
}, async (req, res) => {
  const quizData = req.body;

  try {
    // Validate quizData
    if (!quizData.quizInfo || !quizData.quizQuestions) {
      return res.status(400).json({ error: 'Invalid quiz data' });
    }

    // Save the quiz to private quizzes
    await HttpClient.saveQuiz(quizData, false);
    res.status(201).json({ message: 'Quiz saved successfully' });
  } catch (error) {
    console.error('Error saving quiz:', error);
    res.status(500).json({ error: 'Failed to save quiz' });
  }
});

// PUT /api/quizzes/:quizName - Edit a private quiz (Admin only)
router.put('/quizzes/:quizName', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
}, async (req, res) => {
  const quizName = req.params.quizName;
  const updatedQuizData = req.body;

  try {
    // Validate updatedQuizData
    if (!updatedQuizData.quizInfo || !updatedQuizData.quizQuestions) {
      return res.status(400).json({ error: 'Invalid quiz data' });
    }

    // Save the updated quiz
    await HttpClient.saveQuiz(updatedQuizData, false);
    res.status(200).json({ message: 'Quiz updated successfully' });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// DELETE /api/quizzes/:quizName - Delete a private quiz (Admin only)
router.delete('/quizzes/:quizName', authenticateToken, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
}, async (req, res) => {
  const quizName = req.params.quizName;
  try {
    await HttpClient.deleteQuiz(`${quizName}.json`, false);
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// Public Routes - Accessible without authentication
// GET /api/open-quizzes - List all open quizzes
router.get('/open-quizzes', async (req, res) => {
  try {
    const quizzes = await HttpClient.listOpenQuizzes();
    res.json({ quizzes });
  } catch (error) {
    console.error('Error listing open quizzes:', error);
    res.status(500).json({ error: 'Failed to list open quizzes' });
  }
});

// GET /api/open-quizzes/:quizName - Get a specific open quiz
router.get('/open-quizzes/:quizName', async (req, res) => {
  const quizName = req.params.quizName;
  try {
    const quizData = await HttpClient.getOpenQuiz(`${quizName}.json`);
    const { quizInfo, quizQuestions } = quizData;

    // Process shuffling
    const processedQuestions = quizQuestions.map(question => {
      const seed = hashString(question.questionName + quizInfo.seedExtension + quizInfo.version);
      const { shuffled, correctIndex } = shuffleArray(question.options, seed);
      return {
        id: question.id,
        questionName: question.questionName,
        question: question.question,
        options: shuffled,
        optionLang: question.optionLang,
        correctIndex: correctIndex
      };
    });

    res.json({ quizInfo, quizQuestions: processedQuestions });
  } catch (error) {
    console.error('Error fetching open quiz:', error);
    res.status(500).json({ error: 'Failed to fetch open quiz' });
  }
});

module.exports = router;
