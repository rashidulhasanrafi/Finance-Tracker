import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { Goal, TRANSLATIONS, Language } from '../types';
import { X, Target, Plus, Trash2, Coins, Trophy, Pencil } from 'lucide-react-native';
import { playSound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // Goals Props
  goals: Goal[];
  onAddGoal: (name: string, targetAmount: number) => void;
  onUpdateGoal: (id: string, name: string, targetAmount: number) => void;
  onDeleteGoal: (id: string) => void;
  onAddFundsToGoal: (goalId: string, amount: number, source: 'balance') => void;
  // Shared Props
  language: Language;
  currency: string;
  soundEnabled: boolean;
}

export const FundsDashboard: React.FC<Props> = ({
  isOpen,
  onClose,
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddFundsToGoal,
  language,
  currency,
  soundEnabled
}) => {
  const [goalView, setGoalView] = useState<'list' | 'create' | 'edit' | 'deposit'>('list');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const t = TRANSLATIONS[language].funds;
  const tCommon = TRANSLATIONS[language].common;

  if (!isOpen) return null;

  const playClick = () => {
    if (soundEnabled) playSound('click');
  };

  const handleCreateGoal = () => {
    const target = parseFloat(newGoalTarget.replace(/,/g, ''));
    if (newGoalName && target > 0) {
      onAddGoal(newGoalName, target);
      setNewGoalName('');
      setNewGoalTarget('');
      setGoalView('list');
      if (soundEnabled) playSound('income');
    }
  };

  const handleUpdateGoal = () => {
    const target = parseFloat(newGoalTarget.replace(/,/g, ''));
    if (selectedGoalId && newGoalName && target > 0) {
      onUpdateGoal(selectedGoalId, newGoalName, target);
      setNewGoalName('');
      setNewGoalTarget('');
      setSelectedGoalId(null);
      setGoalView('list');
      if (soundEnabled) playSound('click');
    }
  };

  const handleDepositGoal = () => {
    const amount = parseFloat(depositAmount.replace(/,/g, ''));
    if (selectedGoalId && amount > 0) {
      onAddFundsToGoal(selectedGoalId, amount, 'balance');
      setDepositAmount('');
      setSelectedGoalId(null);
      setGoalView('list');
      if (soundEnabled) playSound('income');
    }
  };

  const openEditGoal = (goal: Goal) => {
    playClick();
    setSelectedGoalId(goal.id);
    setNewGoalName(goal.name);
    setNewGoalTarget(goal.targetAmount.toString());
    setGoalView('edit');
  };

  const openDepositGoal = (goalId: string) => {
    playClick();
    setSelectedGoalId(goalId);
    setGoalView('deposit');
  };

  const deleteGoal = (id: string) => {
    Alert.alert("Confirm", t.deleteGoalConfirm, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => {
            onDeleteGoal(id);
            if(soundEnabled) playSound('delete');
        }, style: "destructive"}
    ]);
  };

  const getPercentage = (saved: number, target: number) => {
    return Math.min(100, Math.round((saved / target) * 100));
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white dark:bg-slate-800 rounded-t-3xl h-[90%]">
          
          {/* Header */}
          <View className="p-5 border-b border-slate-100 dark:border-slate-700 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <Target size={22} color="#2563eb" />
              </View>
              <Text className="text-xl font-bold text-slate-800 dark:text-white">{t.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-6">
            
            {goalView === 'list' && (
              <View className="space-y-4">
                {goals.length === 0 ? (
                  <View className="items-center py-12">
                    <View className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full items-center justify-center mb-3">
                      <Target size={32} color="#94a3b8" />
                    </View>
                    <Text className="text-slate-500 dark:text-slate-400">{t.emptyGoals}</Text>
                  </View>
                ) : (
                  goals.map(goal => {
                    const percent = getPercentage(goal.savedAmount, goal.targetAmount);
                    const isCompleted = percent >= 100;
                    
                    return (
                      <View key={goal.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4 shadow-sm">
                        
                        <View className="flex-row justify-between items-start mb-2">
                          <View>
                            <Text className="font-bold text-slate-800 dark:text-white text-lg">{goal.name}</Text>
                            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                               {t.saved}: <Text className="text-emerald-600 dark:text-emerald-400">{goal.savedAmount}</Text> 
                               / 
                               {t.target}: {goal.targetAmount}
                            </Text>
                          </View>
                          
                          <View className="flex-row gap-1">
                              <TouchableOpacity onPress={() => openEditGoal(goal)} className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                  <Pencil size={16} color="#94a3b8" />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => deleteGoal(goal.id)} className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                  <Trash2 size={16} color="#ef4444" />
                              </TouchableOpacity>
                          </View>
                        </View>

                        <View className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                          <View 
                            className={`h-full rounded-full ${isCompleted ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </View>
                        
                        <View className="flex-row justify-between items-center">
                          <Text className={`text-xs font-bold ${isCompleted ? 'text-yellow-600 dark:text-yellow-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                            {isCompleted ? 'Completed!' : `${percent}%`}
                          </Text>
                          
                          <TouchableOpacity
                            onPress={() => openDepositGoal(goal.id)}
                            className="flex-row items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"
                          >
                            <Plus size={14} color="#4f46e5" />
                            <Text className="text-indigo-700 dark:text-indigo-300 text-xs font-bold">{t.addMoney}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}

                <TouchableOpacity
                  onPress={() => { playClick(); setGoalView('create'); }}
                  className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl items-center justify-center flex-row gap-2 mt-4"
                >
                  <Plus size={20} color="#64748b" />
                  <Text className="text-slate-500 dark:text-slate-400 font-medium">{t.addGoal}</Text>
                </TouchableOpacity>
              </View>
            )}

            {(goalView === 'create' || goalView === 'edit') && (
              <View>
                <Text className="font-bold text-slate-800 dark:text-white text-lg text-center mb-4">
                    {goalView === 'create' ? t.addGoal : t.editGoal}
                </Text>
                
                <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.goalName}</Text>
                <TextInput 
                  value={newGoalName}
                  onChangeText={setNewGoalName}
                  placeholder="e.g. New Laptop"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl mb-4 text-slate-800 dark:text-white"
                />

                <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.target} ({currency})</Text>
                <TextInput 
                  value={newGoalTarget}
                  onChangeText={setNewGoalTarget}
                  keyboardType="numeric"
                  placeholder="0.00"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl mb-6 text-slate-800 dark:text-white"
                />

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => { playClick(); setGoalView('list'); setSelectedGoalId(null); setNewGoalName(''); setNewGoalTarget(''); }}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl items-center"
                  >
                    <Text className="text-slate-600 dark:text-slate-300 font-medium">{tCommon.cancel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={goalView === 'create' ? handleCreateGoal : handleUpdateGoal}
                    className="flex-1 py-3 bg-indigo-600 rounded-xl items-center"
                  >
                    <Text className="text-white font-medium">{goalView === 'create' ? t.create : t.update}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {goalView === 'deposit' && (
               <View>
                 <View className="items-center mb-4">
                   <View className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mb-2">
                     <Coins size={24} color="#059669" />
                   </View>
                   <Text className="font-bold text-slate-800 dark:text-white text-lg">{t.deposit}</Text>
                   <Text className="text-sm text-slate-500 dark:text-slate-400">
                     {goals.find(g => g.id === selectedGoalId)?.name}
                   </Text>
                 </View>

                <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.addMoney} ({currency})</Text>
                <TextInput 
                  value={depositAmount}
                  onChangeText={setDepositAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl mb-6 text-lg font-bold text-center text-slate-800 dark:text-white"
                  autoFocus
                />

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => { playClick(); setGoalView('list'); setSelectedGoalId(null); }}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl items-center"
                  >
                    <Text className="text-slate-600 dark:text-slate-300 font-medium">{tCommon.cancel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDepositGoal}
                    className="flex-1 py-3 bg-emerald-600 rounded-xl items-center"
                  >
                    <Text className="text-white font-medium">{t.deposit}</Text>
                  </TouchableOpacity>
                </View>
               </View>
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};