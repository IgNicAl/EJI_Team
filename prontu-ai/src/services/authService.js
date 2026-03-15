// ============================================
// Auth Service — Supabase Auth
// ============================================

import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Timeout helper for promises to prevent infinite hangs
 */
async function withTimeout(promise, ms = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`A conexão expirou após ${ms / 1000}s. Verifique sua internet ou VPN.`));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Sign in with email and password via Supabase Auth.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object, session: object }>}
 */
export async function signIn(email, password) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await withTimeout(
    supabase.auth.signInWithPassword({
      email,
      password,
    })
  );

  if (error) throw error;
  return data;
}

/**
 * Sign out from Supabase Auth.
 */
export async function signOut() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current auth session.
 *
 * @returns {Promise<{ session: object | null }>}
 */
export async function getSession() {
  if (!isSupabaseConfigured()) return { session: null };
  const { data } = await supabase.auth.getSession();
  return data;
}

/**
 * Subscribe to auth state changes.
 *
 * @param {Function} callback — receives (event, session)
 * @returns {{ unsubscribe: Function }}
 */
export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}

/**
 * Get the doctor profile associated to the current auth user.
 *
 * @returns {Promise<object | null>}
 */
export async function getCurrentDoctor() {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data: { user }, error: userError } = await withTimeout(supabase.auth.getUser());
    if (userError || !user) return null;

    const { data, error } = await withTimeout(
      supabase
        .from('doctors')
        .select('*')
        .eq('auth_id', user.id)
        .single()
    );

    if (error) {
      console.error('[Auth] Failed to fetch doctor profile:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Auth] getCurrentDoctor timeout/error:', err.message);
    return null;
  }
}
