import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, Switch } from 'react-native';
import { Goal, TRANSLATIONS, Language } from '../types';
import { X, Target, Plus, Trophy, Wallet, Lock, ArrowDownLeft } from 'lucide-react-native';

// Simple types for props since full logic is extensive, stubbing visuals
interface Props {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  language: Language;
}

export const GoalModal: React.FC<Props> = ({ isOpen, onClose, goals, language }) => {
  const t = TRANSLATIONS[language].goals;
  
  if(!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide">
        <View className="flex-1 bg-slate-50 dark:bg-slate-900 pt-10">
            <View className="flex-row justify-between items-center p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <Text className="text-xl font-bold text-slate-800 dark:text-white">{t.title}</Text>
                <TouchableOpacity onPress={onClose}><X size={24} color="#64748b"/></TouchableOpacity>
            </View>
            <ScrollView className="p-4">
                <View className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl items-center justify-center mb-4">
                    <Wallet size={32} color="#4f46e5" />
                    <Text className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mt-2">Funds & Goals</Text>
                    <Text className="text-sm text-indigo-500 text-center mt-1">Manage your savings and target funds here.</Text>
                </View>
                {/* Simplified List for Mobile View */}
                {goals.length === 0 ? (
                    <Text className="text-center text-slate-500 mt-10">No goals found. Add one to start saving!</Text>
                ) : (
                    goals.map(g => (
                        <View key={g.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-3 shadow-sm">
                            <Text className="font-bold text-slate-800 dark:text-white">{g.name}</Text>
                            <Text className="text-slate-500 text-sm">Target: {g.targetAmount}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
            <View className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                <TouchableOpacity className="bg-indigo-600 py-3 rounded-xl items-center flex-row justify-center gap-2">
                    <Plus color="white" size={20} />
                    <Text className="text-white font-bold">Add New Goal</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
  );
};