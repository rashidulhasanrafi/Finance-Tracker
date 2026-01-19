import React, { useState, useRef, useEffect } from 'react';
import { TransactionType, TRANSLATIONS, Language, getLocalizedCategory } from '../types';
import { X, Plus, Settings, Trash2, AlertTriangle, Moon, Sun, Volume2, VolumeX, Globe, LayoutGrid, Sliders, MessageCircle, ArrowLeft, Download, Upload, Database, Clipboard, Share2, LogOut, LogIn, User } from 'lucide-react';
import { playSound } from '../utils/sound';
import { safeCopy } from '../utils/clipboard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'general' | 'categories';
  // Category Props
  incomeCategories: string[];
  expenseCategories: string[];
  savingsCategories: string[];
  onAddCategory: (type: TransactionType, name: string) => void;
  onRemoveCategory: (type: TransactionType, name: string) => void;
  // General Props
  language: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  // Data Management
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onOpenShare: () => void;
  // Auth
  onLogout: () => void;
  isGuest?: boolean;
  userEmail?: string;
}

export const CategorySettings: React.FC<Props> = ({
  isOpen,
  onClose,
  initialTab = 'general',
  incomeCategories,
  expenseCategories,
  savingsCategories,
  onAddCategory,
  onRemoveCategory,
  language,
  onLanguageChange,
  darkMode,
  toggleDarkMode,
  soundEnabled,
  toggleSound,
  onClearAllData,
  onExportData,
  onImportData,
  onOpenShare,
  onLogout,
  isGuest,
  userEmail
}) => {
  // If we are in 'categories' mode, we need sub-tabs for Inc/Exp/Sav.
  const [categoryTab, setCategoryTab] = useState<TransactionType>(TransactionType.EXPENSE);
  const [newCategory, setNewCategory] = useState('');
  const [deleteInfo, setDeleteInfo] = useState<{ type: TransactionType, name: string } | null>(null);
  
  // Data Confirmation States
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language].settings;
  const tCommon = TRANSLATIONS[language].common;

  // Sound Helper
  const playClick = () => {
    if (soundEnabled) playSound('click');
  };

  const playDeleteSound = () => {
    if (soundEnabled) playSound('delete');
  };

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    let list: string[] = [];
    if (categoryTab === TransactionType.EXPENSE) list = expenseCategories;
    else if (categoryTab === TransactionType.INCOME) list = incomeCategories;
    else list = savingsCategories;

    if (list.includes(newCategory.trim())) {
      alert(t.exists);
      return;
    }

    onAddCategory(categoryTab, newCategory.trim());
    setNewCategory('');
    if (soundEnabled) playSound('income'); // Success sound
  };

  const handlePasteCategory = async () => {
    if (soundEnabled) playSound('click');
    
    if (!navigator.clipboard) {
        alert(language === 'bn' ? 'ক্লিপবোর্ড অ্যাক্সেস সম্ভব নয়।' : 'Clipboard API not supported.');
        categoryInputRef.current?.focus();
        return;
    }

    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            setNewCategory(text);
        } else {
            categoryInputRef.current?.focus();
        }
    } catch (err) {
        console.error("Paste failed", err);
        alert(language === 'bn' 
            ? 'ক্লিপবোর্ড অ্যাক্সেস প্রত্যাখ্যান করা হয়েছে। দয়া করে ম্যানুয়ালি পেস্ট করুন।' 
            : 'Clipboard access denied. Please paste manually.'
        );
        categoryInputRef.current?.focus();
    }
  };

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    playClick();
    // Copy to clipboard immediately as backup (if app not installed)
    await safeCopy("01570222989");
  };

  const confirmDeleteCategory = () => {
    if (deleteInfo) {
      onRemoveCategory(deleteInfo.type, deleteInfo.name);
      setDeleteInfo(null);
      playDeleteSound();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setPendingImportFile(e.target.files[0]);
        setConfirmRestoreOpen(true);
        e.target.value = ''; // Reset so same file can be selected again
        playClick();
    }
  };

  const executeRestore = () => {
      if (pendingImportFile) {
          onImportData(pendingImportFile);
          setConfirmRestoreOpen(false);
          setPendingImportFile(null);
          // Sound handled by app reload usually, but we can try
          if (soundEnabled) playSound('income');
      }
  };

  const executeClearAll = () => {
      playDeleteSound();
      onClearAllData();
      setConfirmClearOpen(false);
  };

  const handleLogoutClick = () => {
      playClick();
      if (isGuest) {
          onLogout(); // Directly logout/login redirect for guest
      } else {
          setShowLogoutConfirm(true);
      }
  };

  const confirmLogout = () => {
      onLogout();
  };

  const getCurrentCategories = () => {
    if (categoryTab === TransactionType.INCOME) return incomeCategories;
    if (categoryTab === TransactionType.SAVINGS) return savingsCategories;
    return expenseCategories;
  };

  const isGeneralMode = initialTab === 'general';
  
  // Title based on mode
  const modalTitle = isGeneralMode ? t.title : (language === 'bn' ? 'বিভাগ পরিচালনা' : 'Manage Categories');
  const HeaderIcon = isGeneralMode ? Settings : LayoutGrid;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { playClick(); onClose(); }} />
        
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md relative z-10 flex flex-col max-h-[85vh] transition-colors animate-in zoom-in-95 duration-200 border border-white/20 dark:border-white/10">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <HeaderIcon size={20} className={isGeneralMode ? "text-red-500" : "text-violet-600 dark:text-violet-400"} />
              {modalTitle}
            </h3>
            <button onClick={() => { playClick(); onClose(); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isGeneralMode ? (
              <div className="p-4 space-y-6">
                
                {/* Share & Export Link */}
                <div 
                  onClick={() => { playClick(); onOpenShare(); }}
                  className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-100 dark:border-indigo-800"
                >
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-lg">
                         <Share2 size={18} />
                      </div>
                      <span className="font-medium text-indigo-900 dark:text-indigo-100">{t.shareExport}</span>
                   </div>
                   <ArrowLeft size={16} className="rotate-180 text-indigo-400" />
                </div>

                {/* Appearance */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.appearance}</h4>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{t.darkMode}</span>
                    </div>
                    <button 
                      onClick={() => { playClick(); toggleDarkMode(); }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Sound */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.sound}</h4>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{t.sound}</span>
                    </div>
                    <button 
                      onClick={() => { toggleSound(); /* sound handled in wrapper */ }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${soundEnabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Localization */}
                <div>
                   <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.language}</h4>
                   
                   <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Globe size={18} />
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-200">{t.language}</span>
                        </div>
                        <select 
                          value={language}
                          onChange={(e) => { playClick(); onLanguageChange(e.target.value as Language); }}
                          className="bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="en">English</option>
                          <option value="bn">বাংলা</option>
                        </select>
                      </div>
                   </div>
                </div>

                {/* Data Management Section */}
                <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.dataManagement}</h4>
                    <div className="space-y-3">
                        {/* Backup & Restore Group */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg mt-1">
                                    <Database size={18} />
                                </div>
                                <div>
                                    <h5 className="font-medium text-slate-700 dark:text-slate-200 text-sm">{t.backupTitle}</h5>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.backupDesc}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 mt-2">
                                <button 
                                    onClick={() => { playClick(); onExportData(); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-500 transition-colors"
                                >
                                    <Download size={14} />
                                    {t.backupEmail}
                                </button>
                                <button 
                                    onClick={() => { playClick(); fileInputRef.current?.click(); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-500 transition-colors"
                                >
                                    <Upload size={14} />
                                    {t.restoreData}
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept=".json"
                                    className="hidden" 
                                />
                            </div>
                        </div>

                        {/* Clear Data */}
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
                                        <Trash2 size={18} />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{t.clearData}</span>
                                </div>
                                <button 
                                    onClick={() => { playClick(); setConfirmClearOpen(true); }}
                                    className="px-3 py-1.5 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                >
                                    {tCommon.confirm}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Developer Info & Logout Section */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-4">
                    
                    {/* User Email Display (Only if logged in) */}
                    {!isGuest && userEmail && (
                        <div className="w-full flex items-center justify-center gap-2 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                            <div className="p-1.5 bg-white dark:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300">
                                <User size={14} />
                            </div>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                                {userEmail}
                            </span>
                        </div>
                    )}

                    {/* Logout/Login Button */}
                    <button
                        onClick={handleLogoutClick}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors font-semibold shadow-sm ${
                            isGuest 
                            ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/40'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
                        }`}
                    >
                        {isGuest ? <LogIn size={18} /> : <LogOut size={18} />}
                        {isGuest ? 'Login to Sync Data' : t.logout}
                    </button>

                    <div className="flex flex-col gap-2 mt-2">
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                          Developed by Rafi Hassan
                        </p>
                        <a 
                          href="https://wa.me/01570222989" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={handleWhatsAppClick}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                          <MessageCircle size={14} />
                          WhatsApp: 01570222989
                        </a>
                    </div>
                </div>
              </div>
            ) : (
              <div className="p-4">
                {/* Category Sub-Tabs */}
                <div className="flex bg-slate-100/80 dark:bg-slate-700/50 p-1 rounded-xl mb-4">
                  <button 
                    onClick={() => { playClick(); setCategoryTab(TransactionType.INCOME); }}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${categoryTab === TransactionType.INCOME ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {t.incomeTab}
                  </button>
                  <button 
                    onClick={() => { playClick(); setCategoryTab(TransactionType.EXPENSE); }}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${categoryTab === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-600 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {t.expenseTab}
                  </button>
                  <button 
                    onClick={() => { playClick(); setCategoryTab(TransactionType.SAVINGS); }}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${categoryTab === TransactionType.SAVINGS ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {t.savingsTab}
                  </button>
                </div>

                {/* Add Category */}
                <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                  <div className="flex-1 relative">
                      <input 
                        ref={categoryInputRef}
                        type="text" 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder={t.placeholder}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button 
                        type="button"
                        onClick={handlePasteCategory}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                        title="Paste"
                      >
                        <Clipboard size={14} />
                      </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={!newCategory.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Plus size={20} />
                  </button>
                </form>

                {/* Category List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {getCurrentCategories().map((cat) => (
                    <div key={cat} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors group">
                      <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                        {getLocalizedCategory(cat, language)}
                      </span>
                      <button 
                        onClick={() => { playClick(); setDeleteInfo({ type: categoryTab, name: cat }); }}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {/* 1. Delete Category Confirmation */}
      {deleteInfo && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteInfo(null)} />
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm relative z-20 p-6 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t.deleteTitle}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{t.deleteConfirm}</p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteInfo(null)} 
                  className="flex-1 py-2.5 px-4 rounded-xl text-slate-700 dark:text-slate-200 font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {tCommon.cancel}
                </button>
                <button 
                  onClick={confirmDeleteCategory} 
                  className="flex-1 py-2.5 px-4 rounded-xl text-white font-medium bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
                >
                  {tCommon.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Clear All Data Confirmation */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setConfirmClearOpen(false)} />
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm relative z-20 p-6 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t.confirmClearTitle}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{t.confirmClearDesc}</p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setConfirmClearOpen(false)} 
                  className="flex-1 py-2.5 px-4 rounded-xl text-slate-700 dark:text-slate-200 font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {language === 'bn' ? 'না' : 'No'}
                </button>
                <button 
                  onClick={executeClearAll} 
                  className="flex-1 py-2.5 px-4 rounded-xl text-white font-medium bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
                >
                  {language === 'bn' ? 'হ্যাঁ' : 'Yes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Restore Data Confirmation */}
      {confirmRestoreOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setConfirmRestoreOpen(false); setPendingImportFile(null); }} />
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm relative z-20 p-6 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                <Database size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t.confirmRestoreTitle}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{t.confirmRestoreDesc}</p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => { setConfirmRestoreOpen(false); setPendingImportFile(null); }} 
                  className="flex-1 py-2.5 px-4 rounded-xl text-slate-700 dark:text-slate-200 font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {tCommon.cancel}
                </button>
                <button 
                  onClick={executeRestore} 
                  className="flex-1 py-2.5 px-4 rounded-xl text-white font-medium bg-violet-600 hover:bg-violet-700 transition-colors shadow-sm"
                >
                  {tCommon.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm relative z-20 p-6 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                <LogOut size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t.logout}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{t.logoutConfirm}</p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowLogoutConfirm(false)} 
                  className="flex-1 py-2.5 px-4 rounded-xl text-slate-700 dark:text-slate-200 font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {tCommon.cancel}
                </button>
                <button 
                  onClick={confirmLogout} 
                  className="flex-1 py-2.5 px-4 rounded-xl text-white font-medium bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                >
                  {tCommon.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};