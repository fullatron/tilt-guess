import React, { useState } from 'react';
import type { RoundResult } from '../types';

interface ResultsScreenProps {
  result: RoundResult;
  onPlayAgain: () => void;
  onHome: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, onPlayAgain, onHome }) => {
  const [showCorrect, setShowCorrect] = useState(false);
  const [showPassed, setShowPassed] = useState(false);
  
  const score = result.correct.length;
  const totalAttempted = score + result.passed.length;
  
  // Format deck name for display
  const formatDeckName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };
  
  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gradient-to-b from-blue-500 to-purple-600 text-white">
      <div className="text-center mb-8 w-full max-w-md">
        <h1 className="text-4xl font-bold mb-2">Round Complete!</h1>
        
        <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-6">
          <div className="text-6xl font-bold mb-2">{score}</div>
          <div className="text-xl opacity-80">
            {totalAttempted > 0 
              ? `${Math.round((score / totalAttempted) * 100)}% correct` 
              : 'No words attempted'}
          </div>
          <div className="text-sm mt-2 opacity-70">
            {formatDeckName(result.deck)} • {result.durationSec} seconds
          </div>
        </div>
        
        {/* Correct Words */}
        <div className="mb-4 w-full">
          <button 
            onClick={() => setShowCorrect(!showCorrect)}
            className="flex items-center justify-between w-full bg-green-500 bg-opacity-30 p-4 rounded-lg hover:bg-opacity-40 transition-all"
          >
            <span className="font-bold">Correct ({result.correct.length})</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform ${showCorrect ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showCorrect && result.correct.length > 0 && (
            <div className="mt-2 bg-white bg-opacity-10 rounded-lg p-4 max-h-48 overflow-y-auto">
              <ul className="space-y-2">
                {result.correct.map((word, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {word}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {showCorrect && result.correct.length === 0 && (
            <div className="mt-2 bg-white bg-opacity-10 rounded-lg p-4 text-center">
              No correct words
            </div>
          )}
        </div>
        
        {/* Passed Words */}
        <div className="mb-6 w-full">
          <button 
            onClick={() => setShowPassed(!showPassed)}
            className="flex items-center justify-between w-full bg-red-500 bg-opacity-30 p-4 rounded-lg hover:bg-opacity-40 transition-all"
          >
            <span className="font-bold">Passed ({result.passed.length})</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform ${showPassed ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showPassed && result.passed.length > 0 && (
            <div className="mt-2 bg-white bg-opacity-10 rounded-lg p-4 max-h-48 overflow-y-auto">
              <ul className="space-y-2">
                {result.passed.map((word, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {word}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {showPassed && result.passed.length === 0 && (
            <div className="mt-2 bg-white bg-opacity-10 rounded-lg p-4 text-center">
              No passed words
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button 
          onClick={onPlayAgain}
          className="bg-white text-purple-600 py-4 px-8 rounded-full text-xl font-bold shadow-lg hover:bg-opacity-90 active:transform active:scale-95 transition-all"
        >
          Play Again
        </button>
        
        <button 
          onClick={onHome}
          className="bg-purple-700 bg-opacity-50 text-white py-4 px-8 rounded-full text-xl font-bold shadow-lg hover:bg-opacity-70 active:transform active:scale-95 transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
