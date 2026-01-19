import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Transaction, TransactionType, TRANSLATIONS, Language, getLocalizedCategory, convertAmount } from '../types';
import { PlusCircle, Save, XCircle, Clipboard, CheckCircle2, Circle } from 'lucide-react-native';
import { safeCopy } from '../utils/clipboard';

interface Props {
  onAddTransaction: (amount: number, category: string, note: string, type: TransactionType, date: string, excludeFromBalance?: boolean) => void;
  onUpdateTransaction: (id: string, amount: number, category: string, note: string, type: TransactionType, date: string, excludeFromBalance?: boolean) => void;
  editingTransaction: Transaction | null;
  onCancelEdit: () => void;
  currencySymbol: string;
  currencyCode: string;
  language: Language;
  incomeCategories: string[];
  expenseCategories: string[];
  savingsCategories: string[];
  soundEnabled: boolean;
}

export const TransactionForm: React.FC<Props> = ({ 
  onAddTransaction,
  onUpdateTransaction,
  editingTransaction,
  onCancelEdit,
  currencySymbol, 
  currencyCode,
  language,
  incomeCategories,
  expenseCategories,
  savingsCategories
}) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [deductFromBalance, setDeductFromBalance] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  const t = TRANSLATIONS[language].form;

  const getCategories = (currentType: TransactionType) => {
    switch(currentType) {
      case TransactionType.INCOME: return incomeCategories;
      case TransactionType.SAVINGS: return savingsCategories;
      default: return expenseCategories;
    }
  };

  useEffect(() => {
    if (editingTransaction) {
      let amt = editingTransaction.amount;
      if (editingTransaction.currency && editingTransaction.currency !== currencyCode) {
          amt = convertAmount(editingTransaction.amount, editingTransaction.currency, currencyCode);
      }
      setAmount(amt.toString());
      setCategory(editingTransaction.category);
      setNote(editingTransaction.note);
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setDeductFromBalance(!editingTransaction.excludeFromBalance);
    } else {
      setAmount('');
      setNote('');
      setDeductFromBalance(true);
      const categories = getCategories(type);
      if (categories.length > 0) setCategory(categories[0]);
    }
  }, [editingTransaction]);

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", t.alertAmount);
      return;
    }
    
    const excludeFromBalance = type === TransactionType.SAVINGS ? !deductFromBalance : false;

    if (editingTransaction) {
      onUpdateTransaction(editingTransaction.id, parsedAmount, category, note, type, date, excludeFromBalance);
    } else {
      onAddTransaction(parsedAmount, category, note, type, date, excludeFromBalance);
    }
    
    if (!editingTransaction) {
      setAmount('');
      setNote('');
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const newCategories = getCategories(newType);
    if (newCategories.length > 0) setCategory(newCategories[0]);
  };

  const getButtonColor = () => {
    switch (type) {
        case TransactionType.INCOME: return 'bg-emerald-600';
        case TransactionType.SAVINGS: return 'bg-blue-600';
        default: return 'bg-rose-600';
    }
  };

  return (
    <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm mb-6 border border-slate-100 dark:border-slate-700">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-slate-800 dark:text-white">
          {editingTransaction ? t.editTitle : t.title}
        </Text>
        {editingTransaction && (
          <TouchableOpacity onPress={onCancelEdit}>
            <XCircle size={24} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Type Switcher */}
      <View className="flex-row bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-4">
        {[TransactionType.INCOME, TransactionType.EXPENSE, TransactionType.SAVINGS].map((tType) => (
          <TouchableOpacity
            key={tType}
            onPress={() => handleTypeChange(tType)}
            className={`flex-1 py-2 items-center rounded-lg ${type === tType ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-bold ${
                type === tType 
                ? tType === TransactionType.INCOME ? 'text-emerald-600' : tType === TransactionType.EXPENSE ? 'text-rose-600' : 'text-blue-600'
                : 'text-slate-500'
            }`}>
              {tType}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {type === TransactionType.SAVINGS && (
        <TouchableOpacity 
          className="flex-row items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800 mb-4"
          onPress={() => setDeductFromBalance(!deductFromBalance)}
        >
           {deductFromBalance ? <CheckCircle2 size={20} color="#2563eb" /> : <Circle size={20} color="#94a3b8" />}
           <View className="flex-1">
              <Text className="text-sm font-bold text-slate-800 dark:text-white">{t.deductFromBalance}</Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">{deductFromBalance ? t.deductDesc : t.noDeductDesc}</Text>
           </View>
        </TouchableOpacity>
      )}

      {/* Amount */}
      <View className="mb-4">
        <Text className="text-xs font-medium text-slate-500 mb-1">{t.amount} ({currencySymbol})</Text>
        <TextInput 
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="numeric"
          className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white text-lg"
        />
      </View>

      {/* Category Selection */}
      <View className="mb-4">
        <Text className="text-xs font-medium text-slate-500 mb-1">{t.category}</Text>
        <TouchableOpacity 
          onPress={() => setShowCategoryModal(true)}
          className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600"
        >
          <Text className="text-slate-800 dark:text-white">
            {getLocalizedCategory(category, language) || "Select Category"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Note */}
      <View className="mb-6">
        <Text className="text-xs font-medium text-slate-500 mb-1">{t.note}</Text>
        <TextInput 
          value={note}
          onChangeText={setNote}
          placeholder={t.placeholderNote}
          className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
        />
      </View>

      {/* Submit */}
      <TouchableOpacity 
        onPress={handleSubmit}
        className={`w-full py-3 rounded-xl flex-row items-center justify-center gap-2 ${getButtonColor()}`}
      >
        {editingTransaction ? <Save size={20} color="white" /> : <PlusCircle size={20} color="white" />}
        <Text className="text-white font-bold text-base">
          {editingTransaction ? t.updateBtn : t.addBtn}
        </Text>
      </TouchableOpacity>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-6 max-h-[70%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-800 dark:text-white">{t.category}</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <XCircle size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {getCategories(type).map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  onPress={() => { setCategory(cat); setShowCategoryModal(false); }}
                  className="p-4 border-b border-slate-100 dark:border-slate-700"
                >
                  <Text className={`text-base ${category === cat ? 'font-bold text-indigo-600' : 'text-slate-700 dark:text-slate-200'}`}>
                    {getLocalizedCategory(cat, language)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};