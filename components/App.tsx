import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { Auth } from './Auth';
import { Tracker } from './Tracker';
import { Language } from '../types';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Theme
        const savedTheme = await AsyncStorage.getItem('zenfinance_theme');
        setDarkMode(savedTheme === 'dark');

        // 2. Language
        const savedLanguage = await AsyncStorage.getItem('zenfinance_language');
        if (savedLanguage === 'en' || savedLanguage === 'bn') {
          setLanguage(savedLanguage);
        }

        // 3. Guest Mode
        const savedGuestState = await AsyncStorage.getItem('zenfinance_is_guest');
        if (savedGuestState === 'true') {
          setIsGuest(true);
        }

        // 4. Session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (e) {
        console.error("Init failed", e);
      } finally {
        setLoading(false);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsGuest(false);
        AsyncStorage.removeItem('zenfinance_is_guest');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGuestLogin = async () => {
    setIsGuest(true);
    await AsyncStorage.setItem('zenfinance_is_guest', 'true');
  };

  const handleLogout = async () => {
    if (isGuest) {
      setIsGuest(false);
      await AsyncStorage.removeItem('zenfinance_is_guest');
    } else {
      await supabase.auth.signOut();
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    AsyncStorage.setItem('zenfinance_theme', newMode ? 'dark' : 'light');
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    AsyncStorage.setItem('zenfinance_language', lang);
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
      <SafeAreaView className={`flex-1 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top', 'left', 'right']}>
        <StatusBar style={darkMode ? 'light' : 'dark'} backgroundColor={darkMode ? '#0f172a' : '#f8fafc'} />
        {session || isGuest ? (
          <Tracker 
            key={userId}
            userId={userId} 
            profileName={profileName}
            userEmail={session?.user?.email}
            onLogout={handleLogout} 
            language={language}
            onLanguageChange={handleLanguageChange}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            soundEnabled={true} // Defaulting to true as sound utils are stubbed
            toggleSound={() => {}}
            onClearAllData={() => {}}
            onExportData={() => {}}
            onImportData={() => {}}
          />
        ) : (
          <Auth onGuestLogin={handleGuestLogin} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}