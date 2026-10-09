'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CURRENT_USER } from '@/lib/mock-data';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  companyName: string;
  city: string;
  countryCode: string;
  country: string;
  creditsBalance: number;
  onboarded: boolean;
  offerDescription?: string;
  targetDescription?: string;
  defaultLanguage: 'fr' | 'en';
  initials: string;
}

interface UserContextValue {
  user: { id: string; email?: string } | null;
  profile: UserProfile;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateCreditsOptimistic: (delta: number) => void;
  signOut: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  id: 'mock_user_id',
  email: CURRENT_USER.email,
  fullName: CURRENT_USER.name,
  role: CURRENT_USER.role,
  companyName: CURRENT_USER.company,
  city: CURRENT_USER.city,
  countryCode: 'CM',
  country: CURRENT_USER.country,
  creditsBalance: CURRENT_USER.creditsBalance,
  onboarded: true,
  defaultLanguage: 'fr',
  initials: CURRENT_USER.initials,
};

const UserContext = createContext<UserContextValue>({
  user: null,
  profile: defaultProfile,
  isLoading: true,
  refreshProfile: async () => {},
  updateCreditsOptimistic: () => {},
  signOut: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const getInitials = (name?: string | null): string => {
    if (!name) return 'PN';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const fetchProfile = useCallback(async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setProfile(defaultProfile);
        setIsLoading(false);
        return;
      }

      setUser({ id: authUser.id, email: authUser.email });

      const { data: dbProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('[UserProvider] Error loading profile:', error.message);
      }

      const fullName =
        dbProfile?.full_name ||
        (authUser.user_metadata?.full_name as string) ||
        CURRENT_USER.name;

      setProfile({
        id: authUser.id,
        email: authUser.email || CURRENT_USER.email,
        fullName,
        role: CURRENT_USER.role,
        companyName:
          dbProfile?.company_name ||
          (authUser.user_metadata?.company_name as string) ||
          CURRENT_USER.company,
        city: CURRENT_USER.city,
        countryCode: dbProfile?.country_code || 'CM',
        country: dbProfile?.country_code === 'CI' ? "Côte d'Ivoire" : 'Cameroun',
        creditsBalance:
          dbProfile?.credits_balance !== null && dbProfile?.credits_balance !== undefined
            ? dbProfile.credits_balance
            : 50,
        onboarded: dbProfile?.onboarded ?? true,
        offerDescription: dbProfile?.offer_description || undefined,
        targetDescription: dbProfile?.target_description || undefined,
        defaultLanguage: (dbProfile?.default_language as 'fr' | 'en') || 'fr',
        initials: getInitials(fullName),
      });
    } catch (err) {
      console.error('[UserProvider] Exception loading user:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await fetchProfile();
      } catch (e) {
        console.error(e);
      }
    };

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (mounted) {
        void fetchProfile();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase]);

  const updateCreditsOptimistic = (delta: number) => {
    setProfile((prev) => ({
      ...prev,
      creditsBalance: Math.max(0, prev.creditsBalance + delta),
    }));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(defaultProfile);
    router.push('/login');
    router.refresh();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        isLoading,
        refreshProfile: fetchProfile,
        updateCreditsOptimistic,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
