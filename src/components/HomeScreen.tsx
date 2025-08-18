import React from 'react';

interface HomeScreenProps {
  onStart: () => void;
  onOpenSettings: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStart, onOpenSettings }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-blue-500 to-purple-600 text-white">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-2 animate-pulse">Tilt Guess</h1>
        <p className="text-xl opacity-80">The heads-up word guessing game</p>
      </div>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button 
          onClick={onStart}
          className="bg-white text-purple-600 py-4 px-8 rounded-full text-xl font-bold shadow-lg hover:bg-opacity-90 active:transform active:scale-95 transition-all"
        >
          Start Game
        </button>
        
        <button 
          onClick={onOpenSettings}
          className="bg-purple-700 bg-opacity-50 text-white py-4 px-8 rounded-full text-xl font-bold shadow-lg hover:bg-opacity-70 active:transform active:scale-95 transition-all"
        >
          Settings
        </button>
      </div>
      
      <div className="mt-12 text-center">
        <button className="text-white text-opacity-80 hover:text-opacity-100 underline text-lg">
          How to Play
        </button>
      </div>
      
      <div className="absolute bottom-4 text-xs opacity-50">
        Tilt your device to play!
      </div>
    </div>
  );
};

export default HomeScreen;
