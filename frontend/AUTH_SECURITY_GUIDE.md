# Auth Security Implementation Guide

## ✅ Completed Setup

This guide documents the comprehensive authentication and route protection system implemented across the MERN frontend.

---

## 1. Authentication Context (`AuthContext.jsx`)

**Location:** `src/context/AuthContext.jsx`

The global auth context manages:
- User state (logged-in user data)
- Authentication status (`isAuthenticated`)
- Loading state during auth checks
- Login/Logout operations
- Unauthorized handler (called on 401 from API)

**Key Methods:**
```jsx
const { user, isAuthenticated, loading, login, logout, handleUnauthorized } = useAuth();
```

**Usage Example:**
```jsx
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) return <p>Not logged in</p>;
  return <p>Welcome, {user.name}</p>;
};
```

---

## 2. Protected Routes (`ProtectedRoute.jsx`)

**Location:** `src/components/ProtectedRoute.jsx`

Wraps sensitive routes and enforces authentication. Unauthenticated users are automatically redirected to `/login`.

**Protected Routes:**
- `/profile` - User profile and booking management
- `/payment` - Payment/booking confirmation
- `/admin` - Admin dashboard

**Usage in App.jsx:**
```jsx
<Route path="/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />
```

---

## 3. Axios Interceptors (`axiosInterceptor.js`)

**Location:** `src/services/axiosInterceptor.js`

Automatically handles:
- **Request:** Attaches JWT token from localStorage to all requests
- **Response:** On 401 Unauthorized, clears auth state and redirects to login

**Setup:** Must initialize the logout callback in App.jsx:
```jsx
import { setLogoutCallback } from './services/axiosInterceptor';

useEffect(() => {
  setLogoutCallback(handleLogout);
}, []);
```

---

## 4. UI Action Guards (`useRequireAuth` Hook)

**Location:** `src/hooks/useRequireAuth.js`

For action buttons that require authentication (e.g., "Book Now", "Leave Review").

**Usage Example:**
```jsx
import useRequireAuth from '../hooks/useRequireAuth';

const MyComponent = () => {
  const requireAuth = useRequireAuth();
  
  const handleBooking = () => {
    if (!requireAuth('Please log in to book')) return;
    // Proceed with booking...
  };
  
  return <button onClick={handleBooking}>Book Now</button>;
};
```

**Behavior:**
- If user is not authenticated, shows toast warning and redirects to `/login`
- If user is authenticated, returns `true` and proceeds

---

## 5. Auth Provider Setup (`main.jsx`)

**Location:** `src/main.jsx`

AuthProvider wraps the entire app (inside ThemeProvider):

```jsx
<AuthProvider>
  <ThemeProvider>
    <App />
  </ThemeProvider>
</AuthProvider>
```

---

## 6. Login Flow Updates

**Updated Files:**
- `src/pages/Login.jsx`

Now uses AuthContext's `login()` method:
```jsx
const { login } = useAuth();

const onSubmit = async (e) => {
  try {
    const res = await axios.post('http://localhost:5000/api/users/login', formData);
    const { token, ...userData } = res.data;
    login(userData, token); // Store user and token via auth context
    // ... redirect
  } catch (error) {
    // ... handle error
  }
};
```

---

## 7. Logout Flow

**Updated in App.jsx:**

```jsx
const handleLogout = () => {
  logout(); // Clears localStorage, sessionStorage, and resets auth state
  navigate('/login', { replace: true }); // Redirect after logout
};
```

**Cleanup performed:**
- Removes `user` from localStorage
- Removes `authToken` from localStorage
- Removes `user` from sessionStorage
- Removes `authToken` from sessionStorage
- Resets auth state to null
- Prevents browser back-button access to protected pages

---

## 8. Protected Component Examples

### Example 1: RoomDetails.jsx (Action Guard)

Booking and review submission now require authentication:

```jsx
import { useAuth } from '../context/AuthContext';
import useRequireAuth from '../hooks/useRequireAuth';

const handleProceedToPayment = () => {
  if (!requireAuth('Please log in to book a room')) return;
  // Proceed with booking...
};

const handleSubmitReview = (e) => {
  if (!requireAuth('Please log in to write a review')) return;
  // Proceed with review...
};
```

---

## 9. Adding Auth Protection to New Components

### For Action Buttons (UI Guards):

```jsx
import useRequireAuth from '../hooks/useRequireAuth';

const MyActionButton = () => {
  const requireAuth = useRequireAuth('Custom message');
  
  const handleClick = () => {
    if (!requireAuth('Please log in to perform this action')) return;
    // Your action code here
  };
  
  return <button onClick={handleClick}>Do Something</button>;
};
```

### For Protected Routes:

```jsx
// In App.jsx routes
<Route path="/my-protected-page" element={
  <ProtectedRoute>
    <MyComponent />
  </ProtectedRoute>
} />
```

### For Components Needing User Data:

```jsx
import { useAuth } from '../context/AuthContext';

const MyProfile = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <div>Welcome, {user.name}</div>;
};
```

---

## 10. API Error Handling

The axios interceptor automatically handles HTTP 401 responses by:
1. Logging the user out
2. Clearing all auth data
3. Redirecting to login page

No additional error handling needed in components for 401 errors.

---

## 11. Security Checklist

✅ **Protected Routes**
- Profile page
- Payment page
- Admin dashboard

✅ **UI Action Guards**
- Book Now button (RoomDetails)
- Review submission (RoomDetails)
- Can be extended to other actions

✅ **Logout Flow**
- Comprehensive storage cleanup
- Prevents back-button access
- Resets auth state

✅ **API Security**
- Token attached to all requests
- 401 responses handled automatically

✅ **Auth State Management**
- Global context-based
- Persists across page refreshes
- Handles corrupted data gracefully

---

## 12. Future Enhancements

- Implement refresh token rotation
- Add JWT expiration handling
- Add role-based access control (RBAC) in ProtectedRoute
- Implement 2FA
- Add session timeout warnings
- Implement persistent auth state across tabs

---

## File Structure Summary

```
src/
├── context/
│   ├── AuthContext.jsx         ← Global auth state management
│   └── ThemeContext.jsx
├── components/
│   └── ProtectedRoute.jsx      ← Protected route wrapper
├── hooks/
│   └── useRequireAuth.js       ← UI action guard hook
├── services/
│   ├── axiosInterceptor.js     ← API interceptor setup
│   └── hotelDataService.js
├── pages/
│   ├── Login.jsx               ← Updated for auth context
│   ├── RoomDetails.jsx         ← Updated with auth guards
│   └── [other pages]
├── App.jsx                     ← Updated with routes & logout
└── main.jsx                    ← Updated with AuthProvider
```

---

## Testing the Implementation

### Test 1: Protected Route Access
1. Log out or clear localStorage
2. Try accessing `/profile`, `/payment`, or `/admin`
3. Should redirect to `/login`

### Test 2: Action Guard
1. Log out
2. Go to `/rooms/{id}`
3. Click "Book Now" or try to submit a review
4. Should see toast and redirect to login

### Test 3: Logout
1. Log in
2. Click logout
3. Try browser back button
4. Should not access protected pages

### Test 4: API 401 Handling
1. Manually expire token in localStorage or remove it
2. Make an API call from a protected page
3. Should automatically log out and redirect to login

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify token is stored in localStorage
3. Ensure AuthProvider wraps entire app
4. Check API response includes token field

