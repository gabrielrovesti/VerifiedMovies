import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App/App';
import ScreenReaderHelp from './components/ScreenReaderHelp/ScreenReaderHelp';

ReactDOM.render(
  <React.StrictMode>
    <ScreenReaderHelp />
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);