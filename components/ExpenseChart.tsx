import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Transaction, TransactionType, TRANSLATIONS, Language, convertAmount, getLocalizedCategory } from '../types';

interface Props {
  transactions: Transaction[];
  currency: string;
  language: Language;
  darkMode?: boolean;
}

const COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4'];

export const ExpenseChart: React.FC<Props> = ({ transactions, currency, language, darkMode }) => {
  const t = TRANSLATIONS[language].chart;
  const screenWidth = Dimensions.get('window').width;

  const expenseData = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => {
      const convertedAmount = convertAmount(curr.amount, curr.currency || 'USD', currency);
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += convertedAmount;
      } else {
        acc.push({ name: curr.category, value: convertedAmount });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      name: getLocalizedCategory(item.name, language),
      population: item.value,
      color: COLORS[index % COLORS.length],
      legendFontColor: darkMode ? "#e2e8f0" : "#1e293b",
      legendFontSize: 12
    }));

  if (expenseData.length === 0) {
    return (
      <View className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 items-center justify-center min-h-[250px] my-4">
        <View className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 mb-4" />
        <Text className="text-slate-400 dark:text-slate-500 text-sm">{t.empty}</Text>
      </View>
    );
  }

  return (
    <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 my-4">
      <Text className="text-lg font-semibold text-slate-800 dark:text-white mb-4 ml-2">{t.title}</Text>
      <PieChart
        data={expenseData}
        width={screenWidth - 64} // Adjust for padding
        height={220}
        chartConfig={{
          backgroundColor: darkMode ? "#1e293b" : "#ffffff",
          backgroundGradientFrom: darkMode ? "#1e293b" : "#ffffff",
          backgroundGradientTo: darkMode ? "#1e293b" : "#ffffff",
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        center={[10, 0]}
        absolute
      />
    </View>
  );
};