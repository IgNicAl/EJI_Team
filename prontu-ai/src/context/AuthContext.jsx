import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentDoctor, signIn as authSignIn, signOut as authSignOut } from '../services/authService.js';
import { isSupabaseConfigured } from '../lib/supabase.js';

const AuthContext = createContext(null);

/**
 * AuthProvider manages Supabase Auth session and doctor profile.
 *
 * When Supabase is not configured, it provides a mock doctor for development.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback doctor for development when Supabase is not configured
  const mockDoctor = {
    id: '00000000-0000-4000-a000-000000000001',
    name: 'Dr. Rafael Mendes',
    specialty: 'Clínica Geral',
    crm: 'CRM/SP 123456',
    email: 'rafael.mendes@prontu.ai',
    phone: '+55 11 99999-0001',
    avatar: 'RM',
    whatsapp_connected: true,
    role: 'doctor',
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Dev mode: no Supabase, use mock data
      setDoctor(mockDoctor);
      setLoading(false);
      return;
    }

    // Listen for auth state changes
    const subscription = onAuthStateChange(async (event, newSession) => {
      try {
        setSession(newSession);

        if (newSession?.user) {
          const profile = await getCurrentDoctor();
          setDoctor(profile);
        } else {
          setDoctor(null);
        }
      } catch (err) {
        console.error('[AuthContext] Auth state change error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function signIn(email, password) {
    if (!isSupabaseConfigured()) {
      setDoctor(mockDoctor);
      return { user: mockDoctor, session: {} };
    }

    const result = await authSignIn(email, password);

    // Fetch doctor profile immediately so isAuthenticated is true
    // before the caller navigates away
    if (result?.session) {
      setSession(result.session);
      const profile = await getCurrentDoctor();
      setDoctor(profile);
    }

    return result;
  }

  async function signOut() {
    if (!isSupabaseConfigured()) {
      setDoctor(null);
      setSession(null);
      return;
    }

    await authSignOut();
    setDoctor(null);
    setSession(null);
  }

  /**
   * Bypass login for demo mode (no Supabase connection needed).
   * @param {'doctor' | 'admin'} role
   */
  function demoLogin(role = 'doctor') {
    setDoctor({ ...mockDoctor, role });
    setSession({ demo: true });
    setLoading(false);
  }

  const value = {
    session,
    doctor,
    loading,
    isAuthenticated: !!doctor,
    isDemo: !isSupabaseConfigured() || session?.demo === true,
    signIn,
    signOut,
    demoLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
