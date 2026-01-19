import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and Key
const supabaseUrl = 'https://xyxfyqmmxbmdtxzvmcyl.supabase.co';
const supabaseKey = 'sb_publishable_03RmmXU-pcDP2SIOsyuH4g_dXfAMz5-'; 

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});