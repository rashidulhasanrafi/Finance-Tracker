import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView, StatusBar, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { Transaction, TransactionType, DashboardStats, CURRENCIES, Language, convertAmount, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_SAVINGS_CATEGORIES, TRANSLATIONS, Goal } from '../types';
import { NotebookPen, LogOut, Plus, Trash2, Settings, User as UserIcon } from 'lucide-react-native';

interface Props {
  userId: string;
  profileName: string;
  userEmail?: string;
  onLogout: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onClearAllData: () => void;
}

export const Tracker: React.FC<Props> = ({ 
  userId, 
  profileName,
  userEmail,
  onLogout,
  language,
  darkMode
}) => {
  const isGuest = userId === 'guest';
  const STORAGE_KEY = `zenfinance_transactions_${userId}`; 
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalIncome: 0, totalExpense: 0, totalSavings: 0, balance: 0 });
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.EXPENSE);
  const [note, setNote] = useState('');

  // Fetch Data
  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  // Calculate Stats
  useEffect(() => {
    if (isGuest) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }

    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = transactions
      .filter(t => t.type === TransactionType.SAVINGS)
      .reduce((sum, t) => sum + t.amount, 0);

    setStats({
      totalIncome: income,
      totalExpense: expense,
      totalSavings: savings,
      balance: income - expense
    });
  }, [transactions]);

  const fetchTransactions = async () => {
    try {
      if (isGuest) {
        const localData = await AsyncStorage.getItem(STORAGE_KEY);
        if (localData) {
            setTransactions(JSON.parse(localData));
        } else {
            setTransactions([]);
        }
      } else {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (error) throw error;
        if (data) {
            setTransactions(data.map(t => ({
                id: t.id,
                amount: t.amount,
                category: t.category,
                note: t.note,
                date: t.date,
                type: t.type,
                currency: t.currency,
            })));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
        Alert.alert("Invalid Amount");
        return;
    }
    if (!category) {
        Alert.alert("Select Category", "Please enter a category name");
        return;
    }

    const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        amount: val,
        category,
        note,
        date: new Date().toISOString().split('T')[0],
        type: activeTab,
        currency: 'BDT'
    };

    const optimisticList = [newTx, ...transactions];
    setTransactions(optimisticList);

    if (!isGuest) {
        const { error } = await supabase.from('transactions').insert([{
            ...newTx,
            user_id: userId
        }]);
        if (error) {
            Alert.alert("Sync Error", error.message);
            fetchTransactions(); // revert
        }
    }

    setAmount('');
    setCategory('');
    setNote('');
  };

  const handleDelete = async (id: string) => {
      const backup = [...transactions];
      setTransactions(prev => prev.filter(t => t.id !== id));

      if (!isGuest) {
          const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);
          if (error) {
              Alert.alert("Delete Failed");
              setTransactions(backup);
          }
      }
  };

  const t = TRANSLATIONS[language].dashboard;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
            <NotebookPen color="#16a34a" size={24} />
            <Text className="text-xl font-bold text-slate-800 dark:text-white">Hisab</Text>
        </View>
        <TouchableOpacity onPress={onLogout} className="p-2">
            <LogOut color={isGuest ? "#4f46e5" : "#e11d48"} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Stats */}
        <View className="flex-row flex-wrap gap-2 mb-6">
            <View className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-2">
                <Text className="text-slate-500 dark:text-slate-400 text-sm">Current Balance</Text>
                <Text className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-600'}`}>
                    ৳ {stats.balance.toLocaleString()}
                </Text>
            </View>
            <View className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl">
                <Text className="text-emerald-700 dark:text-emerald-400 text-xs">Income</Text>
                <Text className="text-emerald-700 dark:text-emerald-400 font-bold text-lg">৳ {stats.totalIncome}</Text>
            </View>
            <View className="flex-1 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl">
                <Text className="text-rose-700 dark:text-rose-400 text-xs">Expense</Text>
                <Text className="text-rose-700 dark:text-rose-400 font-bold text-lg">৳ {stats.totalExpense}</Text>
            </View>
        </View>

        {/* Add Form */}
        <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm mb-6">
            <View className="flex-row bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-4">
                {[TransactionType.INCOME, TransactionType.EXPENSE, TransactionType.SAVINGS].map((type) => (
                    <TouchableOpacity 
                        key={type}
                        onPress={() => setActiveTab(type)}
                        className={`flex-1 py-2 items-center rounded-md ${activeTab === type ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}`}
                    >
                        <Text className={`text-xs font-bold ${
                            activeTab === type 
                            ? type === TransactionType.INCOME ? 'text-emerald-600' : type === TransactionType.EXPENSE ? 'text-rose-600' : 'text-blue-600'
                            : 'text-slate-500'
                        }`}>
                            {type}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TextInput 
                value={amount}
                onChangeText={setAmount}
                placeholder="Amount (৳)"
                keyboardType="numeric"
                className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 mb-3"
            />
            <TextInput 
                value={category}
                onChangeText={setCategory}
                placeholder="Category (e.g. Food)"
                className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 mb-3"
            />
            <TouchableOpacity onPress={handleAdd} className="bg-indigo-600 py-3 rounded-xl items-center">
                <Text className="text-white font-bold">Add Transaction</Text>
            </TouchableOpacity>
        </View>

        {/* List */}
        <Text className="font-bold text-lg text-slate-800 dark:text-white mb-3">Recent Transactions</Text>
        {transactions.map((t) => (
            <View key={t.id} className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 mb-2 rounded-xl border border-slate-100 dark:border-slate-700">
                <View>
                    <Text className="font-bold text-slate-700 dark:text-slate-200">{t.category}</Text>
                    <Text className="text-xs text-slate-400">{t.date}</Text>
                </View>
                <View className="flex-row items-center gap-3">
                    <Text className={`font-bold ${
                        t.type === TransactionType.INCOME ? 'text-emerald-600' : 
                        t.type === TransactionType.EXPENSE ? 'text-rose-600' : 'text-blue-600'
                    }`}>
                        {t.type === TransactionType.EXPENSE ? '-' : '+'}৳ {t.amount}
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(t.id)} className="p-1">
                        <Trash2 size={16} color="#94a3b8" />
                    </TouchableOpacity>
                </View>
            </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};