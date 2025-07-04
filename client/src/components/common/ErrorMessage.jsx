/**
 * Reusable error message component.
 * Displays error messages with optional retry functionality.
 * Conditionally renders based on error state.
 * 
 * @param {string} error - Error message to display
 * @param {Function} onRetry - Optional callback function for retry button
 */
export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null;

  return (
    <div className="error-message">
      <p className="error">{error}</p>
      {onRetry && (
        <button onClick={onRetry} className="secondary-button">
          Try Again
        </button>
      )}
    </div>
  );
}
