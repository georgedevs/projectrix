'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, signOut, getIdTokenResult } from 'firebase/auth';
import { auth, githubProvider } from '../utils/firebase';
import { useRouter } from 'next/navigation';
import api from '../utils/api';
import { toast } from 'sonner';

// Define user type
export type UserData = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  githubId: string;
  username: string;
  skills: string[];
  projectIdeasLeft?: number;
  projectsGenerated?: number;
  createdAt?: string;
  role?: string;
  plan?: string;
};

// Define context type
type AuthContextType = {
  user: UserData | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  isAuthenticated: boolean;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  refreshUserData: async () => {},
  refreshToken: async () => null,
  isAuthenticated: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Constants
const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
const TOKEN_REFRESH_THRESHOLD = 15 * 60; // 15 minutes in seconds

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to get user data from backend
  const fetchUserData = async (token: string) => {
    try {
      // Set token in localStorage for API interceptor
      localStorage.setItem('token', token);
      
      // Call backend to authenticate and get user data
      const response = await api.post('/auth/github', { token });
      setUser(response.data.user);
      
      return response.data.user;
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to authenticate';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };
  
  // Function to refresh the Firebase token
  const refreshToken = async (): Promise<string | null> => {
    try {
      if (firebaseUser) {
        // Check current token's expiration
        const tokenResult = await getIdTokenResult(firebaseUser);
        const expirationTime = new Date(tokenResult.expirationTime).getTime();
        const currentTime = Date.now();
        
        // Only force refresh if we're close to expiration
        // This helps avoid unnecessary token refreshes
        if ((expirationTime - currentTime) / 1000 < TOKEN_REFRESH_THRESHOLD) {
          console.log('Token close to expiration, forcing refresh...');
          // Force token refresh
          const token = await firebaseUser.getIdToken(true);
          localStorage.setItem('token', token);
          console.log('Token refreshed successfully');
          
          // Schedule next refresh
          scheduleTokenRefresh();
          return token;
        } else {
          // Get current token without forcing refresh
          const token = await firebaseUser.getIdToken(false);
          return token;
        }
      }
      return null;
    } catch (err) {
      console.error('Token refresh failed:', err);
      // Handle specific errors here
      if (err.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection.');
      } else if (err.code === 'auth/user-token-expired') {
        // Force re-login
        toast.error('Your session has expired. Please log in again.');
        await logout();
      }
      return null;
    }
  };

  // Schedule periodic token refresh
  const scheduleTokenRefresh = () => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    
    // Set new timer
    refreshTimerRef.current = setTimeout(async () => {
      console.log('Scheduled token refresh running...');
      await refreshToken();
    }, TOKEN_REFRESH_INTERVAL);
  };

  // Function to refresh user data from backend
  const refreshUserData = async () => {
    try {
      if (!user) return;
      
      const response = await api.get('/auth/refresh');
      setUser(response.data.user);
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      // If we get a 401, the token might be invalid
      if (err.response?.status === 401) {
        // Try to refresh the token
        const newToken = await refreshToken();
        if (newToken) {
          // Retry with new token
          try {
            const response = await api.get('/auth/refresh');
            setUser(response.data.user);
          } catch (retryErr) {
            console.error('Failed to refresh user data after token refresh:', retryErr);
          }
        }
      }
    }
  };

  // Login function
  const login = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign in with GitHub popup
      const result = await signInWithPopup(auth, githubProvider);
      
      // Get the token
      const token = await result.user.getIdToken();
      
      // Fetch user data from backend
      await fetchUserData(token);
      
      // Schedule token refresh
      scheduleTokenRefresh();
      
      toast.success('Logged in successfully');
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed';
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Login popup was blocked. Please allow popups for this site.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login was cancelled. Please try again.';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with a different sign-in method.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      // If we have a user, call the backend logout
      if (user) {
        try {
          await api.post('/auth/logout');
        } catch (err) {
          console.error('Backend logout error:', err);
          // Continue with logout even if backend fails
        }
      }
      
      // Clear any refresh timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear user data
      setUser(null);
      
      toast.success('Logged out successfully');
      router.push('/');
    } catch (err: any) {
      console.error('Logout error:', err);
      toast.error('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setLoading(true);
        
        if (currentUser) {
          setFirebaseUser(currentUser);
          
          try {
            // Get current token
            const token = await currentUser.getIdToken();
            
            // If we don't have user data yet, fetch it
            if (!user) {
              await fetchUserData(token);
            }
            
            // Set up token refresh
            scheduleTokenRefresh();
          } catch (tokenErr) {
            console.error('Error getting token:', tokenErr);
            // Handle token error
            if (tokenErr.code === 'auth/user-token-expired') {
              toast.error('Your session has expired. Please log in again.');
              await signOut(auth);
              setUser(null);
              localStorage.removeItem('token');
            }
          }
        } else {
          // User is signed out
          setFirebaseUser(null);
          setUser(null);
          localStorage.removeItem('token');
          
          // Clear any refresh timer
          if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
          }
        }
      } catch (err) {
        console.error('Auth state change error:', err);
      } finally {
        setLoading(false);
      }
    });

    // Clean up subscription and timer
    return () => {
      unsubscribe();
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // Value to provide in context
  const value = {
    user,
    firebaseUser,
    loading,
    error,
    login,
    logout,
    refreshUserData,
    refreshToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};