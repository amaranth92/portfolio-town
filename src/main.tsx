import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// React 앱의 진입점입니다. App 컴포넌트가 Phaser 게임과 포트폴리오 UI를 함께 조립합니다.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
