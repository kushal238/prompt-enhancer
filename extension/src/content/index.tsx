import { createRoot } from 'react-dom/client';
import ContentApp from './ContentApp';
import '../index.css';

// Create a container for our extension
const container = document.createElement('div');
container.id = 'prompt-engineer-extension-root';
document.body.appendChild(container);

// Use Shadow DOM to avoid style conflicts
const shadow = container.attachShadow({ mode: 'open' });

// Inject styles into shadow DOM
// In a real build, we'd extract the CSS link, but for now we will rely on bundled styles 
// or manually injecting the style tag if Vite's css injection doesn't work inside Shadow DOM automatically.
// The @crxjs/vite-plugin usually handles CSS injection for content scripts, but Shadow DOM isolates it.
// We need to fetch the CSS and append it.

// Helper to inject styles
const injectStyles = () => {
   const style = document.createElement('style');
   // Basic styles for the shadow root wrapper itself if needed
   style.textContent = `
     :host { all: initial; }
   `;
   shadow.appendChild(style);
   
   // We also need to get the tailwind styles. 
   // In dev mode, Vite injects them in the main document head.
   // We might need to copy them or use a constructable stylesheet.
   
   // For simplicity in this prototype, let's rely on the fact that we can import css as text in Vite with ?inline
   // But standard import '../index.css' usually injects into document.head.
};

injectStyles();

const root = document.createElement('div');
shadow.appendChild(root);

createRoot(root).render(
  <>
    <style>{`
      /* Manually adding some crucial tailwind classes since Shadow DOM blocks external CSS */
      .fixed { position: fixed; }
      .bg-blue-600 { background-color: #2563eb; }
      .text-white { color: white; }
      .p-2 { padding: 0.5rem; }
      .rounded-full { border-radius: 9999px; }
      .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
      .bg-white { background-color: white; }
      .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
      .p-4 { padding: 1rem; }
      .w-96 { width: 24rem; }
      .border { border-width: 1px; }
      .border-gray-200 { border-color: #e5e7eb; }
      .mb-2 { margin-bottom: 0.5rem; }
      .bg-gray-50 { background-color: #f9fafb; }
      .p-3 { padding: 0.75rem; }
      .rounded { border-radius: 0.25rem; }
      .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
      .text-gray-700 { color: #374151; }
      .mb-4 { margin-bottom: 1rem; }
      .flex { display: flex; }
      .justify-end { justify-content: flex-end; }
      .gap-2 { gap: 0.5rem; }
      .font-bold { font-weight: 700; }
      .cursor-pointer { cursor: pointer; }
      .hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
    `}</style>
    <ContentApp />
  </>
);

console.log('Prompt Engineer Extension Content Script Loaded');

