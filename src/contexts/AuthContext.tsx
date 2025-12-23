import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: 'member' | 'pastor' | 'admin';
  isLoading: boolean;
  isPastor: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<'member' | 'pastor' | 'admin'>('member');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  const fetchUserRole = async (userId: string) => {
    // Use the secure RPC function to get user role
    const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });
    
    if (!error && data) {
      setUserRole(data as 'member' | 'pastor' | 'admin');
    } else {
      // Fallback to checking user_roles table directly
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (roleData && roleData.length > 0) {
        // Check for highest role
        const roles = roleData.map(r => r.role);
        if (roles.includes('admin')) {
          setUserRole('admin');
        } else if (roles.includes('pastor')) {
          setUserRole('pastor');
        } else {
          setUserRole('member');
        }
      } else {
        setUserRole('member');
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile and role fetch with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole('member');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchUserRole(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUserRole('member');
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
      await fetchUserRole(user.id);
    }
  };

  const isPastor = userRole === 'pastor' || userRole === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      userRole,
      isLoading,
      isPastor,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
