// client/src/components/Question.jsx

import React from 'react';
import Option from './Option';

function Question({ question, selectedOption, onOptionChange, submitted }) {
  const handleChange = (event) => {
    const selectedIndex = parseInt(event.target.value, 10);
    onOptionChange(question.id, selectedIndex);
  };

  return (
    <div className="question" style={{ marginBottom: '1.5rem' }}>
      <h3>
        {question.questionName}: {question.question}
      </h3>
      {question.options.map((option, index) => {
        const isCorrect = submitted && index === question.correctIndex;
        const isSelected = selectedOption === index;
        return (
          <Option
            key={index}
            questionId={question.id}
            index={index}
            option={option}
            optionLang={question.optionLang}
            isCorrect={isCorrect}
            isSelected={isSelected}
            submitted={submitted}
            handleChange={handleChange}
          />
        );
      })}
      {submitted && (selectedOption === question.correctIndex) ? (
        <p style={{ color: 'green' }}>Correct!</p>
      ) : submitted && (selectedOption !== question.correctIndex) ? (
        <p style={{ color: 'red' }}>
          Incorrect. Correct answer: {question.correctIndex + 1}
        </p>
      ) : null}
    </div>
  );
}

export default Question;
