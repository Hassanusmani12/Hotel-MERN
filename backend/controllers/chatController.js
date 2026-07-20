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

    // Fetch available rooms for dynamic RAG injection
    const availableRooms = await Room.find({ status: 'Available' });
    const roomContext = formatRoomsForRAG(availableRooms);

    // Build the system prompt with strict guardrails
    const systemPrompt = buildSystemPrompt(roomContext);

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
        model: 'tencent/hy3:free',
        messages: apiMessages,
        temperature: 0.3,
        max_tokens: 800,
        top_p: 0.8,
        top_k: 20,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'LuxuryStay Hotel',
          'Content-Type': 'application/json',
        },
      }
    );

    const assistantMessage = response.data.choices[0].message.content;

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
    console.error('[Chat Controller] Error:', error.message);
    
    // If it's an API error, return more details
    if (error.response?.data) {
      return res.status(error.response.status || 500).json({
        error: 'AI service error',
        details: error.response.data,
      });
    }

    res.status(500).json({ error: 'Failed to get AI response' });
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
 * Format available rooms into RAG context with direct links
 */
function formatRoomsForRAG(rooms) {
  if (!rooms || rooms.length === 0) {
    return 'No rooms currently available. Please check back later.';
  }

  let context = `## LUXURYSTAY HOTEL - REAL-TIME ROOM INVENTORY\n`;
  context += `Available Now: ${rooms.length} suites\n\n`;

  rooms.forEach((room) => {
    const amenitiesList = room.amenities && room.amenities.length > 0 
      ? room.amenities.join(', ') 
      : 'Standard amenities';
    
    context += `### ${room.type} - Room ${room.roomNumber}\n`;
    context += `- **Price:** $${room.price}/night\n`;
    context += `- **Capacity:** ${room.capacity || 2} guests\n`;
    context += `- **Amenities:** ${amenitiesList}\n`;
    context += `- **Link:** /rooms/${room._id}\n`;
    context += `- **Description:** ${room.description || 'Luxury accommodation'}\n\n`;
  });

  return context;
}

/**
 * Build system prompt with strict domain guardrails
 */
function buildSystemPrompt(roomContext) {
  return `You are the exclusive Concierge for LuxuryStay Hotel, a 5-star luxury hotel in Karachi, Pakistan. 

## YOUR ROLE
- You are strictly a hotel concierge
- You ONLY answer questions about: hotel rooms, suites, amenities, pricing, availability, bookings, check-in/check-out, facilities, and services
- You are warm, professional, and helpful

## REAL-TIME ROOM DATA
Use ONLY the room inventory below to answer questions. NEVER invent room names, prices, or amenities.
${roomContext}

## FAMILY & CHILDREN GUIDANCE
If a user mentions having children or a family:
1. Analyze the number of guests mentioned (e.g., "2 kids" means at least 2+ adults + kids)
2. Recommend rooms with capacity >= total guests mentioned
3. Prioritize rooms with family-friendly amenities like 'Kids Area', 'Pet Friendly', or spacious accommodations
4. Include a direct markdown link: [👉 View RoomName](/rooms/roomId)

## ROOM RECOMMENDATIONS
When you recommend a specific room, ALWAYS include a clickable markdown link using its database ID:
[👉 Explore RoomName](/rooms/roomId)

## STRICT REFUSAL RULES
If asked about ANY non-hotel topic (coding, tech support, general knowledge, politics, religion, recipes, medical/legal advice, career/relationship advice, or anything unrelated to hotel services), respond with EXACTLY:
"I am exclusively trained to assist you with LuxuryStay Hotel bookings and services. I cannot assist with coding or unrelated inquiries. How may I help make your stay exceptional today?"

## LANGUAGE
Respond in the SAME language the user writes in.

## CONVERSATION MEMORY
Remember context from previous messages in this conversation for follow-ups.

## FINAL INSTRUCTION
Always be professional, concise, and focused on making the guest's stay exceptional.`;
}
