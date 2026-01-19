import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyxfyqmmxbmdtxzvmcyl.supabase.co';
const supabaseKey = 'sb_publishable_03RmmXU-pcDP2SIOsyuH4g_dXfAMz5-'; // Ensure this key is valid in your environment

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});