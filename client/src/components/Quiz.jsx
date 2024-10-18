// client/src/components/Quiz.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Question from './Question';

function Quiz() {
  const { quizName } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`/api/quizzes/${encodeURIComponent(quizName)}`);
      setQuizData(response.data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [quizName]);

  const handleOptionChange = (questionId, selectedIndex) => {
    setAnswers({
      ...answers,
      [questionId]: selectedIndex,
    });
  };

  const handleSubmit = () => {
    if (!quizData) return;
    let calculatedScore = 0;
    quizData.quizQuestions.forEach(question => {
      if (answers[question.id] === question.correctIndex) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    setSubmitted(true);
  };

  if (!quizData) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div>
      <h1>{quizData.quizInfo.title}</h1>
      <p>{quizData.quizInfo.description}</p>
      {quizData.quizQuestions.map(question => (
        <Question
          key={question.id}
          question={question}
          selectedOption={answers[question.id]}
          onOptionChange={handleOptionChange}
          submitted={submitted}
        />
      ))}
      {!submitted ? (
        <button onClick={handleSubmit} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>Submit Quiz</button>
      ) : (
        <div>
          <h2>Your Score: {score} / {quizData.quizQuestions.length}</h2>
        </div>
      )}
    </div>
  );
}

export default Quiz;
