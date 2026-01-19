import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../utils/supabase';
import { Lock, Mail, User, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react-native';
import { styled } from 'nativewind';

interface Props {
  onGuestLogin?: () => void;
}

export const Auth: React.FC<Props> = ({ onGuestLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        Alert.alert('Success', 'Signup successful! Please check your email or log in.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900 justify-center p-6">
      <View className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-green-500 rounded-2xl items-center justify-center mb-4 transform rotate-3">
            <Lock size={32} color="white" />
          </View>
          <Text className="text-2xl font-bold text-slate-800 dark:text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center">
            {isSignUp ? 'Sign up to start tracking' : 'Login to access your Hisab tracker'}
          </Text>
        </View>

        <View className="space-y-4 gap-4">
          <View>
            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1">Email</Text>
            <View className="relative flex-row items-center">
              <View className="absolute left-3 z-10">
                <Mail size={18} color="#94a3b8" />
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white"
              />
            </View>
          </View>

          <View>
            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1">Password</Text>
            <View className="relative flex-row items-center">
              <View className="absolute left-3 z-10">
                <Lock size={18} color="#94a3b8" />
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1"
              >
                {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleAuth}
            disabled={loading}
            className="w-full bg-indigo-600 py-3 rounded-xl flex-row items-center justify-center mt-2"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center gap-2">
                {isSignUp ? <UserPlus size={20} color="white" /> : <LogIn size={20} color="white" />}
                <Text className="text-white font-medium text-base ml-2">
                  {isSignUp ? 'Sign Up' : 'Login'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <TouchableOpacity
            onPress={onGuestLogin}
            className="w-full bg-slate-100 dark:bg-slate-700 py-3 rounded-xl flex-row items-center justify-center gap-2"
          >
            <User size={20} color="#64748b" />
            <Text className="text-slate-700 dark:text-slate-200 font-medium">Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6 items-center">
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <Text
              onPress={() => setIsSignUp(!isSignUp)}
              className="font-medium text-indigo-600 dark:text-indigo-400 ml-2"
            >
              {isSignUp ? ' Login' : ' Sign Up'}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};