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
  
  // Floating Button Position
  const [btnPos, setBtnPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
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

  const handleTrigger = () => setStep('settings');

  const handleEnhance = async () => {
    if (!targetElement) return;

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
      setStep('settings');
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

  const formatText = (text: string) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
          }
          return part;
      });
  };

  if (!targetElement) return null;

  if (step === 'idle') {
    return (
      <div 
        style={{ top: btnPos.top, left: btnPos.left, position: 'fixed', zIndex: 2147483647 }}
        className="pointer-events-none"
      >
        <button
          onClick={handleTrigger}
          className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer text-xl border-none"
          title="Enhance Prompt"
        >
          🪄
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/60 backdrop-blur-sm font-sans">
      <div className="bg-[#1e1e1e] text-neutral-200 rounded-xl shadow-2xl w-[500px] max-w-[90vw] max-h-[90vh] flex flex-col border border-neutral-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-800 bg-[#252525]">
          <h2 className="m-0 text-base font-semibold text-white flex items-center gap-2">
            <span className="text-lg">🪄</span> Prompt Engineer
          </h2>
          <button 
            onClick={close} 
            className="bg-transparent border-none text-neutral-500 hover:text-white cursor-pointer p-1 rounded-md hover:bg-white/10 transition-colors flex items-center justify-center w-8 h-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          {step === 'settings' && (
              <>
                  <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs text-neutral-400 mb-1.5 font-medium uppercase tracking-wide">Tone</label>
                              <select 
                                  value={settings.tone}
                                  onChange={(e) => setSettings({...settings, tone: e.target.value})}
                                  className="w-full bg-[#2d2d2d] border border-[#444] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
                                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                              >
                                  {TONE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                          </div>

                          <div>
                              <label className="block text-xs text-neutral-400 mb-1.5 font-medium uppercase tracking-wide">Length</label>
                              <select 
                                  value={settings.length}
                                  onChange={(e) => setSettings({...settings, length: e.target.value})}
                                  className="w-full bg-[#2d2d2d] border border-[#444] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
                                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                              >
                                  {LENGTH_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs text-neutral-400 mb-1.5 font-medium uppercase tracking-wide">Additional Context <span className="text-neutral-600 normal-case tracking-normal">(Optional)</span></label>
                          <textarea 
                              value={settings.context}
                              onChange={(e) => setSettings({...settings, context: e.target.value})}
                              placeholder="e.g. I am a software engineer, this is for a formal request..."
                              className="w-full bg-[#2d2d2d] border border-[#444] rounded-lg px-3 py-3 text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors min-h-[100px] resize-none"
                          />
                      </div>
                  </div>
              </>
          )}

          {step === 'loading' && (
              <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-neutral-400 text-sm animate-pulse">Enhancing your prompt...</p>
              </div>
          )}

          {step === 'preview' && (
              <>
                  <div className="bg-[#2d2d2d] p-4 rounded-lg border border-[#444] text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar">
                      {formatText(enhancedText)}
                  </div>
                  <div className="flex gap-2 justify-center">
                      <span className="text-xs text-neutral-400 bg-[#252525] px-2 py-1 rounded-full border border-[#333]">{settings.tone}</span>
                      <span className="text-xs text-neutral-400 bg-[#252525] px-2 py-1 rounded-full border border-[#333]">{settings.length}</span>
                  </div>
              </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-800 bg-[#252525] flex justify-end gap-3">
          {step === 'settings' && (
              <>
                  <button onClick={close} className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                  <button onClick={handleEnhance} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 transition-all hover:translate-y-[-1px]">Enhance</button>
              </>
          )}

          {step === 'preview' && (
              <>
                  <button onClick={() => setStep('settings')} className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors">Try Again</button>
                  <button onClick={applyEnhancement} className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 transition-all hover:translate-y-[-1px]">Apply</button>
              </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ContentApp;
