export interface EnhanceOptions {
  prompt: string;
  tone?: string;
  length?: string;
  context?: string;
}

export const enhancePrompt = async (options: EnhanceOptions): Promise<{ enhanced: string, original: string }> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: 'ENHANCE_PROMPT', ...options },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      }
    );
  });
};
