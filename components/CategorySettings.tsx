import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Switch } from 'react-native';
import { TransactionType, TRANSLATIONS, Language, getLocalizedCategory } from '../types';
import { X, Plus, Settings, Trash2, AlertTriangle, Moon, Sun, Volume2, VolumeX, Globe, LayoutGrid, Database, Download, Upload, Share2, LogOut, User } from 'lucide-react-native';
import { playSound } from '../utils/sound';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  incomeCategories: string[];
  expenseCategories: string[];
  savingsCategories: string[];
  onAddCategory: (type: TransactionType, name: string) => void;
  onRemoveCategory: (type: TransactionType, name: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: (file: any) => void;
  onOpenShare: () => void;
  onLogout: () => void;
  isGuest?: boolean;
  userEmail?: string;
}

export const CategorySettings: React.FC<Props> = ({
  isOpen, onClose, incomeCategories, expenseCategories, savingsCategories,
  onAddCategory, onRemoveCategory, language, onLanguageChange,
  darkMode, toggleDarkMode, soundEnabled, toggleSound,
  onClearAllData, onExportData, onImportData, onOpenShare, onLogout, isGuest, userEmail
}) => {
  const [categoryTab, setCategoryTab] = useState<TransactionType>(TransactionType.EXPENSE);
  const [newCategory, setNewCategory] = useState('');
  
  const t = TRANSLATIONS[language].settings;

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newCategory.trim()) return;
    let list = categoryTab === TransactionType.INCOME ? incomeCategories : categoryTab === TransactionType.SAVINGS ? savingsCategories : expenseCategories;
    if (list.includes(newCategory.trim())) {
      Alert.alert(t.exists);
      return;
    }
    onAddCategory(categoryTab, newCategory.trim());
    setNewCategory('');
  };

  const handleRestore = async () => {
    try {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
        if (result.canceled) return;
        
        // In Expo, reading file content:
        // const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
        // onImportData(JSON.parse(content)); 
        Alert.alert("Coming Soon", "Restore functionality will be enabled in next update.");
    } catch (e) {
        Alert.alert("Error", "Failed to pick file");
    }
  };

  const currentCategories = categoryTab === TransactionType.INCOME ? incomeCategories : categoryTab === TransactionType.SAVINGS ? savingsCategories : expenseCategories;

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-center p-4">
        <View className="bg-white dark:bg-slate-800 rounded-2xl max-h-[85%] overflow-hidden">
          <View className="p-4 border-b border-slate-100 dark:border-slate-700 flex-row justify-between items-center">
             <Text className="font-bold text-lg text-slate-800 dark:text-white">{t.title}</Text>
             <TouchableOpacity onPress={onClose}><X size={24} color="#94a3b8"/></TouchableOpacity>
          </View>
          
          <ScrollView className="p-4">
             {/* General Settings */}
             <View className="mb-6">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-3">{t.appearance}</Text>
                
                <View className="flex-row justify-between items-center mb-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                   <View className="flex-row items-center gap-3">
                      {darkMode ? <Moon size={20} color="#6366f1"/> : <Sun size={20} color="#f59e0b"/>}
                      <Text className="text-slate-700 dark:text-slate-200 font-medium">{t.darkMode}</Text>
                   </View>
                   <Switch value={darkMode} onValueChange={toggleDarkMode} />
                </View>

                <View className="flex-row justify-between items-center mb-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                   <View className="flex-row items-center gap-3">
                      {soundEnabled ? <Volume2 size={20} color="#10b981"/> : <VolumeX size={20} color="#94a3b8"/>}
                      <Text className="text-slate-700 dark:text-slate-200 font-medium">{t.sound}</Text>
                   </View>
                   <Switch value={soundEnabled} onValueChange={toggleSound} />
                </View>

                 <View className="flex-row justify-between items-center mb-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                   <View className="flex-row items-center gap-3">
                      <Globe size={20} color="#3b82f6"/>
                      <Text className="text-slate-700 dark:text-slate-200 font-medium">{t.language}</Text>
                   </View>
                   <View className="flex-row gap-2">
                      <TouchableOpacity onPress={() => onLanguageChange('en')} className={`px-2 py-1 rounded ${language==='en' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                          <Text className={`${language==='en' ? 'text-white' : 'text-slate-600 dark:text-slate-300'} text-xs font-bold`}>EN</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => onLanguageChange('bn')} className={`px-2 py-1 rounded ${language==='bn' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
                          <Text className={`${language==='bn' ? 'text-white' : 'text-slate-600 dark:text-slate-300'} text-xs font-bold`}>BN</Text>
                      </TouchableOpacity>
                   </View>
                </View>
             </View>

             {/* Categories */}
             <View className="mb-6">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-3">{t.categoriesTab}</Text>
                
                <View className="flex-row bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-4">
                  {[TransactionType.INCOME, TransactionType.EXPENSE, TransactionType.SAVINGS].map(type => (
                      <TouchableOpacity 
                         key={type} 
                         onPress={() => setCategoryTab(type)}
                         className={`flex-1 py-2 items-center rounded-lg ${categoryTab === type ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}`}
                      >
                          <Text className={`text-xs font-bold ${categoryTab === type ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>{type}</Text>
                      </TouchableOpacity>
                  ))}
                </View>

                <View className="flex-row gap-2 mb-4">
                    <TextInput 
                        value={newCategory}
                        onChangeText={setNewCategory}
                        placeholder={t.placeholder}
                        className="flex-1 bg-slate-50 dark:bg-slate-700 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:text-white"
                    />
                    <TouchableOpacity onPress={handleAdd} className="bg-indigo-600 px-4 justify-center rounded-lg">
                        <Plus color="white" size={20} />
                    </TouchableOpacity>
                </View>

                <View className="max-h-40">
                   <ScrollView nestedScrollEnabled>
                       {currentCategories.map(cat => (
                           <View key={cat} className="flex-row justify-between items-center p-3 border-b border-slate-100 dark:border-slate-700">
                               <Text className="text-slate-700 dark:text-slate-200">{getLocalizedCategory(cat, language)}</Text>
                               <TouchableOpacity onPress={() => onRemoveCategory(categoryTab, cat)}>
                                   <Trash2 size={16} color="#ef4444"/>
                               </TouchableOpacity>
                           </View>
                       ))}
                   </ScrollView>
                </View>
             </View>

             {/* Data */}
             <View className="mb-6">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-3">{t.dataManagement}</Text>
                <TouchableOpacity onPress={handleRestore} className="flex-row items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl mb-2">
                    <Upload size={20} color="#8b5cf6" />
                    <Text className="text-slate-700 dark:text-slate-200 font-medium">{t.restoreData}</Text>
                </TouchableOpacity>
                 <TouchableOpacity onPress={() => Alert.alert(t.confirmClearTitle, t.confirmClearDesc, [{ text: 'Cancel' }, { text: 'Clear', onPress: onClearAllData, style: 'destructive'}])} className="flex-row items-center gap-3 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                    <Trash2 size={20} color="#e11d48" />
                    <Text className="text-rose-600 dark:text-rose-400 font-medium">{t.clearData}</Text>
                </TouchableOpacity>
             </View>

             {/* Logout */}
             <TouchableOpacity onPress={onLogout} className="flex-row justify-center items-center gap-2 bg-slate-100 dark:bg-slate-700 p-4 rounded-xl mt-4">
                 <LogOut size={20} color="#64748b" />
                 <Text className="text-slate-600 dark:text-slate-300 font-bold">{isGuest ? 'Login' : t.logout}</Text>
             </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};