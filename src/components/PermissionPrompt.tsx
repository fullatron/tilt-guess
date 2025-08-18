import React, { useState } from 'react';
import { requestMotionPermission } from '../utils/sensors';

interface PermissionPromptProps {
  onGrant: () => void;
  onCancel: () => void;
}

const PermissionPrompt: React.FC<PermissionPromptProps> = ({ onGrant, onCancel }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    setError(null);
    
    try {
      const granted = await requestMotionPermission();
      if (granted) {
        onGrant();
      } else {
        setError('Permission denied. Please allow motion sensors to play.');
      }
    } catch (err) {
      setError('Error requesting permission. Please try again.');
      console.error('Permission error:', err);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-blue-500 to-purple-600 text-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
        
        <div className="mb-8 p-4 bg-white bg-opacity-20 rounded-lg">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 animate-[rotateDeviceHint_2s_ease-in-out_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          
          <p className="text-lg mb-2">
            Hold the device to your forehead in landscape mode
          </p>
          <p className="text-sm opacity-80">
            Tilt up for correct, down for pass
          </p>
        </div>
        
        <p className="mb-4">
          We need permission to use motion sensors for tilt controls.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-70 rounded-lg text-white">
            {error}
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button 
          onClick={handleRequestPermission}
          disabled={isRequesting}
          className={`bg-white text-purple-600 py-4 px-8 rounded-full text-xl font-bold shadow-lg 
            ${isRequesting ? 'opacity-70' : 'hover:bg-opacity-90 active:transform active:scale-95'} 
            transition-all`}
        >
          {isRequesting ? 'Requesting...' : 'Grant Permission & Start'}
        </button>
        
        <button 
          onClick={onCancel}
          disabled={isRequesting}
          className="bg-transparent border border-white text-white py-3 px-8 rounded-full text-lg hover:bg-white hover:bg-opacity-10 active:transform active:scale-95 transition-all"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default PermissionPrompt;
