import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Transaction, DashboardStats, TRANSLATIONS, Language } from './types';
import { generateFinancialTip } from './services/geminiService';
import { Sparkles, Lightbulb, Send } from 'lucide-react-native';

interface Props {
  transactions: Transaction[];
  stats: DashboardStats;
  language: Language;
  currency: string;
}

export const AISuggestion: React.FC<Props> = ({ transactions, stats, language, currency }) => {
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  
  const t = TRANSLATIONS[language].ai;

  const handleGetInsight = async () => {
    setLoading(true);
    try {
      const result = await generateFinancialTip(transactions, stats, language, currency, question);
      setTip(result);
    } catch (e) {
      setTip(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 mt-6 relative overflow-hidden">
      
      <View className="flex-row items-center gap-2 mb-3 z-10">
        <Sparkles color="#4f46e5" size={20} />
        <Text className="font-semibold text-indigo-900 dark:text-indigo-200">{t.title}</Text>
      </View>

      <Text className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mb-4 z-10">
        {t.desc}
      </Text>

      {/* Input Area */}
      <View className="z-10 mb-4">
        <TextInput 
          value={question}
          onChangeText={setQuestion}
          placeholder={t.placeholder}
          placeholderTextColor="#818cf8"
          className="w-full px-4 py-3 bg-white/70 dark:bg-slate-800/70 border border-indigo-200 dark:border-indigo-700 rounded-xl text-sm text-slate-900 dark:text-white"
        />
      </View>

      {tip && (
        <View className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-4 z-10">
          <View className="flex-row gap-3">
             <View className="mt-0.5">
               <Lightbulb size={18} color="#eab308" />
             </View>
             <Text className="text-indigo-900 dark:text-indigo-100 text-sm leading-relaxed font-medium flex-1">
               "{tip}"
             </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={handleGetInsight}
        disabled={loading}
        className={`z-10 w-full bg-indigo-600 py-3 rounded-lg flex-row items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}
      >
        {loading ? (
          <>
            <ActivityIndicator color="white" size="small" />
            <Text className="text-white font-medium ml-2">{t.analyzing}</Text>
          </>
        ) : (
          <>
            {question ? <Send size={16} color="white" /> : <Sparkles size={16} color="white" />}
            <Text className="text-white font-medium text-sm">
              {question ? t.askBtn : t.btn}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};