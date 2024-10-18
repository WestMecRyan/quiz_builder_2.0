// client/src/components/QuizCreator.jsx

import React, { useState } from 'react';
import axios from 'axios';

function QuizCreator() {
  const [quizInfo, setQuizInfo] = useState({
    title: '',
    date: '',
    description: '',
    seedExtension: 'default_seed', // or allow user to set
    version: 'A', // or allow user to set
  });

  const [questions, setQuestions] = useState([]);

  const handleQuizInfoChange = (e) => {
    const { name, value } = e.target;
    setQuizInfo(prev => ({ ...prev, [name]: value }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      question: '',
      questionName: String.fromCharCode(65 + questions.length), // A, B, C...
      options: ['', '', '', ''],
      optionLang: 'language-js', // default language
      correctIndex: 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectIndexChange = (qIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].correctIndex = parseInt(value, 10);
    setQuestions(updatedQuestions);
  };

  const handleOptionLangChange = (qIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].optionLang = value;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    // Update question IDs and names
    updatedQuestions.forEach((q, i) => {
      q.id = i + 1;
      q.questionName = String.fromCharCode(65 + i);
    });
    setQuestions(updatedQuestions);
  };

  const handleSaveQuiz = async () => {
    const quizData = {
      quizInfo,
      quizQuestions: questions,
    };

    try {
      const response = await axios.post('/api/quizzes', quizData);
      alert('Quiz saved successfully!');
      // Reset form
      setQuizInfo({
        title: '',
        date: '',
        description: '',
        seedExtension: 'default_seed',
        version: 'A',
      });
      setQuestions([]);
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz.');
    }
  };

  return (
    <div>
      <h2>Create a New Quiz</h2>
      <div style={{ marginBottom: '1rem' }}>
        <h3>Quiz Information</h3>
        <input
          type="text"
          name="title"
          value={quizInfo.title}
          onChange={handleQuizInfoChange}
          placeholder="Quiz Title"
          required
          style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
        />
        <input
          type="date"
          name="date"
          value={quizInfo.date}
          onChange={handleQuizInfoChange}
          placeholder="Quiz Date"
          required
          style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
        />
        <textarea
          name="description"
          value={quizInfo.description}
          onChange={handleQuizInfoChange}
          placeholder="Quiz Description"
          required
          style={{ display: 'block', marginBottom: '0.5rem', width: '100%', height: '100px' }}
        />
        <input
          type="text"
          name="seedExtension"
          value={quizInfo.seedExtension}
          onChange={handleQuizInfoChange}
          placeholder="Seed Extension"
          required
          style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
        />
        <select
          name="version"
          value={quizInfo.version}
          onChange={handleQuizInfoChange}
          style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
        >
          <option value="A">Version A</option>
          <option value="B">Version B</option>
          {/* Add more versions as needed */}
        </select>
      </div>
      <div>
        <h3>Questions</h3>
        {questions.map((question, qIndex) => (
          <div key={question.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4>Question {question.questionName}</h4>
              <button onClick={() => removeQuestion(qIndex)} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '0.5rem' }}>Remove</button>
            </div>
            <input
              type="text"
              value={question.question}
              onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
              placeholder="Enter question text"
              required
              style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
            />
            <div>
              <h5>Options</h5>
              {question.options.map((option, oIndex) => (
                <div key={oIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span>{oIndex + 1}.</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                    required
                    style={{ marginLeft: '0.5rem', flexGrow: 1 }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: '0.5rem' }}>
                <label>Correct Option:</label>
                <select
                  value={question.correctIndex}
                  onChange={(e) => handleCorrectIndexChange(qIndex, e.target.value)}
                  style={{ marginLeft: '0.5rem' }}
                >
                  {question.options.map((_, oIndex) => (
                    <option key={oIndex} value={oIndex}>{oIndex + 1}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <label>Option Language:</label>
                <select
                  value={question.optionLang}
                  onChange={(e) => handleOptionLangChange(qIndex, e.target.value)}
                  style={{ marginLeft: '0.5rem' }}
                >
                  <option value="language-js">JavaScript</option>
                  <option value="language-html">HTML</option>
                  <option value="language-css">CSS</option>
                  <option value="language-text">Text</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        <button onClick={addQuestion} style={{ marginBottom: '1rem' }}>Add Question</button>
      </div>
      <button onClick={handleSaveQuiz} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>Save Quiz</button>
    </div>
  );
}

export default QuizCreator;
