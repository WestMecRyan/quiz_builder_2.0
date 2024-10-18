// server/HttpClient.js

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const githubOwner = 'WestMecRyan'; // Replace with your GitHub username or organization
const githubRepo = 'Quiz_Banks'; // Replace with your GitHub repository name
const githubEndpoint = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/`;
const personalAccessToken = process.env.QUIZ_ACCESS; // Ensure this is set in your .env file
const isProduction = process.env.NODE_ENV === 'production';

// Setting up axios to include your GitHub Personal Access Token for requests to GitHub
axios.interceptors.request.use(config => {
  if (config.url.startsWith(githubEndpoint)) {
    if (!personalAccessToken) {
      console.error("No personal access token available!");
      return Promise.reject(new Error("No personal access token set!"));
    }
    config.headers['Authorization'] = `token ${personalAccessToken}`;
    config.headers['Accept'] = 'application/vnd.github.v3+json';
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const getQuiz = async (quizPath) => {
  if (isProduction) {
    try {
      const response = await axios.get(`${githubEndpoint}${quizPath}`);
      const content = Buffer.from(response.data.content, 'base64').toString('utf8');
      return JSON.parse(content);
    } catch (error) {
      throw error;
    }
  } else {
    const localPath = path.resolve(__dirname, '../Quiz_Banks', quizPath);
    const data = await fs.readFile(localPath, 'utf8');
    return JSON.parse(data);
  }
}

const saveQuiz = async (quizData) => {
  const fileName = quizData.quizInfo.title.replace(/\s+/g, '_') + '.json';
  const filePath = `quizzes/${fileName}`;
  const content = Buffer.from(JSON.stringify(quizData, null, 2)).toString('base64');

  // Prepare payload for GitHub API
  const payload = {
    message: `Add quiz: ${quizData.quizInfo.title}`,
    content,
    branch: 'main', // Adjust if using a different branch
  };

  // Check if the file already exists
  try {
    const existingFile = await axios.get(`${githubEndpoint}${filePath}`);
    // If it exists, add the SHA to the payload
    payload.sha = existingFile.data.sha;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // File does not exist; proceed without adding SHA
    } else {
      // Other errors
      throw error;
    }
  }

  // Save or update the file in GitHub
  try {
    await axios.put(`${githubEndpoint}${filePath}`, payload);
  } catch (error) {
    throw error;
  }
}

const listQuizzes = async () => {
  if (isProduction) {
    try {
      const response = await axios.get(`${githubEndpoint}quizzes/`);
      // response.data is an array of file objects
      const quizzes = response.data.map(file => file.name);
      return quizzes;
    } catch (error) {
      throw error;
    }
  } else {
    // In development, list local quizzes
    const quizzesDir = path.resolve(__dirname, '../Quiz_Banks/quizzes');
    try {
      const files = await fs.readdir(quizzesDir);
      const quizzes = files.filter(file => file.endsWith('.json'));
      return quizzes;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {
  getQuiz,
  saveQuiz,
  listQuizzes
};
