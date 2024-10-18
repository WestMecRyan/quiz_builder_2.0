// client/src/components/Option.jsx

import React from 'react';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function Option({ questionId, index, option, optionLang, isCorrect, isSelected, submitted, handleChange }) {
  const optionId = `q${questionId}o${index}`;
  
  let labelStyle = {};
  if (submitted) {
    if (isCorrect) {
      labelStyle = { backgroundColor: '#d4edda' }; // green background for correct
    } else if (isSelected && !isCorrect) {
      labelStyle = { backgroundColor: '#f8d7da' }; // red background for incorrect
    }
  }

  return (
    <div className="option" style={{ marginBottom: '0.5rem' }}>
      <input
        type="radio"
        id={optionId}
        name={`question${questionId}`}
        value={index}
        checked={isSelected}
        onChange={handleChange}
        disabled={submitted}
      />
      <label htmlFor={optionId} style={{ ...labelStyle, cursor: submitted ? 'default' : 'pointer', display: 'block', padding: '0.5rem', borderRadius: '4px' }}>
        <SyntaxHighlighter language={optionLang} style={atomOneDark}>
          {option}
        </SyntaxHighlighter>
      </label>
    </div>
  );
}

export default Option;
