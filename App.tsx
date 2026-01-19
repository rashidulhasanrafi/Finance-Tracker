import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { supabase } from './utils/supabase';
import { Auth } from './components/Auth';
import { Tracker } from './components/Tracker';
import { Language } from './types';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check Guest Persistence
    AsyncStorage.getItem('zenfinance_is_guest').then(val => {
      if (val === 'true') setIsGuest(true);
    });

    // Check Auth Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsGuest(false);
        AsyncStorage.removeItem('zenfinance_is_guest');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGuestLogin = () => {
    setIsGuest(true);
    AsyncStorage.setItem('zenfinance_is_guest', 'true');
  };

  const handleLogout = async () => {
    if (isGuest) {
      setIsGuest(false);
      await AsyncStorage.removeItem('zenfinance_is_guest');
    } else {
      await supabase.auth.signOut();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const userId = session ? session.user.id : 'guest';
  const profileName = session ? (session.user.email?.split('@')[0] || 'User') : 'Guest';

  return (
    <SafeAreaProvider>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      {session || isGuest ? (
        <Tracker 
          userId={userId}
          profileName={profileName}
          userEmail={session?.user?.email}
          onLogout={handleLogout}
          language={language}
          onLanguageChange={setLanguage}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
          onClearAllData={() => {}}
        />
      ) : (
        <Auth onGuestLogin={handleGuestLogin} />
      )}
    </SafeAreaProvider>
  );
}