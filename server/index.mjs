import expressApp from './app.mjs';

const PORT = 3001;

/**
 * Start the Express server and listen on the specified port.
 * Logs startup information to console for monitoring.
 */
expressApp.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('COMPITI SERVER STARTED');
  console.log('='.repeat(60));
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`Started at: ${new Date().toLocaleString()}`);
  console.log('Logging: API calls, authentication events, and errors');
  console.log('='.repeat(60));
});