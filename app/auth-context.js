'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange, createUser, signIn, signOutUser } from './_utils/firebase';

const AuthContext = createContext({
  user: null,
  loading: true,
  createUser: async () => {},
  signIn: async () => {},
  signOut: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    createUser: async (email, password) => {
      try {
        return await createUser(email, password);
      } catch (error) {
        throw error;
      }
    },
    signIn: async (email, password) => {
      try {
        return await signIn(email, password);
      } catch (error) {
        throw error;
      }
    },
    signOut: async () => {
      try {
        await signOutUser();
        router.push('/sign-in');
      } catch (error) {
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}