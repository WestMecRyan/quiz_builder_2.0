import React, { useState } from 'react';
import axios from 'axios';

function QuizCreator() {
  const [quizInfo, setQuizInfo] = useState({
    title: '',
    date: '',
    description: '',
  });
  const [questions, setQuestions] = useState([]);

  const handleQuizInfoChange = (e) => {
    setQuizInfo({ ...quizInfo, [e.target.name]: e.target.value });
  };

  const addQuestion = (question) => {
    setQuestions([...questions, question]);
  };

  const handleSaveQuiz = async () => {
    const quizData = {
      quizInfo,
      quizQuestions: questions,
    };

    try {
      await axios.post('/api/quizzes', quizData);
      alert('Quiz saved successfully!');
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz.');
    }
  };

  return (
    <div>
      <h2>Create a New Quiz</h2>
      {/* Render QuizInfoForm */}
      {/* Render QuestionForm */}
      <button onClick={handleSaveQuiz}>Save Quiz</button>
    </div>
  );
}

export default QuizCreator;
