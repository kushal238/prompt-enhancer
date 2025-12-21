console.log('Prompt Engineer Background Service Worker Loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'ENHANCE_PROMPT') {
    handleEnhancePrompt(message)
      .then(response => sendResponse(response))
      .catch(error => sendResponse({ error: error.message }));
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});

async function handleEnhancePrompt(options: any) {
  try {
    const { prompt, tone, length, context } = options;
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/997f33b0-17ba-456b-816a-2eb5535e8e7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'extension/src/background/index.ts:18',message:'Sending request to server',data:{prompt: prompt.substring(0, 20), tone, length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    const response = await fetch('https://server-green-beta-26.vercel.app/api/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, tone, length, context }),
    });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/997f33b0-17ba-456b-816a-2eb5535e8e7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'extension/src/background/index.ts:28',message:'Received response',data:{status: response.status, statusText: response.statusText, headers: Object.fromEntries(response.headers.entries())},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A/B'})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
      const text = await response.text();
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/997f33b0-17ba-456b-816a-2eb5535e8e7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'extension/src/background/index.ts:34',message:'Response not OK',data:{text},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw new Error(`Server Error: ${response.status} ${text}`);
    }

    return await response.json();
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/997f33b0-17ba-456b-816a-2eb5535e8e7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'extension/src/background/index.ts:43',message:'Fetch Exception',data:{error: error.message, stack: error.stack},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    console.error('API Error:', error);
    throw error;
  }
}
