import expressApp from './app.js';

const PORT = 3001;

expressApp.listen(PORT, () => {
  console.log(`✅ Server listening at http://localhost:${PORT}`);
});
