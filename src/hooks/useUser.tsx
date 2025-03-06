
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { Session } from '@supabase/supabase-js';

interface UserContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active session on mount
    const getSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        // Get user profile data if user is authenticated
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
        } else if (data) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            firstName: data.name.split(' ')[0] || '',
            lastName: data.name.split(' ').slice(1).join(' ') || '',
            isAdmin: data.is_admin
          });
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
        }
      }
      
      setIsLoading(false);
    };

    getSession();

    // Set up subscription for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (session?.user) {
        // Update user state when auth state changes
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching user profile:', error);
            } else if (data) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                firstName: data.name.split(' ')[0] || '',
                lastName: data.name.split(' ').slice(1).join(' ') || '',
                isAdmin: data.is_admin
              });
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
              });
            }
            setIsLoading(false);
          });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        // Create user profile with combined name for first and last name
        const fullName = `${firstName} ${lastName}`;
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: fullName,
            email
          });

        if (profileError) throw profileError;
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');

      // Update profile in database (combine first and last name to name field)
      const fullName = updates.firstName && updates.lastName 
        ? `${updates.firstName} ${updates.lastName}`
        : updates.firstName 
          ? updates.firstName 
          : updates.lastName 
            ? updates.lastName 
            : user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`
              : '';

      const { error } = await supabase
        .from('profiles')
        .update({
          name: fullName || undefined
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser({
        ...user,
        ...updates
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
