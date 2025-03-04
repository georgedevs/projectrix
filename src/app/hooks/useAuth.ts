// hooks/useAuth.ts
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { auth, githubProvider } from '../utils/firebase';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { loginWithGithub, logoutUser } from '../store/features/userSlice';
import type { RootState, AppDispatch } from '../store';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, loading, error } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser && !user) {
        try {
          const token = await firebaseUser.getIdToken();
          await dispatch(loginWithGithub(token)).unwrap();
        } catch (error: any) {
          console.error('Auth sync error:', error);
          toast.error('Authentication failed');
        }
      }
    });

    return () => unsubscribe();
  }, [dispatch, user]);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const token = await result.user.getIdToken();
      await dispatch(loginWithGithub(token)).unwrap();
      toast.success('Login successful');
      router.push('/profile');
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, githubProvider);
        } catch (redirectError) {
          console.error('Redirect failed:', redirectError);
          toast.error('Login failed');
        }
      } else {
        console.error('Login error:', error);
        toast.error('Login failed');
      }
    }
  };

  const logout = async () => {
    try {
      // Get current Firebase token before signing out
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const token = await currentUser.getIdToken();
      
      // First, call our backend logout
      await dispatch(logoutUser(token)).unwrap();
      
      // Then sign out from Firebase
      await auth.signOut();
      
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
      
      // Attempt to clean up even if there was an error
      try {
        await auth.signOut();
      } catch (signOutError) {
        console.error('Firebase signout error:', signOutError);
      }
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
};