// App/client/src/components/QuizList.jsx

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function QuizList() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { auth } = useContext(AuthContext);

    const fetchQuizzes = async () => {
        try {
            if (auth.role === 'admin') {
                // Fetch all private quizzes
                const response = await axios.get('/api/quizzes');
                setQuizzes(response.data.quizzes);
            } else {
                // Fetch open quizzes
                const response = await axios.get('/api/open-quizzes');
                setQuizzes(response.data.quizzes);
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            alert('Failed to fetch quizzes. Please check the server logs for more details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, [auth.role]);

    if (loading) {
        return <div>Loading quizzes...</div>;
    }

    return (
        <div>
            <h2>Available Quizzes</h2>
            {quizzes.length === 0 ? (
                <p>No quizzes available.</p>
            ) : (
                <ul>
                    {quizzes.map((quizName) => (
                        <li key={quizName}>
                            <Link to={`/quizzes/${encodeURIComponent(quizName.replace('.json', ''))}`}>
                                {quizName.replace(/_/g, ' ').replace('.json', '')}
                            </Link>
                            {auth.role === 'admin' && (
                                <>
                                    {' '}|{' '}
                                    <Link to={`/quizzes/${encodeURIComponent(quizName.replace('.json', ''))}/edit`}>Edit</Link>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default QuizList;

