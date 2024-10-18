// server/routes.js

const express = require('express');
const router = express.Router();
const HttpClient = require('./HttpClient');

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

// GET /api/quizzes - List all quizzes
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await HttpClient.listQuizzes();
    res.json({ quizzes });
  } catch (error) {
    console.error('Error listing quizzes:', error);
    res.status(500).json({ error: 'Failed to list quizzes' });
  }
});

// GET /api/quizzes/:quizName - Get a specific quiz
router.get('/quizzes/:quizName', async (req, res) => {
  const quizName = req.params.quizName;
  try {
    const quizData = await HttpClient.getQuiz(`quizzes/${quizName}.json`);
    const { quizInfo, quizQuestions } = quizData;

    // Process shuffling
    const processedQuestions = quizQuestions.map(question => {
      const seed = hashString(question.questionName + quizInfo.seedExtension);
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

// POST /api/quizzes - Create a new quiz
router.post('/quizzes', async (req, res) => {
  const quizData = req.body;

  try {
    // Validate quizData
    if (!quizData.quizInfo || !quizData.quizQuestions) {
      return res.status(400).json({ error: 'Invalid quiz data' });
    }

    // Save the quiz to GitHub
    await HttpClient.saveQuiz(quizData);
    res.status(201).json({ message: 'Quiz saved successfully' });
  } catch (error) {
    console.error('Error saving quiz:', error);
    res.status(500).json({ error: 'Failed to save quiz' });
  }
});

module.exports = router;
