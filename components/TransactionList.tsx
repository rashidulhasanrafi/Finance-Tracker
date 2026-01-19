import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Transaction, TransactionType, TRANSLATIONS, Language, convertAmount, getLocalizedCategory } from '../types';
import { 
  Trash2, Coffee, Home, Bus, Zap, ShoppingBag, Stethoscope, GraduationCap, 
  DollarSign, TrendingUp, Gift, Briefcase, HelpCircle, Plane, Shield, 
  RefreshCw, Smile, Heart, Landmark, Percent, Award, Building2, RotateCcw, CreditCard, Tag, Pencil,
  AlertTriangle, PiggyBank, Coins, Banknote, Gem, BarChart3, Lock, ArrowDownLeft, Wallet
} from 'lucide-react-native';
import { playSound } from '../utils/sound';
import { safeCopy } from '../utils/clipboard';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  currency: string;
  language: Language;
  soundEnabled: boolean;
}

const getCategoryIcon = (category: string) => {
  const size = 18;
  const color = "#475569"; // Default slate-600
  // In RN we pass color props or styled parent. Simple switch for icon component:
  switch (category) {
    case 'Food & Dining': return <Coffee size={size} color={color} />;
    case 'Rent & Housing': return <Home size={size} color={color} />;
    case 'Transportation': return <Bus size={size} color={color} />;
    case 'Utilities': return <Zap size={size} color={color} />;
    case 'Shopping': return <ShoppingBag size={size} color={color} />;
    case 'Healthcare': return <Stethoscope size={size} color={color} />;
    case 'Education': return <GraduationCap size={size} color={color} />;
    case 'Travel': return <Plane size={size} color={color} />;
    case 'Insurance': return <Shield size={size} color={color} />;
    case 'Subscriptions': return <RefreshCw size={size} color={color} />;
    case 'Personal Care': return <Smile size={size} color={color} />;
    case 'Gifts & Donations': return <Heart size={size} color={color} />;
    case 'Taxes': return <Landmark size={size} color={color} />;
    case 'Debt Payments': return <CreditCard size={size} color={color} />;
    
    case 'Salary': return <DollarSign size={size} color={color} />;
    case 'Investments': return <TrendingUp size={size} color={color} />;
    case 'Gifts': return <Gift size={size} color={color} />;
    case 'Freelance': return <Briefcase size={size} color={color} />;
    case 'Dividends': return <Percent size={size} color={color} />;
    case 'Royalties': return <Award size={size} color={color} />;
    case 'Grants': return <Landmark size={size} color={color} />;
    case 'Rental Income': return <Building2 size={size} color={color} />;
    case 'Refunds': return <RotateCcw size={size} color={color} />;
    case 'Other Income': return <HelpCircle size={size} color={color} />;

    case 'Emergency Fund': return <Shield size={size} color={color} />;
    case 'Bank Deposit': return <Landmark size={size} color={color} />;
    case 'DPS': return <Lock size={size} color={color} />;
    case 'Investments': return <BarChart3 size={size} color={color} />;
    case 'Gold': return <Gem size={size} color={color} />;
    case 'Stocks': return <TrendingUp size={size} color={color} />;
    case 'Cash Savings': return <Banknote size={size} color={color} />;
    case 'Crypto': return <Coins size={size} color={color} />;
    case 'Retirement': return <Home size={size} color={color} />;
    case 'Goal Saving': return <PiggyBank size={size} color={color} />;
    case 'General Savings': return <Wallet size={size} color={color} />;
    case 'Savings Withdrawal': return <ArrowDownLeft size={size} color={color} />;
    case 'Fixed Deposit': return <Lock size={size} color={color} />;
    
    default: return <Tag size={size} color={color} />;
  }
};

const getTypeStyles = (type: TransactionType, amount: number, excludeFromBalance?: boolean) => {
  switch (type) {
    case TransactionType.INCOME:
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        sign: '+'
      };
    case TransactionType.SAVINGS:
      if (amount < 0) {
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-600 dark:text-blue-400',
          sign: '+' 
        };
      }
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        sign: excludeFromBalance ? '' : '-' 
      };
    case TransactionType.EXPENSE:
    default:
      return {
        bg: 'bg-rose-100 dark:bg-rose-900/30',
        text: 'text-rose-600 dark:text-rose-400',
        sign: '-'
      };
  }
};

export const TransactionList: React.FC<Props> = ({ transactions, onDelete, onEdit, currency, language, soundEnabled }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const t = TRANSLATIONS[language].list;
  const locale = language === 'bn' ? 'bn-BD' : 'en-US';

  const formatConvertedAmount = (amount: number, fromCurrency: string) => {
    const converted = convertAmount(Math.abs(amount), fromCurrency || 'USD', currency);
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(converted);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
      if (soundEnabled) playSound('delete');
    }
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteId(id);
    if (soundEnabled) playSound('click');
  };

  if (transactions.length === 0) {
    return (
      <View className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-white/30 dark:border-white/10 items-center justify-center min-h-[300px]">
        <View className="bg-slate-50 dark:bg-slate-700 p-4 rounded-full mb-3">
          <ShoppingBag size={32} color="#94a3b8" />
        </View>
        <Text className="text-slate-800 dark:text-white font-medium mb-1 text-lg">{t.emptyTitle}</Text>
        <Text className="text-slate-500 dark:text-slate-400 text-sm text-center">{t.emptyDesc}</Text>
      </View>
    );
  }

  return (
    <>
      <View className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-white/30 dark:border-white/10 overflow-hidden mt-6">
        <View className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-700/30">
          <Text className="text-lg font-semibold text-slate-800 dark:text-white">{t.title}</Text>
        </View>
        <ScrollView className="max-h-[500px]">
          {transactions.map((t, index) => {
             const styles = getTypeStyles(t.type, t.amount, t.excludeFromBalance);
             return (
              <TouchableOpacity 
                key={t.id} 
                onPress={() => onEdit(t)}
                className="p-4 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-700"
              >
                <View className="flex-row items-center gap-4 flex-1">
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${styles.bg}`}>
                    {getCategoryIcon(t.category)}
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-slate-800 dark:text-slate-200">
                      {getLocalizedCategory(t.category, language)}
                    </Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400">{t.note || t.date}</Text>
                  </View>
                </View>
                
                <View className="flex-row items-center gap-3">
                  <Text className={`font-semibold ${styles.text}`}>
                    {t.type === TransactionType.SAVINGS && t.excludeFromBalance ? '' : styles.sign}
                    {formatConvertedAmount(t.amount, t.currency)}
                  </Text>
                  
                  <TouchableOpacity 
                      onPress={(e) => { e.stopPropagation(); handleDeleteRequest(t.id); }}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700"
                  >
                      <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Modal visible={!!deleteId} transparent animationType="fade">
        <View className="flex-1 items-center justify-center p-4 bg-black/50">
          <View className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-white/20 dark:border-white/10">
            <View className="items-center text-center">
              <View className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 items-center justify-center mb-4">
                <AlertTriangle size={24} color="#e11d48" />
              </View>
              <Text className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {t.deleteTitle}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 mb-6 text-sm text-center">
                {t.deleteConfirm}
              </Text>
              <View className="flex-row gap-3 w-full">
                <TouchableOpacity
                  onPress={() => setDeleteId(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-700 items-center"
                >
                  <Text className="text-slate-700 dark:text-slate-200 font-medium">{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 items-center"
                >
                  <Text className="text-white font-medium">{t.confirm}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};