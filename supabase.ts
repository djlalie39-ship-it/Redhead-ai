// Simple auth state management for demo purposes
// In a real app, this would integrate with Supabase Auth

interface AuthState {
  user: {
    id: string;
    username: string;
    email: string;
    credits: number;
  } | null;
  isLoading: boolean;
}

class AuthManager {
  private state: AuthState = {
    user: null,
    isLoading: false,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    // Try to restore user from localStorage
    const savedUser = localStorage.getItem('redhead-user');
    if (savedUser) {
      this.state.user = JSON.parse(savedUser);
    }
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  async signIn(email: string, username?: string) {
    this.state.isLoading = true;
    this.notify();

    try {
      // For demo purposes, create a mock user
      const mockUser = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        username: username || email.split('@')[0],
        email: email,
        credits: 120
      };

      this.state.user = mockUser;
      this.state.isLoading = false;
      
      localStorage.setItem('redhead-user', JSON.stringify(mockUser));
      this.notify();
      
      return { user: mockUser };
    } catch (error) {
      this.state.isLoading = false;
      this.notify();
      throw error;
    }
  }

  async signUp(email: string, username: string, password: string) {
    this.state.isLoading = true;
    this.notify();

    try {
      // For demo purposes, create a mock user
      const mockUser = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        username: username,
        email: email,
        credits: 120
      };

      this.state.user = mockUser;
      this.state.isLoading = false;
      
      localStorage.setItem('redhead-user', JSON.stringify(mockUser));
      this.notify();
      
      return { user: mockUser };
    } catch (error) {
      this.state.isLoading = false;
      this.notify();
      throw error;
    }
  }

  async signOut() {
    this.state.user = null;
    localStorage.removeItem('redhead-user');
    this.notify();
  }

  updateCredits(credits: number) {
    if (this.state.user) {
      this.state.user.credits = credits;
      localStorage.setItem('redhead-user', JSON.stringify(this.state.user));
      this.notify();
    }
  }

  getUser() {
    return this.state.user;
  }

  isAuthenticated() {
    return this.state.user !== null;
  }
}

export const authManager = new AuthManager();

// React hook for using auth state
import { useState, useEffect } from 'react';

export function useAuth() {
  const [authState, setAuthState] = useState(authManager['state']);

  useEffect(() => {
    return authManager.subscribe(setAuthState);
  }, []);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.user !== null,
    signIn: authManager.signIn.bind(authManager),
    signUp: authManager.signUp.bind(authManager),
    signOut: authManager.signOut.bind(authManager),
    updateCredits: authManager.updateCredits.bind(authManager),
  };
}
