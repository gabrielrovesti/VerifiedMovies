import './index.css';
import App from './App/App';
import ScreenReaderHelp from './components/ScreenReaderHelp/ScreenReaderHelp';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

root.render(
  <StrictMode>
    <ScreenReaderHelp />
    <App />
  </StrictMode>,
);