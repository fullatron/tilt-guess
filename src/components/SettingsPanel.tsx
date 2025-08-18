import React from 'react';
import type { Settings, DeckId } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  muted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChange,
  muted,
  onToggleMute,
  onClose
}) => {
  // Generate duration options from 45 to 180 in steps of 15
  const durationOptions = [];
  for (let duration = 45; duration <= 180; duration += 15) {
    durationOptions.push(duration);
  }

  // Handle duration change
  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDuration = parseInt(e.target.value, 10);
    const newSettings = { ...settings, durationSec: newDuration };
    onChange(newSettings);
    
    // Save to localStorage
    localStorage.setItem('settings', JSON.stringify(newSettings));
  };

  // Handle deck change
  const handleDeckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDeck = e.target.value as DeckId;
    const newSettings = { ...settings, deck: newDeck };
    onChange(newSettings);
    
    // Save to localStorage
    localStorage.setItem('settings', JSON.stringify(newSettings));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Round Duration */}
        <div className="mb-6">
          <label htmlFor="duration" className="block text-lg font-medium mb-2">
            Round Duration
          </label>
          <select
            id="duration"
            value={settings.durationSec}
            onChange={handleDurationChange}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {durationOptions.map(duration => (
              <option key={duration} value={duration}>
                {duration} seconds
              </option>
            ))}
          </select>
        </div>
        
        {/* Word Deck */}
        <div className="mb-6">
          <p className="block text-lg font-medium mb-2">Word Deck</p>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="deck"
                value="animals"
                checked={settings.deck === 'animals'}
                onChange={handleDeckChange}
                className="h-5 w-5 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-3 text-lg">Animals</span>
            </label>
            
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="deck"
                value="actions"
                checked={settings.deck === 'actions'}
                onChange={handleDeckChange}
                className="h-5 w-5 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-3 text-lg">Actions</span>
            </label>
          </div>
        </div>
        
        {/* Sound Toggle */}
        <div className="mb-6">
          <p className="block text-lg font-medium mb-2">Sound</p>
          <button
            onClick={onToggleMute}
            className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {muted ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
                <span>Sound Off</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span>Sound On</span>
              </>
            )}
          </button>
        </div>
        
        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-purple-700 active:transform active:scale-95 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
