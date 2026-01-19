import React from 'react';
import { View, Text } from 'react-native';
import { DashboardStats as StatsType, TRANSLATIONS, Language } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Wallet, PiggyBank } from 'lucide-react-native';

interface Props {
  stats: StatsType;
  currency: string;
  language: Language;
}

export const DashboardStats: React.FC<Props> = ({ stats, currency, language }) => {
  const t = TRANSLATIONS[language].dashboard;
  const locale = language === 'bn' ? 'bn-BD' : 'en-US';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const cards = [
    {
      label: t.balance,
      value: stats.balance,
      colorClass: stats.balance >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-600 dark:text-rose-400',
      icon: <Wallet size={24} color={stats.balance >= 0 ? '#475569' : '#e11d48'} />,
      bgIcon: 'bg-slate-50 dark:bg-slate-700',
      textIcon: 'text-slate-600 dark:text-slate-300',
    },
    {
      label: t.income,
      value: stats.totalIncome,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      icon: <ArrowUpCircle size={24} color="#059669" />,
      bgIcon: 'bg-emerald-50 dark:bg-emerald-900/30',
      textIcon: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: t.expense,
      value: stats.totalExpense,
      colorClass: 'text-rose-600 dark:text-rose-400',
      icon: <ArrowDownCircle size={24} color="#e11d48" />,
      bgIcon: 'bg-rose-50 dark:bg-rose-900/30',
      textIcon: 'text-rose-600 dark:text-rose-400',
    },
    {
      label: t.savings,
      value: stats.totalSavings,
      colorClass: 'text-blue-600 dark:text-blue-400',
      icon: <PiggyBank size={24} color="#2563eb" />,
      bgIcon: 'bg-blue-50 dark:bg-blue-900/30',
      textIcon: 'text-blue-600 dark:text-blue-400',
    }
  ];

  return (
    <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
      {cards.map((card, index) => (
        <View 
          key={index}
          className="w-[48%] bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 justify-between min-h-[110px]"
        >
          <View>
            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{card.label}</Text>
            <Text className={`text-lg font-bold ${card.colorClass}`} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(card.value)}
            </Text>
          </View>
          <View className={`self-end p-2 rounded-full ${card.bgIcon}`}>
            {card.icon}
          </View>
        </View>
      ))}
    </View>
  );
};