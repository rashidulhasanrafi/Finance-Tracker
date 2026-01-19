import React, { useEffect, useState, PropsWithChildren } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Lock, ArrowRight, AlertTriangle } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// In Expo, we can't fetch files like web. We'll rely on a hardcoded check 
// or import a local config if available.
// For this conversion, we assume the password logic is internal.
const APP_PASSWORD = "hisab123"; 

export default function PasswordGate({
  children,
}: PropsWithChildren) {
  const [input, setInput] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('hisab_auth').then(val => {
        if (val === 'true') {
            setAllowed(true);
        }
        setLoading(false);
    });
  }, []);

  const handleUnlock = async () => {
    if (input === APP_PASSWORD) {
      setAllowed(true);
      await AsyncStorage.setItem('hisab_auth', 'true');
      setError(false);
    } else {
      setError(true);
    }
  };

  if (loading) {
    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900 items-center justify-center">
            <ActivityIndicator size="large" color="#4f46e5" />
        </View>
    );
  }

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900 items-center justify-center p-4">
      <View className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100 dark:border-slate-700">
        <View className="items-center mb-6">
            <View className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center mb-4">
                <Lock size={32} color="#4f46e5" />
            </View>
            <Text className="text-xl font-bold text-slate-800 dark:text-white">Welcome to Hisab</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center">
              Please enter the password to access your tracker.
            </Text>
        </View>
        
        <View>
            <TextInput
              secureTextEntry
              value={input}
              onChangeText={(t) => { setInput(t); setError(false); }}
              placeholder="Enter Password"
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border ${error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-600'} rounded-xl mb-4 dark:text-white`}
              autoCapitalize="none"
            />
             {error && (
                <Text className="text-xs text-rose-500 mb-2 ml-1">Incorrect password.</Text>
            )}
            
            <TouchableOpacity
              onPress={handleUnlock}
              className="w-full bg-indigo-600 py-3 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Text className="text-white font-medium">Unlock</Text>
              <ArrowRight size={18} color="white" />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}