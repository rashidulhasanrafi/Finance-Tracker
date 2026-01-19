import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { Profile, TRANSLATIONS, Language } from '../types';
import { X, UserCircle, Plus, Trash2, Pencil, Check } from 'lucide-react-native';
import { playSound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  activeProfileId: string;
  onSwitchProfile: (id: string) => void;
  onAddProfile: (name: string) => void;
  onDeleteProfile: (id: string) => void;
  onEditProfile: (id: string, newName: string) => void;
  language: Language;
  soundEnabled: boolean;
}

export const ProfileManager: React.FC<Props> = ({
  isOpen, onClose, profiles, activeProfileId, onSwitchProfile, onAddProfile, onDeleteProfile, onEditProfile, language, soundEnabled
}) => {
  const [newProfileName, setNewProfileName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const t = TRANSLATIONS[language].profile;

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newProfileName.trim()) {
      onAddProfile(newProfileName.trim());
      setNewProfileName('');
    }
  };

  const startEdit = (profile: Profile) => {
    setEditingId(profile.id);
    setEditName(profile.name);
  };

  const handleUpdate = (id: string) => {
    if (editName.trim()) {
      onEditProfile(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white dark:bg-slate-800 rounded-t-3xl max-h-[80%]">
          <View className="bg-indigo-600 p-6 rounded-t-3xl flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
                <UserCircle color="white" size={24} />
                <Text className="text-white font-bold text-xl">{t.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose}><X color="white" size={24} /></TouchableOpacity>
          </View>

          <ScrollView className="p-4">
            {profiles.map(profile => {
                const isActive = profile.id === activeProfileId;
                const isEditing = editingId === profile.id;
                
                return (
                    <View key={profile.id} className={`flex-row items-center justify-between p-4 rounded-xl border mb-3 ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}>
                        <View className="flex-row items-center gap-3 flex-1">
                            {isEditing ? (
                                <View className="flex-1 flex-row items-center gap-2">
                                    <TextInput 
                                        value={editName} 
                                        onChangeText={setEditName} 
                                        className="flex-1 border border-indigo-300 rounded p-2 bg-white dark:bg-slate-800 dark:text-white"
                                        autoFocus
                                    />
                                    <TouchableOpacity onPress={() => handleUpdate(profile.id)}><Check size={20} color="green"/></TouchableOpacity>
                                    <TouchableOpacity onPress={() => setEditingId(null)}><X size={20} color="red"/></TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <Text className={`font-bold ${isActive ? 'text-indigo-800 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-200'}`}>{profile.name}</Text>
                                    {isActive && <Text className="text-xs text-indigo-500 font-bold ml-2">Active</Text>}
                                </>
                            )}
                        </View>

                        {!isEditing && (
                            <View className="flex-row gap-3">
                                {!isActive && (
                                    <TouchableOpacity onPress={() => onSwitchProfile(profile.id)} className="bg-white dark:bg-slate-600 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-500">
                                        <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">Switch</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={() => startEdit(profile)}><Pencil size={18} color="#94a3b8"/></TouchableOpacity>
                                <TouchableOpacity onPress={() => Alert.alert('Delete?', t.confirmDelete, [{text: 'Cancel'}, {text: 'Delete', style: 'destructive', onPress: () => onDeleteProfile(profile.id)}])}>
                                    <Trash2 size={18} color="#ef4444"/>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                );
            })}
          </ScrollView>

          <View className="p-4 border-t border-slate-100 dark:border-slate-700">
              <View className="flex-row gap-2">
                  <TextInput 
                     value={newProfileName}
                     onChangeText={setNewProfileName}
                     placeholder={t.namePlaceholder}
                     className="flex-1 bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:text-white"
                  />
                  <TouchableOpacity onPress={handleAdd} className="bg-indigo-600 px-4 justify-center rounded-xl">
                      <Plus color="white" size={24} />
                  </TouchableOpacity>
              </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};