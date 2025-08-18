/**
 * Wake Lock utility to prevent screen from turning off during gameplay
 * Uses the Screen Wake Lock API when available
 */

/**
 * Handle for releasing a wake lock
 */
export type WakeLockHandle = { 
  release(): Promise<void> 
};

/**
 * Request a screen wake lock to prevent the device from sleeping
 * @returns A handle to release the lock, or null if wake lock is not supported
 */
export async function requestWakeLock(): Promise<WakeLockHandle | null> {
  // Check if Wake Lock API is supported
  if (!('wakeLock' in navigator) || !navigator.wakeLock) {
    console.log('Wake Lock API not supported in this browser');
    return null;
  }
  
  try {
    // Request a screen wake lock
    let wakeLock: WakeLockSentinel | null = await navigator.wakeLock.request('screen');
    console.log('Wake Lock acquired');
    
    // Function to reacquire wake lock when document becomes visible again
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // The page is now visible, try to reacquire the wake lock
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock reacquired');
        } catch (error) {
          console.error('Failed to reacquire Wake Lock:', error);
        }
      }
    };
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Return handle with cleanup
    return {
      release: async () => {
        // Remove the event listener
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        
        // Release the wake lock
        if (wakeLock) {
          try {
            await wakeLock.release();
            wakeLock = null;
            console.log('Wake Lock released');
          } catch (error) {
            console.error('Failed to release Wake Lock:', error);
          }
        }
      }
    };
  } catch (error) {
    console.error('Failed to request Wake Lock:', error);
    return null;
  }
}
