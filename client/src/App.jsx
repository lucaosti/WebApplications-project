import './App.css';
import Navigation from './components/Navigation.jsx';
import AppRouter from './router.jsx';

/**
 * Main application component.
 * Renders the navigation bar and routing system for the entire application.
 */
export default function App() {
  return (
    <>
      <Navigation />
      <div className="app-content">
        <AppRouter />
      </div>
    </>
  );
}
