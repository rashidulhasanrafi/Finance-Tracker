import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, TransactionType, DashboardStats, CURRENCIES, Language, convertAmount, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_SAVINGS_CATEGORIES, TRANSLATIONS } from '../types';
import { DashboardStats as StatsComponent } from './DashboardStats';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { ExpenseChart } from './ExpenseChart';
import { AISuggestion } from './AISuggestion';
import { CategorySettings } from './CategorySettings';
import { ShareModal } from './ShareModal';
import { CalculatorModal } from './CalculatorModal';
import { ProfileManager } from './ProfileManager';
import { NotebookPen, Settings, UserCircle, Share2, Calculator, Check, X } from 'lucide-react-native';
import { playSound } from '../utils/sound';

interface Props {
  userId: string;
  profileName: string;
  userEmail?: string;
  onLogout: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: (file: any) => void;
}

export const Tracker: React.FC<Props> = ({ 
  userId, 
  profileName, 
  onLogout,
  language,
  onLanguageChange,
  darkMode,
  toggleDarkMode,
  soundEnabled,
  toggleSound,
  onClearAllData,
  onExportData,
  onImportData
}) => {
  // We use userId to namespace, but also support internal profiles
  const [activeProfileId, setActiveProfileId] = useState('default');
  const [profiles, setProfiles] = useState([{id: 'default', name: userId === 'guest' ? 'Guest' : 'Main'}]);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic Keys
  const STORAGE_KEY = `zenfinance_transactions_${userId}_${activeProfileId}`;
  const CURRENCY_STORAGE_KEY = `zenfinance_currency_${userId}_${activeProfileId}`;
  const INCOME_CAT_STORAGE_KEY = `zenfinance_income_categories_${userId}_${activeProfileId}`;
  const EXPENSE_CAT_STORAGE_KEY = `zenfinance_expense_categories_${userId}_${activeProfileId}`;
  const SAVINGS_CAT_STORAGE_KEY = `zenfinance_savings_categories_${userId}_${activeProfileId}`;

  const scrollViewRef = useRef<ScrollView>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalIncome: 0, totalExpense: 0, totalSavings: 0, balance: 0 });
  const [currency, setCurrency] = useState('USD');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Category State
  const [incomeCategories, setIncomeCategories] = useState<string[]>(DEFAULT_INCOME_CATEGORIES);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [savingsCategories, setSavingsCategories] = useState<string[]>(DEFAULT_SAVINGS_CATEGORIES);
  
  // Modal States
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load Profiles
        const savedProfiles = await AsyncStorage.getItem(`zenfinance_profiles_${userId}`);
        const savedActive = await AsyncStorage.getItem(`zenfinance_active_profile_${userId}`);
        
        if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
        if (savedActive) setActiveProfileId(savedActive);

        // Load Settings
        const savedCurrency = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
        if (savedCurrency) setCurrency(savedCurrency);

        const savedIncome = await AsyncStorage.getItem(INCOME_CAT_STORAGE_KEY);
        const savedExpense = await AsyncStorage.getItem(EXPENSE_CAT_STORAGE_KEY);
        const savedSavings = await AsyncStorage.getItem(SAVINGS_CAT_STORAGE_KEY);

        if (savedIncome) setIncomeCategories(JSON.parse(savedIncome));
        if (savedExpense) setExpenseCategories(JSON.parse(savedExpense));
        if (savedSavings) setSavingsCategories(JSON.parse(savedSavings));

        // Load Transactions
        const localData = await AsyncStorage.getItem(STORAGE_KEY);
        if (localData) {
            const parsed = JSON.parse(localData);
            // Ensure currency consistency
            const migrated = parsed.map((t: any) => ({
              ...t,
              currency: t.currency || savedCurrency || 'USD'
            }));
            setTransactions(migrated);
        } else {
            setTransactions([]);
        }
        
        setEditingTransaction(null);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId, activeProfileId]);

  // Save Transactions & Stats
  useEffect(() => {
    if (loading) return;

    const saveAndCalc = async () => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      
      const income = transactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency), 0);
      
      const expense = transactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency), 0);

      const totalSavings = transactions
        .filter(t => t.type === TransactionType.SAVINGS)
        .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency), 0);

      const deductedSavings = transactions
        .filter(t => t.type === TransactionType.SAVINGS && !t.excludeFromBalance)
        .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency), 0);

      setStats({
        totalIncome: income,
        totalExpense: expense,
        totalSavings: totalSavings,
        balance: income - expense - deductedSavings
      });
    };
    saveAndCalc();
  }, [transactions, currency, loading]);

  // Persist Categories
  useEffect(() => { if(!loading) AsyncStorage.setItem(INCOME_CAT_STORAGE_KEY, JSON.stringify(incomeCategories)); }, [incomeCategories]);
  useEffect(() => { if(!loading) AsyncStorage.setItem(EXPENSE_CAT_STORAGE_KEY, JSON.stringify(expenseCategories)); }, [expenseCategories]);
  useEffect(() => { if(!loading) AsyncStorage.setItem(SAVINGS_CAT_STORAGE_KEY, JSON.stringify(savingsCategories)); }, [savingsCategories]);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    AsyncStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    if (soundEnabled) playSound('click');
    setShowCurrencyModal(false);
  };

  const addTransaction = (amount: number, category: string, note: string, type: TransactionType, date: string, excludeFromBalance?: boolean) => {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount, category, note, type, date, currency,
      excludeFromBalance: type === TransactionType.SAVINGS ? excludeFromBalance : false
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, amount: number, category: string, note: string, type: TransactionType, date: string, excludeFromBalance?: boolean) => {
    setTransactions(prev => prev.map(t => 
      t.id === id 
        ? { ...t, amount, category, note, type, date, excludeFromBalance: type === TransactionType.SAVINGS ? excludeFromBalance : false } 
        : t
    ));
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (editingTransaction?.id === id) {
      setEditingTransaction(null);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    if (soundEnabled) playSound('click');
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    if (soundEnabled) playSound('click');
  };

  const handleAddCategory = (type: TransactionType, name: string) => {
    if (type === TransactionType.INCOME) setIncomeCategories(prev => [...prev, name]);
    else if (type === TransactionType.SAVINGS) setSavingsCategories(prev => [...prev, name]);
    else setExpenseCategories(prev => [...prev, name]);
  };

  const handleRemoveCategory = (type: TransactionType, name: string) => {
    if (type === TransactionType.INCOME) setIncomeCategories(prev => prev.filter(c => c !== name));
    else if (type === TransactionType.SAVINGS) setSavingsCategories(prev => prev.filter(c => c !== name));
    else setExpenseCategories(prev => prev.filter(c => c !== name));
  };

  const handleToggleSound = () => {
    toggleSound();
    if (!soundEnabled) setTimeout(() => playSound('toggle'), 50);
  };

  // Profile Handlers
  const handleAddProfile = (name: string) => {
    const newP = { id: Math.random().toString(36).substr(2, 9), name };
    const updated = [...profiles, newP];
    setProfiles(updated);
    AsyncStorage.setItem(`zenfinance_profiles_${userId}`, JSON.stringify(updated));
    setActiveProfileId(newP.id);
    AsyncStorage.setItem(`zenfinance_active_profile_${userId}`, newP.id);
  };

  const handleSwitchProfile = (id: string) => {
    setActiveProfileId(id);
    AsyncStorage.setItem(`zenfinance_active_profile_${userId}`, id);
  };

  const activeProfileName = profiles.find(p => p.id === activeProfileId)?.name || 'Main';
  const currentCurrencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
  const tSettings = TRANSLATIONS[language].settings;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      
      <CategorySettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        savingsCategories={savingsCategories}
        onAddCategory={handleAddCategory}
        onRemoveCategory={handleRemoveCategory}
        language={language}
        onLanguageChange={(l) => { onLanguageChange(l); AsyncStorage.setItem('zenfinance_language', l); }}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        soundEnabled={soundEnabled}
        toggleSound={handleToggleSound}
        onClearAllData={onClearAllData}
        onExportData={onExportData}
        onImportData={onImportData}
        onOpenShare={() => { setShowSettings(false); setShowShareModal(true); }}
        onLogout={onLogout}
        isGuest={userId === 'guest'}
      />

      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        transactions={transactions}
        stats={stats}
        profileName={activeProfileName}
        currency={currency}
        language={language}
        soundEnabled={soundEnabled}
      />

      <CalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        language={language}
        soundEnabled={soundEnabled}
      />

      <ProfileManager 
        isOpen={showProfileManager}
        onClose={() => setShowProfileManager(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitchProfile={handleSwitchProfile}
        onAddProfile={handleAddProfile}
        onDeleteProfile={() => {}} 
        onEditProfile={() => {}}
        language={language}
        soundEnabled={soundEnabled}
      />

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50 p-4">
            <View className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm max-h-[70%]">
                <View className="p-4 border-b border-slate-100 dark:border-slate-700 flex-row justify-between items-center">
                    <Text className="font-bold text-slate-800 dark:text-white">{tSettings.selectCurrency}</Text>
                    <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                        <X size={20} color="#64748b"/>
                    </TouchableOpacity>
                </View>
                <ScrollView>
                    {CURRENCIES.map(c => (
                        <TouchableOpacity 
                           key={c.code} 
                           onPress={() => handleCurrencyChange(c.code)}
                           className="p-4 border-b border-slate-100 dark:border-slate-700 flex-row justify-between items-center"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center">
                                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300">{c.symbol}</Text>
                                </View>
                                <View>
                                    <Text className={`font-medium ${currency === c.code ? 'text-amber-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {c.code}
                                    </Text>
                                    <Text className="text-xs text-slate-500 dark:text-slate-400">{c.name}</Text>
                                </View>
                            </View>
                            {currency === c.code && <Check size={16} color="#d97706" />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
      </Modal>

      {/* Header */}
      <View className="bg-white dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <View className="bg-green-600 p-1.5 rounded-lg">
            <NotebookPen color="white" size={20} />
          </View>
          <Text className="text-xl font-bold text-slate-800 dark:text-white">Hisab</Text>
        </View>
        
        <View className="flex-row gap-3">
             <TouchableOpacity 
                onPress={() => { if(soundEnabled) playSound('click'); setShowCurrencyModal(true); }} 
                className="bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-100 dark:border-amber-800"
             >
                <Text className="text-amber-700 dark:text-amber-400 font-bold">{currency}</Text>
             </TouchableOpacity>

             <TouchableOpacity 
                onPress={() => { if(soundEnabled) playSound('click'); setShowProfileManager(true); }} 
                className="bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded flex-row items-center gap-1 border border-indigo-100 dark:border-indigo-800"
             >
                <UserCircle size={16} color="#4f46e5" />
                <Text className="text-indigo-700 dark:text-indigo-300 text-xs font-medium" numberOfLines={1}>{activeProfileName}</Text>
             </TouchableOpacity>
             
             <TouchableOpacity onPress={() => { if(soundEnabled) playSound('click'); setShowCalculator(true); }}>
               <Calculator size={22} color="#f97316" />
             </TouchableOpacity>

             <TouchableOpacity onPress={() => { if(soundEnabled) playSound('click'); setShowShareModal(true); }}>
               <Share2 size={22} color="#059669" />
             </TouchableOpacity>

             <TouchableOpacity onPress={() => { if(soundEnabled) playSound('click'); setShowSettings(true); }}>
               <Settings size={22} color="#ef4444" />
             </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView ref={scrollViewRef} className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {loading ? (
            <ActivityIndicator size="large" color="#4f46e5" className="mt-10" />
        ) : (
            <>
                <StatsComponent stats={stats} currency={currency} language={language} />
                <TransactionForm 
                  onAddTransaction={addTransaction} 
                  onUpdateTransaction={updateTransaction}
                  editingTransaction={editingTransaction}
                  onCancelEdit={handleCancelEdit}
                  currencySymbol={currentCurrencySymbol} 
                  currencyCode={currency}
                  language={language}
                  incomeCategories={incomeCategories}
                  expenseCategories={expenseCategories}
                  savingsCategories={savingsCategories}
                  soundEnabled={soundEnabled}
                />
                <ExpenseChart transactions={transactions} currency={currency} language={language} darkMode={darkMode} />
                <TransactionList 
                  transactions={transactions} 
                  onDelete={deleteTransaction} 
                  onEdit={handleEditTransaction}
                  currency={currency} 
                  language={language}
                  soundEnabled={soundEnabled}
                />
                <AISuggestion transactions={transactions} stats={stats} language={language} currency={currency} />
            </>
        )}
      </ScrollView>
    </View>
  );
};