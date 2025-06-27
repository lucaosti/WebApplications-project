import './App.css';
import Navigation from './components/Navigation.jsx';
import AppRouter from './router.jsx';

/**
 * Main application component.
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
