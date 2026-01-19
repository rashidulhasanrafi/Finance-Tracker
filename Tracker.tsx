

import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, DashboardStats, CURRENCIES, Language, convertAmount, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_SAVINGS_CATEGORIES, TRANSLATIONS } from '../types';
import { DashboardStats as StatsComponent } from './DashboardStats';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { ExpenseChart } from './ExpenseChart';
import { AISuggestion } from './AISuggestion';
import { CategorySettings } from './CategorySettings';
import { ShareModal } from './ShareModal';
import { CalculatorModal } from './CalculatorModal';
import { NotebookPen, Settings, UserCircle, Share2, Calculator, Check, X } from 'lucide-react';
import { playSound } from '../utils/sound';

interface Props {
  profileId: string;
  profileName: string;
  onOpenProfileManager: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  // Data Management Props
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const Tracker: React.FC<Props> = ({ 
  profileId, 
  profileName, 
  onOpenProfileManager,
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
  // Key names are now dynamic based on profileId
  const STORAGE_KEY = `zenfinance_transactions_${profileId}`;
  const CURRENCY_STORAGE_KEY = `zenfinance_currency_${profileId}`;
  const INCOME_CAT_STORAGE_KEY = `zenfinance_income_categories_${profileId}`;
  const EXPENSE_CAT_STORAGE_KEY = `zenfinance_expense_categories_${profileId}`;
  const SAVINGS_CAT_STORAGE_KEY = `zenfinance_savings_categories_${profileId}`;

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

  // Load data when profileId changes (component mounts)
  useEffect(() => {
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY) || 'USD';
    const savedTransactions = localStorage.getItem(STORAGE_KEY);
    const savedIncomeCats = localStorage.getItem(INCOME_CAT_STORAGE_KEY);
    const savedExpenseCats = localStorage.getItem(EXPENSE_CAT_STORAGE_KEY);
    const savedSavingsCats = localStorage.getItem(SAVINGS_CAT_STORAGE_KEY);

    if (savedCurrency) setCurrency(savedCurrency);

    if (savedTransactions) {
      try {
        const parsed: any[] = JSON.parse(savedTransactions);
        const migrated = parsed.map(t => ({
          ...t,
          currency: t.currency || savedCurrency
        }));
        setTransactions(migrated);
      } catch (e) {
        console.error("Failed to parse transactions", e);
        setTransactions([]);
      }
    } else {
      setTransactions([]);
    }
    
    setIncomeCategories(savedIncomeCats ? JSON.parse(savedIncomeCats) : DEFAULT_INCOME_CATEGORIES);
    setExpenseCategories(savedExpenseCats ? JSON.parse(savedExpenseCats) : DEFAULT_EXPENSE_CATEGORIES);
    setSavingsCategories(savedSavingsCats ? JSON.parse(savedSavingsCats) : DEFAULT_SAVINGS_CATEGORIES);
    setEditingTransaction(null); // Clear editing state on profile switch

  }, [profileId]); // Crucial: reload when profileId changes

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    
    // Calculate stats
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency), 0);
    
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency), 0);

    const totalSavings = transactions
      .filter(t => t.type === TransactionType.SAVINGS)
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency), 0);

    // Deducted Savings are only those that are meant to reduce the current cash balance
    const deductedSavings = transactions
      .filter(t => t.type === TransactionType.SAVINGS && !t.excludeFromBalance)
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', currency), 0);

    setStats({
      totalIncome: income,
      totalExpense: expense,
      totalSavings: totalSavings,
      balance: income - expense - deductedSavings
    });
  }, [transactions, currency, profileId]);

  // Persist Categories
  useEffect(() => {
    localStorage.setItem(INCOME_CAT_STORAGE_KEY, JSON.stringify(incomeCategories));
  }, [incomeCategories, profileId]);

  useEffect(() => {
    localStorage.setItem(EXPENSE_CAT_STORAGE_KEY, JSON.stringify(expenseCategories));
  }, [expenseCategories, profileId]);

  useEffect(() => {
    localStorage.setItem(SAVINGS_CAT_STORAGE_KEY, JSON.stringify(savingsCategories));
  }, [savingsCategories, profileId]);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    if (soundEnabled) playSound('click');
    setShowCurrencyModal(false);
  };

  const addTransaction = (amount: number, category: string, note: string, type: TransactionType, date: string, excludeFromBalance?: boolean) => {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount,
      category,
      note,
      type,
      currency: currency,
      date: date, // Use the selected date
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
    // Scroll to top on mobile to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    if (soundEnabled) playSound('click');
  };

  const handleAddCategory = (type: TransactionType, name: string) => {
    if (type === TransactionType.INCOME) {
      setIncomeCategories(prev => [...prev, name]);
    } else if (type === TransactionType.SAVINGS) {
      setSavingsCategories(prev => [...prev, name]);
    } else {
      setExpenseCategories(prev => [...prev, name]);
    }
  };

  const handleRemoveCategory = (type: TransactionType, name: string) => {
    if (type === TransactionType.INCOME) {
      setIncomeCategories(prev => prev.filter(c => c !== name));
    } else if (type === TransactionType.SAVINGS) {
      setSavingsCategories(prev => prev.filter(c => c !== name));
    } else {
      setExpenseCategories(prev => prev.filter(c => c !== name));
    }
  };

  const handleToggleSound = () => {
    toggleSound();
    if (!soundEnabled) {
        setTimeout(() => playSound('toggle'), 50);
    }
  };

  const handleClickSound = () => {
    if (soundEnabled) playSound('click');
  };

  const currentCurrencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
  const tSettings = TRANSLATIONS[language].settings;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col">
      <CategorySettings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        savingsCategories={savingsCategories}
        onAddCategory={handleAddCategory}
        onRemoveCategory={handleRemoveCategory}
        language={language}
        onLanguageChange={(lang) => { handleClickSound(); onLanguageChange(lang); }}
        darkMode={darkMode}
        toggleDarkMode={() => { handleClickSound(); toggleDarkMode(); }}
        soundEnabled={soundEnabled}
        toggleSound={handleToggleSound}
        onClearAllData={onClearAllData}
        onExportData={onExportData}
        onImportData={onImportData}
        onOpenShare={() => { setShowSettings(false); setShowShareModal(true); }}
      />

      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        transactions={transactions}
        stats={stats}
        profileName={profileName}
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

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCurrencyModal(false)} />
           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm relative z-10 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
               <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                   <h3 className="font-bold text-slate-800 dark:text-white">{tSettings.selectCurrency}</h3>
                   <button onClick={() => setShowCurrencyModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                      <X size={20} className="text-slate-500" />
                   </button>
               </div>
               <div className="p-2 overflow-y-auto max-h-[60vh]">
                   {CURRENCIES.map(c => (
                       <button
                         key={c.code}
                         onClick={() => handleCurrencyChange(c.code)}
                         className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                             currency === c.code 
                             ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold' 
                             : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'
                         }`}
                       >
                           <div className="flex items-center gap-3">
                               <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm">
                                   {c.symbol}
                               </span>
                               <div className="text-left">
                                   <div className="text-sm">{c.code}</div>
                                   <div className="text-xs opacity-70 font-normal">{c.name}</div>
                               </div>
                           </div>
                           {currency === c.code && <Check size={18} />}
                       </button>
                   ))}
               </div>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg shadow-sm">
              <NotebookPen className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 hidden sm:block">
              Hisab
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             {/* Currency Button (Compact) */}
             <button
               onClick={() => { handleClickSound(); setShowCurrencyModal(true); }}
               className="bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1"
             >
                {currency}
             </button>

             {/* Profile Switcher Button */}
             <button 
               onClick={() => { handleClickSound(); onOpenProfileManager(); }}
               className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
             >
               <UserCircle size={18} />
               <span className="text-sm font-medium hidden sm:block">{profileName}</span>
             </button>
             
             {/* Calculator Button */}
             <button
               onClick={() => { handleClickSound(); setShowCalculator(true); }}
               className="p-2 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
               title="Calculator"
             >
               <Calculator size={20} />
             </button>

             {/* Share Button */}
             <button
               onClick={() => { handleClickSound(); setShowShareModal(true); }}
               className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
               title="Share & Export"
             >
               <Share2 size={20} />
             </button>

             {/* Settings Button - RED COLOR */}
             <button
               onClick={() => { handleClickSound(); setShowSettings(true); }}
               className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
               title="Settings"
             >
               <Settings size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        
        {/* Top Stats Cards */}
        <StatsComponent stats={stats} currency={currency} language={language} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
             <TransactionForm 
                onAddTransaction={addTransaction} 
                onUpdateTransaction={updateTransaction}
                editingTransaction={editingTransaction}
                onCancelEdit={handleCancelEdit}
                currencySymbol={currentCurrencySymbol} 
                language={language}
                incomeCategories={incomeCategories}
                expenseCategories={expenseCategories}
                savingsCategories={savingsCategories}
                soundEnabled={soundEnabled}
             />
             <AISuggestion transactions={transactions} stats={stats} language={language} currency={currency} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <ExpenseChart transactions={transactions} currency={currency} language={language} darkMode={darkMode} />
            <TransactionList 
              transactions={transactions} 
              onDelete={deleteTransaction} 
              onEdit={handleEditTransaction}
              currency={currency} 
              language={language}
              soundEnabled={soundEnabled}
            />
          </div>

        </div>
      </main>

      {/* Footer removed, content moved to Settings */}
    </div>
  );
};