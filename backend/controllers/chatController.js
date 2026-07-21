const axios = require('axios');
const Room = require('../models/Room');

// Store conversation history in memory (in production, use Redis/database)
const conversationHistory = {};

/**
 * Sends a message to OpenRouter using tencent/hy3:free model
 * with dynamic room inventory RAG and strict domain guardrails
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Initialize session history if needed
    if (!conversationHistory[sessionId]) {
      conversationHistory[sessionId] = [];
    }

    // Fetch all rooms from DB for dynamic RAG injection
    const rooms = await Room.find({});
    const roomsContext = formatRoomsForRAG(rooms);

    // Build the system prompt with live DB data
    const systemPrompt = buildSystemPrompt(roomsContext);

    // Add user message to history
    conversationHistory[sessionId].push({
      role: 'user',
      content: message,
    });

    // Prepare messages for OpenRouter API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory[sessionId].slice(0, -1),
      { role: 'user', content: message },
    ];

    // Call OpenRouter API with tencent/hy3:free model
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'cohere/north-mini-code:free',
        messages: apiMessages,
        temperature: 0.3,
        max_tokens: 800,
        top_p: 0.8,
        top_k: 20,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'LuxuryStay Hotel',
          'Content-Type': 'application/json',
        },
      }
    );

    const assistantMessage = response.data?.choices?.[0]?.message?.content || "I am your hotel concierge. I can only assist you with hotel rooms, bookings, amenities, and stay recommendations.";

    // Add assistant response to history
    conversationHistory[sessionId].push({
      role: 'assistant',
      content: assistantMessage,
    });

    // Keep history limited to last 20 messages to avoid token overflow
    if (conversationHistory[sessionId].length > 20) {
      conversationHistory[sessionId] = conversationHistory[sessionId].slice(-20);
    }

    res.json({ reply: assistantMessage });
  } catch (error) {
    console.error('[Chat Controller Error]:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Service unavailable. Please try again.' });
  }
};

/**
 * Clears conversation history for a session
 */
exports.clearHistory = (req, res) => {
  try {
    const { sessionId } = req.body;
    if (sessionId && conversationHistory[sessionId]) {
      delete conversationHistory[sessionId];
    }
    res.json({ success: true, message: 'History cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
};

/**
 * Format rooms into structured array for RAG context injection
 */
function formatRoomsForRAG(rooms) {
  if (!rooms || rooms.length === 0) {
    return [];
  }

  return rooms.map((room) => ({
    id: room._id,
    title: room.type || 'Luxury Suite',
    category: room.category || 'Suite',
    pricePerNight: room.price || 0,
    maxGuests: room.capacity || 2,
    amenities: Array.isArray(room.amenities) ? room.amenities : [],
    roomNumber: room.roomNumber || 'N/A',
    description: room.description || 'Luxury accommodation',
    status: room.status || 'Available',
  }));
}

/**
 * Build system prompt with strict domain guardrails
 */
function buildSystemPrompt(roomsContext) {
  return `You are Concierge, the official AI Assistant for LuxuryStay Hotel. Your primary role is to help guests choose and book rooms based on our REAL LIVE DATABASE.

LIVE HOTEL ROOMS DATA (Retrieved directly from Database):
${JSON.stringify(roomsContext, null, 2)}

INSTRUCTIONS & RULES:
1. ACCURATE RECOMMENDATIONS:
   - Match the user's requirements (e.g., guest count, budget, amenities) ONLY against the provided LIVE HOTEL ROOMS DATA above.
   - If a user asks for 5 guests, find rooms where capacity is >= 5 (e.g., Family Suites or Executive Suites).
   - Display the EXACT room title, price per night, and capacity from the DB data.

2. CLICKABLE LINKS:
   - Always append markdown links using the room ID or category so users can click and view:
     Example: 'Check out [Executive Royal Suite](/rooms/${roomsContext.length > 0 ? roomsContext[0].id : ''}) for $350/night.'

3. GREETINGS & POLITE TALK:
   - Respond warmly to basic greetings ('hello', 'hi') without declining.

4. UNRELATED QUESTIONS:
   - Politely decline questions unrelated to LuxuryStay, travel, or room bookings.`;
}
