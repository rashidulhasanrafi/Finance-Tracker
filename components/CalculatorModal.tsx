import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { X, Copy, CheckCircle2, Calculator as CalculatorIcon } from 'lucide-react-native';
import { TRANSLATIONS, Language } from '../types';
import { playSound } from '../utils/sound';
import { safeCopy } from '../utils/clipboard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  soundEnabled: boolean;
}

export const CalculatorModal: React.FC<Props> = ({ isOpen, onClose, language, soundEnabled }) => {
  const [display, setDisplay] = useState('0');
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[language].calculator;

  useEffect(() => {
    if (isOpen) {
      setDisplay('0');
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const playClick = () => {
    if (soundEnabled) playSound('click');
  };

  const handleNumber = (num: string) => {
    playClick();
    if (display === '0' || display === t.error) {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    playClick();
    const lastChar = display.slice(-1);
    const operators = ['+', '-', '*', '/', '.'];
    
    if (operators.includes(lastChar)) {
        setDisplay(display.slice(0, -1) + op);
        return;
    }
    
    if (display !== t.error) {
       setDisplay(display + op);
    }
  };

  const calculate = () => {
    if (soundEnabled) playSound('income');
    try {
      const sanitized = display.replace(/[^0-9+\-/*.]/g, '');
      if (!sanitized) return;
      
      // Basic eval replacement
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + sanitized)();
      
      if (!isFinite(result) || isNaN(result)) {
        setDisplay(t.error);
      } else {
        const formatted = String(Math.round(result * 100) / 100);
        setDisplay(formatted);
      }
    } catch (e) {
      setDisplay(t.error);
    }
  };

  const handleClear = () => {
    if (soundEnabled) playSound('delete');
    setDisplay('0');
  };

  const handleBackspace = () => {
    playClick();
    if (display.length > 1 && display !== t.error) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleCopy = async () => {
    if (display === t.error) return;
    
    await safeCopy(display);
    if (soundEnabled) playSound('income');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const btns = [
    { label: 'C', action: handleClear, type: 'action' },
    { label: '÷', action: () => handleOperator('/'), type: 'op' },
    { label: '×', action: () => handleOperator('*'), type: 'op' },
    { label: '⌫', action: handleBackspace, type: 'action' },
    { label: '7', action: () => handleNumber('7'), type: 'num' },
    { label: '8', action: () => handleNumber('8'), type: 'num' },
    { label: '9', action: () => handleNumber('9'), type: 'num' },
    { label: '-', action: () => handleOperator('-'), type: 'op' },
    { label: '4', action: () => handleNumber('4'), type: 'num' },
    { label: '5', action: () => handleNumber('5'), type: 'num' },
    { label: '6', action: () => handleNumber('6'), type: 'num' },
    { label: '+', action: () => handleOperator('+'), type: 'op' },
    { label: '1', action: () => handleNumber('1'), type: 'num' },
    { label: '2', action: () => handleNumber('2'), type: 'num' },
    { label: '3', action: () => handleNumber('3'), type: 'num' },
    { label: '=', action: calculate, type: 'equal', rowSpan: 2 },
    { label: '0', action: () => handleNumber('0'), type: 'num', colSpan: 2 },
    { label: '.', action: () => handleOperator('.'), type: 'num' },
  ];

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white dark:bg-slate-800 rounded-t-3xl shadow-xl w-full border-t border-slate-200 dark:border-slate-700">
          
          {/* Header */}
          <View className="bg-slate-50 dark:bg-slate-800 p-4 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-700 rounded-t-3xl">
            <View className="flex-row items-center gap-2">
              <CalculatorIcon size={20} color="#4f46e5" />
              <Text className="text-indigo-600 dark:text-indigo-400 font-bold">{t.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Display */}
          <View className="p-6 bg-slate-50 dark:bg-slate-900 items-end">
             <Text 
               className="text-4xl font-bold text-slate-800 dark:text-white font-mono"
               numberOfLines={1}
               adjustsFontSizeToFit
             >
               {display}
             </Text>
          </View>

          {/* Keypad */}
          <View className="p-4 flex-row flex-wrap justify-between bg-white dark:bg-slate-800">
            {btns.map((btn, i) => (
               <TouchableOpacity
                 key={i}
                 onPress={btn.action}
                 className={`
                   ${btn.colSpan === 2 ? 'w-[48%]' : 'w-[23%]'}
                   ${btn.rowSpan === 2 ? 'h-32' : 'h-14'}
                   mb-2
                   rounded-xl items-center justify-center shadow-sm
                   ${btn.type === 'num' ? 'bg-slate-50 dark:bg-slate-700' : ''}
                   ${btn.type === 'op' ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}
                   ${btn.type === 'action' ? 'bg-rose-50 dark:bg-rose-900/30' : ''}
                   ${btn.type === 'equal' ? 'bg-indigo-600' : ''}
                 `}
               >
                 <Text className={`text-lg font-bold 
                   ${btn.type === 'equal' ? 'text-white' : 'text-slate-700 dark:text-slate-200'}
                 `}>
                   {btn.label}
                 </Text>
               </TouchableOpacity>
            ))}
          </View>

          {/* Copy Action */}
          <View className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 pb-8">
            <TouchableOpacity
              onPress={handleCopy}
              className="w-full py-3 rounded-xl bg-emerald-600 items-center flex-row justify-center gap-2"
            >
              {copied ? <CheckCircle2 size={18} color="white" /> : <Copy size={18} color="white" />}
              <Text className="text-white font-medium">{copied ? t.copied : t.copy}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};