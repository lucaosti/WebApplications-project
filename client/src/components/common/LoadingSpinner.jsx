/**
 * Reusable loading spinner component.
 * Displays an animated spinner with customizable message.
 * Used throughout the application for loading states.
 * 
 * @param {string} message - Loading message to display below spinner
 */
export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}
