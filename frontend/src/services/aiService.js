import { v4 as uuidv4 } from 'uuid';

const API_BASE = 'http://localhost:5000/api';

// Generate a unique session ID for this chat session
const SESSION_ID = uuidv4();

/**
 * Send a message to the AI Concierge via OpenRouter (tencent/hy3:free)
 * with dynamic room inventory RAG and strict domain guardrails
 */
export const sendMessage = async (message) => {
  try {
    const response = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        sessionId: SESSION_ID,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[AI Service] Error:', error);
      throw new Error(error.error || 'Failed to get AI response');
    }

    const data = await response.json();
    console.log('[AI Service] Response received:', data.reply.substring(0, 200));
    return data.reply;
  } catch (error) {
    console.error('[AI Service] Message error:', error);
    throw error;
  }
};

/**
 * Clear conversation history for this session
 */
export const clearHistory = async () => {
  try {
    const response = await fetch(`${API_BASE}/chat/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: SESSION_ID,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to clear history');
    }

    console.log('[AI Service] History cleared');
    return true;
  } catch (error) {
    console.error('[AI Service] Clear history error:', error);
    return false;
  }
};

export default { sendMessage, clearHistory };
