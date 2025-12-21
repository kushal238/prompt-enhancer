import { createRoot } from 'react-dom/client';
import ContentApp from './ContentApp';
// @ts-ignore
import styles from '../index.css?inline';

// Create a container for our extension
const container = document.createElement('div');
container.id = 'prompt-engineer-extension-root';
document.body.appendChild(container);

// Use Shadow DOM to avoid style conflicts
const shadow = container.attachShadow({ mode: 'open' });

// Inject Tailwind styles into shadow DOM
const style = document.createElement('style');
style.textContent = styles;
shadow.appendChild(style);

// Add font family if needed, or rely on Tailwind's sans
const fontStyle = document.createElement('style');
fontStyle.textContent = `
  :host { 
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
    line-height: 1.5;
  }
`;
shadow.appendChild(fontStyle);

const root = document.createElement('div');
shadow.appendChild(root);

createRoot(root).render(<ContentApp />);

console.log('Prompt Engineer Extension Content Script Loaded');
