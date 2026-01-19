import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { BookOpen, Coins, TrendingUp, Receipt, PieChart, NotebookPen, CreditCard, Wallet, Banknote } from 'lucide-react-native';

interface Props {
  onFinish: () => void;
  soundEnabled: boolean;
}

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const [stage, setStage] = useState<'book' | 'reveal' | 'finished'>('book');
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    // Stage Transitions
    const timer1 = setTimeout(() => setStage('reveal'), 2500);
    const timer2 = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setStage('finished');
        onFinish();
      });
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  if (stage === 'finished') return null;

  return (
    <Animated.View style={{ opacity: fadeAnim }} className="absolute inset-0 z-50 bg-slate-900 flex-1 items-center justify-center">
      {stage === 'book' && (
        <View className="items-center justify-center">
           <View className="mb-8">
              <BookOpen size={100} color="white" />
           </View>
           <Text className="text-white font-bold text-xl">Loading...</Text>
        </View>
      )}

      {stage === 'reveal' && (
        <View className="items-center">
          <View className="bg-green-600 p-6 rounded-3xl mb-6 shadow-xl">
            <NotebookPen color="white" size={64} />
          </View>
          <Text className="text-5xl font-bold text-white mb-2">
            Hisab
          </Text>
          <Text className="text-slate-400 font-light tracking-widest text-sm uppercase">
            Expense Tracker
          </Text>
        </View>
      )}
    </Animated.View>
  );
};