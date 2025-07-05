/**
 * Reusable success message component.
 * Displays success messages with automatic dismissal after a timeout.
 * Conditionally renders based on success state.
 * 
 * @param {string} message - Success message to display
 * @param {Function} onDismiss - Optional callback function when message is dismissed
 * @param {number} timeout - Time in milliseconds before auto-dismiss (default: 5000)
 */
import { useEffect, useCallback } from 'react';

export default function SuccessMessage({ message, onDismiss, timeout = 5000 }) {
  // Memoize the dismiss callback to prevent unnecessary re-renders
  const memoizedOnDismiss = useCallback(() => {
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  // Auto-dismiss after timeout
  useEffect(() => {
    if (message && timeout && memoizedOnDismiss) {
      const timer = setTimeout(memoizedOnDismiss, timeout);
      
      return () => clearTimeout(timer);
    }
  }, [message, timeout, memoizedOnDismiss]);

  if (!message) return null;

  return (
    <div className="success-message">
      <p className="success">{message}</p>
      {onDismiss && (
        <button 
          onClick={memoizedOnDismiss} 
          className="dismiss-button"
          aria-label="Dismiss success message"
        >
          ×
        </button>
      )}
    </div>
  );
}
