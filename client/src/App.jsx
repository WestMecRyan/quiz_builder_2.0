// client/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import QuizCreator from './components/QuizCreator';
import Quiz from './components/Quiz';
import QuizList from './components/QuizList'; // Component to list available quizzes

function App() {
  return (
    <Router>
      <div className="container" style={{ padding: '1rem' }}>
        <nav>
          <ul style={{ display: 'flex', listStyle: 'none', gap: '1rem' }}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/create">Create Quiz</Link></li>
            <li><Link to="/quizzes">Take Quiz</Link></li>
          </ul>
        </nav>
        <hr />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<QuizCreator />} />
          <Route path="/quizzes" element={<QuizList />} />
          <Route path="/quizzes/:quizName" element={<Quiz />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  return <h2>Welcome to the Quiz App</h2>;
}

export default App;
