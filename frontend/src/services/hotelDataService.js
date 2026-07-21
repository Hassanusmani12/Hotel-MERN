import { MOCK_ROOMS } from '../data/roomsData';
import { API_BASE_URL } from '../config';

const API_BASE = `${API_BASE_URL}/api`;

let cachedRooms = null;

export const fetchRooms = async () => {
  if (cachedRooms) return cachedRooms;

  try {
    const res = await fetch(`${API_BASE}/rooms`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedRooms = data;
        return data;
      }
    }
  } catch (e) {
    console.log('[HotelData] API unavailable, using fallback data');
  }

  cachedRooms = MOCK_ROOMS;
  return MOCK_ROOMS;
};

export const formatRoomsContext = (rooms) => {
  const total = rooms.length;
  const available = rooms.filter(r => r.status === 'Available').length;
  const minPrice = Math.min(...rooms.map(r => r.price));
  const maxPrice = Math.max(...rooms.map(r => r.price));

  let text = `## LUXURYSTAY HOTEL - CURRENT ROOM INVENTORY\n`;
  text += `Total Rooms: ${total} | Available Now: ${available} | Price Range: $${minPrice} - $${maxPrice}/night\n\n`;
  text += `### ROOM LISTINGS\n\n`;

  const sorted = [...rooms].sort((a, b) => a.price - b.price);

  sorted.forEach((room, i) => {
    text += `${i + 1}. "${room.type}" (Room ${room.roomNumber}) - $${room.price}/night - ${room.status}\n`;
    text += `   Capacity: ${room.capacity || 'N/A'} guests | Size: ${room.size || 'N/A'} sq ft | View: ${room.view || 'N/A'}\n`;
    text += `   Bed: ${room.bedType || 'N/A'} | Rating: ${room.rating || 'N/A'} (${room.reviews || 0} reviews)\n`;
    text += `   Amenities: ${(room.amenities && room.amenities.length > 0) ? room.amenities.join(', ') : 'Various'}\n`;
    text += `   Description: ${room.description || 'Luxury accommodation'}\n\n`;
  });

  text += `### HOTEL FACILITIES\n`;
  text += `- Infinity Pool: Rooftop pool with panoramic views, cabana service, heated night swims\n`;
  text += `- Fine Dining: Seasonal menus, chef tables, in-room dining, beachside breakfast\n`;
  text += `- Wellness Spa: Hydrotherapy, massage rituals, recovery rooms, morning reset sessions\n`;
  text += `- Fitness Studio: Strength & cardio equipment, yoga, trainer-led private sessions (24/7)\n`;
  text += `- Concierge: Airport transfers, table reservations, local planning, private events\n`;
  text += `- Complimentary high-speed WiFi throughout the property\n`;
  text += `- Valet parking and secure underground parking\n\n`;
  text += `### POLICIES\n`;
  text += `- Check-in: 3:00 PM | Check-out: 11:00 AM\n`;
  text += `- Early check-in and late check-out available on request\n`;
  text += `- Cancellation: Free cancellation 48 hours before check-in\n`;

  return text;
};

export const refreshRoomCache = () => {
  cachedRooms = null;
};

export const getWelcomeMessage = async () => {
  const rooms = await fetchRooms();
  const available = rooms.filter(r => r.status === 'Available');
  const minPrice = Math.min(...rooms.map(r => r.price));
  const maxPrice = Math.max(...rooms.map(r => r.price));
  const topRoom = [...rooms].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];

  let msg = `Welcome to LuxuryStay. I am your personal concierge.`;
  if (available.length > 0) {
    msg += ` We currently have ${available.length} rooms available from $${minPrice} to $${maxPrice}/night.`;
  }
  if (topRoom) {
    const rating = topRoom?.rating ?? '5.0';
    msg += ` Our highest-rated room is the ${topRoom.type} (\u2605 ${rating}).`;
  }
  msg += ` How may I assist you today?`;
  return msg;
};
