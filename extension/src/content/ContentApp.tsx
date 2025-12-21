import { useState, useEffect } from 'react';
import { enhancePrompt } from '../utils/api';

type Step = 'idle' | 'settings' | 'loading' | 'preview';

interface Settings {
  tone: string;
  length: string;
  context: string;
}

const TONE_OPTIONS = ['Professional', 'Casual', 'Friendly', 'Persuasive', 'Bold', 'Playful'];
const LENGTH_OPTIONS = ['Concise', 'Medium', 'Detailed'];

const ContentApp = () => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [step, setStep] = useState<Step>('idle');
  
  // Settings State
  const [settings, setSettings] = useState<Settings>({
    tone: localStorage.getItem('pe_tone') || 'Professional',
    length: localStorage.getItem('pe_length') || 'Medium',
    context: ''
  });

  const [enhancedText, setEnhancedText] = useState('');
  
  // Floating Button Position (Track input)
  const [btnPos, setBtnPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Save preferences
    localStorage.setItem('pe_tone', settings.tone);
    localStorage.setItem('pe_length', settings.length);
  }, [settings.tone, settings.length]);

  useEffect(() => {
    const handleFocus = (e: Event) => {
      const target = e.target as HTMLElement;
      if (isValidInput(target)) {
        setTargetElement(target);
        updateBtnPosition(target);
      }
    };

    const updateBtnPosition = (target: HTMLElement) => {
      const rect = target.getBoundingClientRect();
      setBtnPos({
        top: rect.bottom - 50, 
        left: rect.right - 50, 
      });
    };

    const isValidInput = (el: HTMLElement) => {
      return (
        el.tagName === 'TEXTAREA' ||
        el.getAttribute('contenteditable') === 'true' ||
        el.getAttribute('role') === 'textbox'
      );
    };

    document.addEventListener('focusin', handleFocus);
    
    // Check active element periodically
    const interval = setInterval(() => {
      const active = document.activeElement as HTMLElement;
      if (active && isValidInput(active) && active !== targetElement) {
         setTargetElement(active);
         updateBtnPosition(active);
      }
    }, 1000);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      clearInterval(interval);
    };
  }, [targetElement]);

  // Update button position on scroll
  useEffect(() => {
    if (!targetElement) return;
    const update = () => {
        const rect = targetElement.getBoundingClientRect();
        setBtnPos({ top: rect.bottom - 50, left: rect.right - 50 });
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
        window.removeEventListener('scroll', update, true);
        window.removeEventListener('resize', update);
    };
  }, [targetElement]);

  const handleTrigger = () => {
    setStep('settings');
  };

  const handleEnhance = async () => {
    if (!targetElement) return;

    // Get text
    let text = '';
    if (targetElement.tagName === 'TEXTAREA') {
      text = (targetElement as HTMLTextAreaElement).value;
    } else {
      text = targetElement.innerText || targetElement.textContent || '';
    }

    if (!text.trim()) {
        alert("Please type a prompt first!");
        return;
    }

    setStep('loading');
    
    try {
      const result = await enhancePrompt({
          prompt: text,
          tone: settings.tone,
          length: settings.length,
          context: settings.context
      });
      setEnhancedText(result.enhanced);
      setStep('preview');
    } catch (error: any) {
      console.error('Enhancement Error:', error);
      alert(`Error: ${error.message}`);
      setStep('settings'); // Go back
    }
  };

  const applyEnhancement = () => {
    if (!targetElement) return;

    if (targetElement.tagName === 'TEXTAREA') {
      const textarea = targetElement as HTMLTextAreaElement;
      textarea.value = enhancedText;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      targetElement.innerText = enhancedText;
      targetElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    setStep('idle');
  };

  const close = () => setStep('idle');

  // Simple Markdown Formatter
  const formatText = (text: string) => {
      // Bold: **text**
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="text-gray-900">{part.slice(2, -2)}</strong>;
          }
          return part;
      });
  };

  if (!targetElement) return null;

  // Render Trigger Button
  if (step === 'idle') {
    return (
      <div 
        className="fixed z-[2147483647] font-sans"
        style={{ top: btnPos.top, left: btnPos.left, position: 'fixed' }}
      >
        <button
          onClick={handleTrigger}
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 flex items-center justify-center w-10 h-10 cursor-pointer"
          title="Enhance Prompt"
        >
          🪄
        </button>
      </div>
    );
  }

  // Render Modal (Centered)
  // Using inline styles for critical layout to avoid Tailwind/ShadowDOM issues
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="bg-[#1e1e1e] text-gray-200 rounded-xl shadow-2xl border border-gray-700 overflow-hidden"
        style={{
          width: '500px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1e1e1e', // Fallback
          borderColor: '#374151'
        }}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#252525]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🪄</span> Prompt Engineer
          </h2>
          <button onClick={close} className="text-gray-400 hover:text-white transition-colors text-xl font-bold">&times;</button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            
            {step === 'settings' && (
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tone</label>
                        <select 
                            value={settings.tone}
                            onChange={(e) => setSettings({...settings, tone: e.target.value})}
                            className="w-full bg-[#2d2d2d] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            {TONE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Length</label>
                        <select 
                            value={settings.length}
                            onChange={(e) => setSettings({...settings, length: e.target.value})}
                            className="w-full bg-[#2d2d2d] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            {LENGTH_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Additional Context <span className="text-gray-500 text-xs">(Optional)</span>
                        </label>
                        <textarea 
                            value={settings.context}
                            onChange={(e) => setSettings({...settings, context: e.target.value})}
                            placeholder="e.g. I am a software engineer, this is for a formal request..."
                            className="w-full bg-[#2d2d2d] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all placeholder-gray-600"
                        />
                    </div>
                </div>
            )}

            {step === 'loading' && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-300 text-lg animate-pulse">Enhancing your prompt...</p>
                    <p className="text-gray-500 text-sm mt-2">Applying {settings.tone} tone magic</p>
                </div>
            )}

            {step === 'preview' && (
                <div className="space-y-4">
                    <div className="bg-[#2d2d2d] p-4 rounded-lg border border-gray-600 max-h-[300px] overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap text-gray-200 shadow-inner">
                        {formatText(enhancedText)}
                    </div>
                    <div className="flex gap-2 justify-center">
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{settings.tone}</span>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{settings.length}</span>
                    </div>
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-[#252525] flex justify-end gap-3">
            {step === 'settings' && (
                <>
                    <button onClick={close} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                    <button 
                        onClick={handleEnhance}
                        className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/20"
                    >
                        Enhance
                    </button>
                </>
            )}

            {step === 'preview' && (
                <>
                    <button 
                        onClick={() => setStep('settings')} 
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={applyEnhancement}
                        className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/20 flex items-center gap-2"
                    >
                        <span>✓</span> Apply
                    </button>
                </>
            )}
        </div>

      </div>
    </div>
  );
};

export default ContentApp;
