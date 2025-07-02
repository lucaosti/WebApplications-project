/**
 * Reusable error message component
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
