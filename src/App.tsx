import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import SettingsPanel from './components/SettingsPanel';
import PermissionPrompt from './components/PermissionPrompt';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import type { Settings, DeckId, RoundResult } from './types';
import { setMuted } from './utils/sounds';
import ANIMALS from './data/animals';
import ACTIONS from './data/actions';

// App screens
type Screen = 'home' | 'settings' | 'permission' | 'game' | 'results';

// Default settings
const DEFAULT_SETTINGS: Settings = {
  durationSec: 60,
  deck: 'animals'
};

function App() {
  // Current screen
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  
  // Game settings
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  
  // Sound settings
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Game results
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  
  // Last score for display
  const [lastScore, setLastScore] = useState<number | null>(null);
  
  // Words for current game
  const [gameWords, setGameWords] = useState<string[]>([]);
  
  // Load settings and state on mount
  useEffect(() => {
    // Load settings
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
    
    // Load mute state
    const savedMuted = localStorage.getItem('muted');
    const isMutedSaved = savedMuted === 'true';
    setIsMuted(isMutedSaved);
    setMuted(isMutedSaved);
    
    // Load last score
    const savedScore = localStorage.getItem('lastScore');
    if (savedScore) {
      try {
        setLastScore(parseInt(savedScore, 10));
      } catch (e) {
        console.error('Failed to parse saved score', e);
      }
    }
  }, []);
  
  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);
  
  // Save mute state when it changes
  useEffect(() => {
    localStorage.setItem('muted', isMuted.toString());
    setMuted(isMuted);
  }, [isMuted]);
  
  // Get words for the selected deck
  const getWordsForDeck = (deck: DeckId): string[] => {
    return deck === 'animals' ? ANIMALS : ACTIONS;
  };
  
  // Shuffle array (Fisher-Yates algorithm)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Start a new game
  const startGame = () => {
    // Shuffle words from selected deck
    const deckWords = getWordsForDeck(settings.deck);
    setGameWords(shuffleArray(deckWords));
    
    // Show permission screen
    setCurrentScreen('permission');
  };
  
  // Handle game finish
  const handleGameFinish = (result: RoundResult) => {
    // Save result
    setLastResult(result);
    
    // Save score to localStorage
    const score = result.correct.length;
    localStorage.setItem('lastScore', score.toString());
    setLastScore(score);
    
    // Show results screen
    setCurrentScreen('results');
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Handle settings change
  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
  };
  
  // Render current screen
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Home Screen */}
      {currentScreen === 'home' && (
        <div className="relative">
          {lastScore !== null && (
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              Last Score: {lastScore}
            </div>
          )}
          <HomeScreen 
            onStart={startGame} 
            onOpenSettings={() => setCurrentScreen('settings')} 
          />
        </div>
      )}
      
      {/* Settings Panel */}
      {currentScreen === 'settings' && (
        <SettingsPanel 
          settings={settings}
          onChange={handleSettingsChange}
          muted={isMuted}
          onToggleMute={toggleMute}
          onClose={() => setCurrentScreen('home')}
        />
      )}
      
      {/* Permission Prompt */}
      {currentScreen === 'permission' && (
        <PermissionPrompt 
          onGrant={() => setCurrentScreen('game')}
          onCancel={() => setCurrentScreen('home')}
        />
      )}
      
      {/* Game Screen */}
      {currentScreen === 'game' && (
        <GameScreen 
          words={gameWords}
          durationSec={settings.durationSec}
          onFinish={(result) => handleGameFinish({
            ...result,
            deck: settings.deck // Ensure deck ID is passed in result
          })}
        />
      )}
      
      {/* Results Screen */}
      {currentScreen === 'results' && lastResult && (
        <ResultsScreen 
          result={lastResult}
          onPlayAgain={startGame}
          onHome={() => setCurrentScreen('home')}
        />
      )}
    </div>
  );
}

export default App;
