
'use client';

type Unsubscribe = () => void;

// A simple in-memory array to hold all active listener unsubscribe functions.
const activeListeners: Unsubscribe[] = [];

/**
 * Registers an unsubscribe function to be called on cleanup.
 * @param unsubscribe The function to call to stop a listener.
 */
export function registerListener(unsubscribe: Unsubscribe) {
  activeListeners.push(unsubscribe);
}

/**
 * Calls all registered unsubscribe functions to clean up active listeners.
 * This should be called when the user logs out.
 */
export function cleanupListeners() {
  activeListeners.forEach(unsubscribe => {
    try {
      unsubscribe();
    } catch (error) {
      console.error('Error during listener cleanup:', error);
    }
  });
  // Clear the array after unsubscribing
  activeListeners.length = 0;
}
