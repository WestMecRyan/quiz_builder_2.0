// App/client/src/App.jsx

import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import QuizCreator from "./components/QuizCreator";
import Quiz from "./components/Quiz";
import QuizList from "./components/QuizList";
import Home from "./components/Home";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import { AuthContext } from "./contexts/AuthContext";

function App() {
  const { auth, logout } = useContext(AuthContext);

  return (
    <Router>
      <div className="container" style={{ padding: "1rem" }}>
        <nav>
          <ul style={{ display: "flex", listStyle: "none", gap: "1rem" }}>
            <li>
              <Link to="/">Home</Link>
            </li>
            {auth.role === "admin" && (
              <li>
                <Link to="/create">Create Quiz</Link>
              </li>
            )}
            <li>
              <Link to="/quizzes">Take Quiz</Link>
            </li>
            {!auth.token ? (
              <li>
                <Link to="/login">Login</Link>
              </li>
            ) : (
              <li>
                <button
                  onClick={logout}
                  style={{
                    background: "none",
                    border: "none",
                    color: "blue",
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
        <hr />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/create"
            element={
              <PrivateRoute roles={["admin"]}>
                <QuizCreator />
              </PrivateRoute>
            }
          />
          <Route path="/quizzes" element={<QuizList />} />
          <Route path="/quizzes/:quizName" element={<Quiz />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
