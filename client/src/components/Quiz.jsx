// App/client/src/components/Quiz.jsx

import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Question from './Question';
import { AuthContext } from '../contexts/AuthContext';

function Quiz() {
    const { quizName } = useParams();
    const [quizData, setQuizData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const { auth } = useContext(AuthContext);

    const fetchQuiz = async () => {
        try {
            if (auth.role === 'admin') {
                // Admin can access private quizzes
                const response = await axios.get(`/api/quizzes/${encodeURIComponent(quizName)}`);
                setQuizData(response.data);
            } else {
                // Users and guests can access open quizzes
                const response = await axios.get(`/api/open-quizzes/${encodeURIComponent(quizName)}`);
                setQuizData(response.data);
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
            alert('Failed to fetch quiz. Please check the server logs for more details.');
        }
    };

    useEffect(() => {
        fetchQuiz();
    }, [quizName, auth.role]);

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
