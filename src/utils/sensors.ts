import type { TiltEvent } from '../types';

/**
 * Request permission to access device motion and orientation on iOS
 * Must be called in response to a user gesture (click/tap)
 */
export async function requestMotionPermission(): Promise<boolean> {
  // Check if the browser supports DeviceMotionEvent and has the requestPermission method (iOS 13+)
  if (typeof DeviceMotionEvent !== 'undefined' && 
      typeof (DeviceMotionEvent as any).requestPermission === 'function') {
    try {
      // Request permission from the user
      const permissionState = await (DeviceMotionEvent as any).requestPermission();
      return permissionState === 'granted';
    } catch (error) {
      console.error('Error requesting device motion permission:', error);
      return false;
    }
  }
  
  // For non-iOS devices or older iOS versions that don't require permission
  return true;
}

/**
 * Handle for stopping sensor detection
 */
export type SensorHandle = { 
  stop(): void 
};

/**
 * Start detecting device tilt and report direction changes
 */
export function startTiltDetection(options: {
  onTilt: (evt: TiltEvent) => void;
  neutralDeadzone?: number; // degrees within which is neutral
  threshold?: number; // degrees from baseline to trigger up/down
}): SensorHandle {
  const { 
    onTilt, 
    neutralDeadzone = 10, 
    threshold = 30 
  } = options;
  
  // Calibration and state variables
  let baselineBeta = 0;
  let baselineGamma = 0;
  let calibrationSamples: {beta: number, gamma: number}[] = [];
  let isCalibrated = false;
  let lastDirection: 'up' | 'down' | 'neutral' = 'neutral';
  let inNeutralZone = true;
  
  // Handle device orientation event
  function handleOrientation(event: DeviceOrientationEvent) {
    // Ensure we have valid beta and gamma values
    if (event.beta === null || event.gamma === null) return;
    
    const beta = event.beta;
    const gamma = event.gamma;
    
    // Calibration phase: collect first 10 samples
    if (!isCalibrated) {
      calibrationSamples.push({ beta, gamma });
      
      if (calibrationSamples.length >= 10) {
        // Calculate average baseline from samples
        baselineBeta = calibrationSamples.reduce((sum, sample) => sum + sample.beta, 0) / calibrationSamples.length;
        baselineGamma = calibrationSamples.reduce((sum, sample) => sum + sample.gamma, 0) / calibrationSamples.length;
        isCalibrated = true;
        console.log('Sensor calibration complete', { baselineBeta, baselineGamma });
      }
      return;
    }
    
    // Calculate adjusted values based on baseline
    const adjustedBeta = beta - baselineBeta;
    const adjustedGamma = gamma - baselineGamma;
    
    // Determine primary axis based on screen orientation
    const isLandscape = typeof screen !== 'undefined' && 
                        screen.orientation && 
                        screen.orientation.angle % 180 !== 0;
    
    // Use gamma in landscape, beta in portrait
    const primaryTiltAxis = isLandscape ? adjustedGamma : adjustedBeta;
    
    // Determine tilt direction
    let direction: 'up' | 'down' | 'neutral';
    
    if (primaryTiltAxis <= -threshold) {
      direction = 'up';
    } else if (primaryTiltAxis >= threshold) {
      direction = 'down';
    } else if (Math.abs(primaryTiltAxis) <= neutralDeadzone) {
      direction = 'neutral';
    } else {
      // In between neutral deadzone and threshold, maintain previous direction
      direction = lastDirection;
    }
    
    // Debounce logic
    if (direction === 'neutral') {
      // Reset debounce state when entering neutral zone
      if (!inNeutralZone) {
        inNeutralZone = true;
        onTilt({ 
          direction, 
          beta: adjustedBeta, 
          gamma: adjustedGamma 
        });
      }
    } else if (direction !== lastDirection || inNeutralZone) {
      // Only trigger for direction changes or when coming from neutral
      inNeutralZone = false;
      onTilt({ 
        direction, 
        beta: adjustedBeta, 
        gamma: adjustedGamma 
      });
    }
    
    lastDirection = direction;
  }
  
  // Add event listener
  window.addEventListener('deviceorientation', handleOrientation);
  
  // Return handle with cleanup function
  return {
    stop: () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    }
  };
}
