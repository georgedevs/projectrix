// app/api/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a base query with auth headers
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  prepareHeaders: (headers) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If we have a token, add it to the headers
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
  credentials: 'include',
});

// Create our API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Projects', 
    'SavedProjects',
    'CurrentProject',
    'User',
    'MyCollaborations',
    'IncomingRequests',
    'MyProjects',
    'PublishedProjects',
    'MyRequests',
    'Conversations',
    'UserProfile',
    'PublicProfile',
    'MyFeedback',
    'PublicFeedback',
    'AdminFeedback',
    'Activities',
    'UnreadCount',
    'CollaborationMetrics',
    'RevenueMetrics',
    'SystemMetrics',
    'ProjectMetrics',
    'AdminDashboard',
    'UserMetrics',
    'AdminUsers',
    'PaymentHistory',
    'Subscription'
    
  ],
  endpoints: () => ({}),
});