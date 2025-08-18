import React, { useState, useEffect, useRef } from 'react';
import type { TiltEvent, RoundResult } from '../types';
import { startTiltDetection } from '../utils/sensors';
import type { SensorHandle } from '../utils/sensors';
import { playCorrect, playPass, playTimeUp, playCountdown } from '../utils/sounds';
import { requestWakeLock } from '../utils/wakelock';
import type { WakeLockHandle } from '../utils/wakelock';

interface GameScreenProps {
  words: string[];
  durationSec: number;
  onFinish: (result: RoundResult) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ words, durationSec, onFinish }) => {
  // Game state
  const [countdown, setCountdown] = useState<number>(3); // 3,2,1 countdown
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(durationSec);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [passedWords, setPassedWords] = useState<string[]>([]);
  const [showOrientationGuide, setShowOrientationGuide] = useState<boolean>(false);
  
  // Refs for timers and handlers
  const timerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const sensorHandleRef = useRef<SensorHandle | null>(null);
  const wakeLockRef = useRef<WakeLockHandle | null>(null);
  
  // Current word to display
  const currentWord = words[currentWordIndex] || "Game Over";
  
  // Check and update orientation
  useEffect(() => {
    const checkOrientation = () => {
      // Check if we're in landscape mode (width > height or orientation angle is 90/270)
      const isLandscapeNow = window.innerWidth > window.innerHeight || 
                            (window.screen.orientation && 
                             [90, 270].includes(window.screen.orientation.angle));
      
      // Show orientation guide if not in landscape and game is about to start
      if (!isLandscapeNow && countdown > 0) {
        setShowOrientationGuide(true);
      } else {
        setShowOrientationGuide(false);
      }
    };
    
    // Check initial orientation
    checkOrientation();
    
    // Listen for orientation changes
    window.addEventListener('resize', checkOrientation);
    if (window.screen.orientation) {
      window.screen.orientation.addEventListener('change', checkOrientation);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkOrientation);
      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', checkOrientation);
      }
    };
  }, [countdown]);
  
  // Handle initial countdown
  useEffect(() => {
    if (countdown > 0) {
      // Play countdown beep
      playCountdown(countdown === 1);
      
      // Set timer for next countdown step
      countdownTimerRef.current = window.setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Start the game when countdown reaches 0
      setIsPlaying(true);
      setTimeRemaining(durationSec);
      
      // Acquire wake lock
      requestWakeLock().then(handle => {
        wakeLockRef.current = handle;
      });
    }
    
    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [countdown, durationSec]);
  
  // Handle game timer
  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = window.setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
        
        // Play countdown sounds for last 5 seconds
        if (timeRemaining <= 5 && timeRemaining > 1) {
          playCountdown(false);
        } else if (timeRemaining === 1) {
          playCountdown(true);
        }
      }, 1000);
    } else if (isPlaying && timeRemaining === 0) {
      // Game over
      finishGame();
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, timeRemaining]);
  
  // Set up tilt detection and keyboard controls
  useEffect(() => {
    if (isPlaying) {
      // Set up tilt detection
      sensorHandleRef.current = startTiltDetection({
        onTilt: handleTilt,
        neutralDeadzone: 10,
        threshold: 30
      });
      
      // Set up keyboard controls
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      // Clean up
      if (sensorHandleRef.current) {
        sensorHandleRef.current.stop();
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, currentWordIndex]);
  
  // Handle tilt events
  const handleTilt = (event: TiltEvent) => {
    if (!isPlaying || timeRemaining === 0) return;
    
    if (event.direction === 'up') {
      markCorrect();
    } else if (event.direction === 'down') {
      markPass();
    }
  };
  
  // Handle keyboard controls
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isPlaying || timeRemaining === 0) return;
    
    if (event.key === 'ArrowUp') {
      markCorrect();
    } else if (event.key === 'ArrowDown') {
      markPass();
    }
  };
  
  // Mark current word as correct
  const markCorrect = () => {
    if (currentWordIndex >= words.length) return;
    
    // Play sound
    playCorrect();
    
    // Vibrate if supported (short pulse)
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
    
    // Add to correct words
    const word = words[currentWordIndex];
    setCorrectWords(prev => [...prev, word]);
    
    // Move to next word
    setCurrentWordIndex(prev => prev + 1);
  };
  
  // Mark current word as passed
  const markPass = () => {
    if (currentWordIndex >= words.length) return;
    
    // Play sound
    playPass();
    
    // Vibrate if supported (two short pulses)
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
    
    // Add to passed words
    const word = words[currentWordIndex];
    setPassedWords(prev => [...prev, word]);
    
    // Move to next word
    setCurrentWordIndex(prev => prev + 1);
  };
  
  // Finish the game
  const finishGame = () => {
    // Play time up sound
    playTimeUp();
    
    // Vibrate if supported (long pulse)
    if ('vibrate' in navigator) {
      navigator.vibrate(500);
    }
    
    // Clean up
    if (sensorHandleRef.current) {
      sensorHandleRef.current.stop();
    }
    
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
    }
    
    // Set playing to false
    setIsPlaying(false);
    
    // Call onFinish with results
    onFinish({
      correct: correctWords,
      passed: passedWords,
      durationSec,
      deck: 'animals' // This should be passed from parent or determined from words
    });
  };
  
  // Format time as M:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render orientation guide
  if (showOrientationGuide) {
    return (
      <div className="fixed inset-0 bg-purple-900 flex flex-col items-center justify-center p-6 text-white z-50">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Rotate Your Device</h2>
          <div className="flex justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 animate-[rotateDeviceHint_2s_ease-in-out_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-lg">
            Please rotate to landscape mode for the best experience
          </p>
        </div>
        <button 
          onClick={() => setShowOrientationGuide(false)}
          className="bg-white text-purple-900 py-3 px-6 rounded-full font-bold"
        >
          Continue Anyway
        </button>
      </div>
    );
  }
  
  // Render countdown
  if (countdown > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-purple-600">
        <div className="text-white text-9xl font-bold animate-pulse">
          {countdown}
        </div>
      </div>
    );
  }
  
  // Render game screen
  return (
    <div className={`flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 p-4 text-white
      ${timeRemaining <= 5 && timeRemaining > 0 ? 'animate-pulse' : ''}`}>
      
      {/* Header with score and timer */}
      <div className="w-full flex justify-between items-center py-2">
        <div className="text-xl font-bold">
          Score: {correctWords.length}
        </div>
        <div className={`text-2xl font-bold ${timeRemaining <= 5 ? 'text-red-300' : ''}`}>
          {formatTime(timeRemaining)}
        </div>
      </div>
      
      {/* Current word */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="text-5xl sm:text-7xl md:text-8xl font-bold text-center px-4 py-8 bg-white bg-opacity-10 rounded-xl shadow-lg transform rotate-180">
          {currentWord}
        </div>
      </div>
      
      {/* Fallback controls */}
      <div className="w-full flex justify-between mt-4 mb-8">
        <button
          onClick={markPass}
          className="flex-1 bg-red-500 text-white py-4 mx-2 rounded-xl text-xl font-bold active:bg-red-600"
        >
          PASS
        </button>
        <button
          onClick={markCorrect}
          className="flex-1 bg-green-500 text-white py-4 mx-2 rounded-xl text-xl font-bold active:bg-green-600"
        >
          CORRECT
        </button>
      </div>
      
      {/* Instructions */}
      <div className="text-center text-sm opacity-70 mb-2">
        <p>Tilt up for correct, down for pass</p>
        <p>Or use arrow keys: ↑ correct, ↓ pass</p>
      </div>
    </div>
  );
};

export default GameScreen;
