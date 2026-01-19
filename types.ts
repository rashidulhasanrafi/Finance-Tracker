

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  SAVINGS = 'SAVINGS'
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  type: TransactionType;
  currency: string;
  excludeFromBalance?: boolean; 
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  currency: string;
  category?: string;
  color?: string;
  isFixedDeposit?: boolean;
}

export interface Profile {
  id: string;
  name: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  balance: number;
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Rent & Housing',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Travel',
  'Insurance',
  'Subscriptions',
  'Personal Care',
  'Gifts & Donations',
  'Taxes',
  'Debt Payments',
  'Others'
];

export const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Dividends',
  'Royalties',
  'Grants',
  'Rental Income',
  'Refunds',
  'Gifts',
  'Other Income',
  'Savings Withdrawal'
];

export const DEFAULT_SAVINGS_CATEGORIES = [
  'Goal Saving',
  'Emergency Fund',
  'Bank Deposit',
  'Fixed Deposit',
  'DPS',
  'Investments',
  'Gold',
  'Stocks',
  'Cash Savings',
  'Crypto',
  'Retirement'
];

// Bangla Translations for Default Categories
export const CATEGORY_TRANSLATIONS_BN: Record<string, string> = {
  // Expenses
  'Food & Dining': 'খাবার ও রেস্তোরা',
  'Rent & Housing': 'বাড়ি ভাড়া ও আবাসন',
  'Transportation': 'পরিবহন',
  'Utilities': 'বিল ও ইউটিলিটি',
  'Entertainment': 'বিনোদন',
  'Healthcare': 'চিকিৎসা',
  'Shopping': 'কেনাকাটা',
  'Education': 'শিক্ষা',
  'Travel': 'ভ্রমণ',
  'Insurance': 'বীমা',
  'Subscriptions': 'সাবস্ক্রিপশন',
  'Personal Care': 'ব্যক্তিগত যত্ন',
  'Gifts & Donations': 'উপহার ও দান',
  'Taxes': 'ট্যাক্স',
  'Debt Payments': 'ঋণ পরিশোধ',
  'Others': 'অন্যান্য',

  // Income
  'Salary': 'বেতন',
  'Freelance': 'ফ্রিল্যান্সিং',
  'Investments': 'বিনিয়োগ',
  'Dividends': 'লভ্যাংশ',
  'Royalties': 'রয়্যালটি',
  'Grants': 'অনুদান',
  'Rental Income': 'ভাড়া আয়',
  'Refunds': 'রিফান্ড',
  'Gifts': 'উপহার',
  'Other Income': 'অন্যান্য আয়',
  'Savings Withdrawal': 'সঞ্চয় থেকে উত্তোলন',

  // Savings
  'Emergency Fund': 'জরুরী তহবিল',
  'Bank Deposit': 'ব্যাংক জমা',
  'DPS': 'ডিপিএস',
  'Gold': 'স্বর্ণ',
  'Stocks': 'শেয়ার বাজার',
  'Cash Savings': 'নগদ জমা',
  'Crypto': 'ক্রিপ্টো',
  'Retirement': 'অবসরকালীন',
  'Goal Saving': 'লক্ষ্য সঞ্চয়',
  'Fixed Deposit': 'ফিক্সড ডিপোজিট'
};

export const getLocalizedCategory = (category: string, language: Language): string => {
  if (language === 'bn') {
    return CATEGORY_TRANSLATIONS_BN[category] || category;
  }
  return category;
};

export const CURRENCIES = [
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
];

export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  BDT: 122.50,
  EUR: 0.96,
  GBP: 0.81,
  INR: 86.85,
  JPY: 154.50,
  CAD: 1.44,
  AUD: 1.60
};

export const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  return (amount / fromRate) * toRate;
};

export type Language = 'en' | 'bn';

export const TRANSLATIONS = {
  en: {
    dashboard: {
      balance: 'Current Balance',
      income: 'Total Income',
      expense: 'Total Expense',
      savings: 'Total Savings',
    },
    form: {
      title: 'Add Transaction',
      editTitle: 'Edit Transaction',
      income: 'Income',
      expense: 'Expense',
      savings: 'Savings',
      amount: 'Amount',
      category: 'Category',
      date: 'Date',
      note: 'Note (Optional)',
      addBtn: 'Add Transaction',
      updateBtn: 'Update Transaction',
      cancelBtn: 'Cancel',
      placeholderAmount: '0.00',
      placeholderNote: 'e.g., Grocery shopping',
      alertAmount: 'Please enter a valid positive amount.',
      alertCategory: 'Please select a category.',
      deductFromBalance: 'Deduct from Balance?',
      deductDesc: 'Money will be subtracted from your current balance.',
      noDeductDesc: 'Just adds to savings category. Balance remains unchanged.',
    },
    list: {
      title: 'Recent History',
      emptyTitle: 'No transactions yet',
      emptyDesc: 'Add your first income, expense or savings to start tracking.',
      deleteTitle: 'Delete Transaction',
      deleteConfirm: 'Are you sure you want to delete this transaction?',
      confirm: 'Confirm',
      cancel: 'Cancel'
    },
    chart: {
      title: 'Spending by Category',
      empty: 'Add expenses to see the spending breakdown.',
      tooltipAmount: 'Amount'
    },
    goals: {
      title: 'Funds & Savings',
      empty: 'No savings goals yet.',
      saved: 'Saved',
      target: 'Target',
      completed: 'Completed!',
      addMoney: 'Deposit',
      create: 'Add New Fund',
      edit: 'Edit Fund',
      update: 'Update',
      name: 'Fund Name',
      placeholderName: 'e.g. New Laptop or FD',
      deleteConfirm: 'Are you sure you want to delete this fund?',
      depositTitle: 'Deposit to Fund',
      depositBtn: 'Deposit',
      withdrawBtn: 'Withdraw',
      withdrawTitle: 'Withdraw from Fund',
      isFixedDeposit: 'Mark as Fixed Deposit (FD)',
      fdDesc: 'Money will be locked. Confirmation required to break.',
      breakFdTitle: 'Break Fixed Deposit?',
      breakFdConfirm: 'Are you sure you want to break this Fixed Deposit early?',
      confirmWithdraw: 'Withdraw funds to main balance?',
      fixedDeposit: 'Fixed Deposit',
      category: 'Savings Category'
    },
    funds: {
      title: 'Funds & Savings',
      emptyGoals: 'No funds goals yet.',
      saved: 'Saved',
      target: 'Target',
      addMoney: 'Add Money',
      addGoal: 'Add Goal',
      editGoal: 'Edit Goal',
      create: 'Create',
      update: 'Update',
      goalName: 'Goal Name',
      deposit: 'Deposit',
      deleteGoalConfirm: 'Are you sure you want to delete this goal?'
    },
    ai: {
      title: 'AI Financial Insights',
      desc: 'Ask questions or get tips based on your spending habits using Gemini AI.',
      btn: 'Generate Tip',
      askBtn: 'Ask AI',
      placeholder: 'Ask a question (e.g. How to save more?)',
      analyzing: 'Thinking...',
      error: 'Could not retrieve insight at this moment.',
      apiError: 'I\'m having trouble analyzing your data right now. Please try again later.',
      missingKey: 'API Key is missing.'
    },
    settings: {
      title: 'Settings',
      generalTab: 'General',
      categoriesTab: 'Categories',
      appearance: 'Appearance',
      darkMode: 'Dark Mode',
      sound: 'Sound Effects',
      language: 'Language',
      currency: 'Currency',
      selectCurrency: 'Select Currency',
      incomeTab: 'Income',
      expenseTab: 'Expense',
      savingsTab: 'Savings',
      placeholder: 'New category name...',
      add: 'Add',
      close: 'Close',
      exists: 'Category already exists.',
      deleteTitle: 'Delete Category',
      deleteConfirm: 'Are you sure you want to remove this category?',
      dataManagement: 'Data Management',
      backupTitle: 'Backup & Restore',
      backupDesc: 'Save your data or transfer to another device.',
      backupEmail: 'Backup via Email',
      restoreData: 'Restore Data',
      clearData: 'Reset Transactions',
      clearDataDesc: 'Delete all transactions for this profile but keep settings.',
      confirmClearTitle: 'Reset Transactions?',
      confirmClearDesc: 'This will delete all income and expense entries for the current profile. Categories and settings will be saved.',
      confirmRestoreTitle: 'Restore Data?',
      confirmRestoreDesc: 'This will replace your current data with the backup file. Are you sure?',
      successRestore: 'Data restored successfully!',
      errorRestore: 'Invalid backup file.',
      shareExport: 'Share & Export',
      openShare: 'Open Share Options',
      logout: 'Logout',
      logoutConfirm: 'Are you sure you want to logout?'
    },
    profile: {
      title: 'Profile Manager',
      create: 'Create Profile',
      switch: 'Switch',
      edit: 'Edit',
      update: 'Update',
      delete: 'Delete',
      namePlaceholder: 'Profile Name (e.g. Travel)',
      deleteTitle: 'Delete Profile',
      confirmDelete: 'Are you sure? All data for this profile will be lost.',
      active: 'Active',
      cantDeleteLast: 'Cannot delete the only profile.'
    },
    share: {
      title: 'Share & Export',
      desc: 'Export your financial data or share a summary.',
      exportCsv: 'Export CSV',
      copySummary: 'Copy Summary',
      csvDesc: 'Download all transactions as a spreadsheet.',
      summaryDesc: 'Copy a text report to clipboard.',
      copied: 'Copied!',
      totalBalance: 'Total Balance',
      netIncome: 'Net Income',
      netExpense: 'Net Expense',
      totalSavings: 'Total Savings',
      exportPdf: 'Export PDF',
      pdfDesc: 'Download a detailed PDF report.',
      sharePdf: 'Share PDF File',
      sharePdfDesc: 'Send PDF via Gmail, WhatsApp, etc.',
      shareWhatsapp: 'Share on WhatsApp',
      shareWhatsappDesc: 'Send summary text via WhatsApp.',
      shareMail: 'Send Email',
      shareMailDesc: 'Send summary text via Email.'
    },
    calculator: {
      title: 'Calculator',
      copy: 'Copy',
      copied: 'Copied!',
      clear: 'AC',
      error: 'Error'
    },
    common: {
      soundOn: 'Sound On',
      soundOff: 'Sound Off',
      on: 'On',
      off: 'Off',
      confirm: 'Confirm',
      cancel: 'Cancel',
      note: 'Note'
    }
  },
  bn: {
    dashboard: {
      balance: 'বর্তমান ব্যালেন্স',
      income: 'মোট আয়',
      expense: 'মোট ব্যয়',
      savings: 'মোট সঞ্চয়',
    },
    form: {
      title: 'লেনদেন যোগ করুন',
      editTitle: 'লেনদেন আপডেট করুন',
      income: 'আয়',
      expense: 'ব্যয়',
      savings: 'সঞ্চয়',
      amount: 'পরিমাণ',
      category: 'বিভাগ',
      date: 'তারিখ',
      note: 'নোট (ঐচ্ছিক)',
      addBtn: 'লেনদেন যোগ করুন',
      updateBtn: 'আপডেট করুন',
      cancelBtn: 'বাতিল',
      placeholderAmount: '০.০০',
      placeholderNote: 'যেমন: বাজার খরচ',
      alertAmount: 'অনুগ্রহ করে সঠিক পরিমাণ লিখুন।',
      alertCategory: 'অনুগ্রহ করে একটি বিভাগ নির্বাচন করুন।',
      deductFromBalance: 'ব্যালেন্স থেকে কাটবে?',
      deductDesc: 'টাকা বর্তমান ব্যালেন্স থেকে কমে যাবে।',
      noDeductDesc: 'শুধুমাত্র সঞ্চয় ক্যাটাগরিতে যোগ হবে। ব্যালেন্স কমবে না।',
    },
    list: {
      title: 'সাম্প্রতিক ইতিহাস',
      emptyTitle: 'কোনো লেনদেন নেই',
      emptyDesc: 'ট্র্যাকিং শুরু করতে আপনার প্রথম আয়, ব্যয় বা সঞ্চয় যোগ করুন।',
      deleteTitle: 'লেনদেন মুছুন',
      deleteConfirm: 'আপনি কি নিশ্চিত যে আপনি এই লেনদেনটি মুছে ফেলতে চান?',
      confirm: 'নিশ্চিত করুন',
      cancel: 'বাতিল'
    },
    chart: {
      title: 'বিভাগ অনুযায়ী খরচ',
      empty: 'খরচের বিবরণ দেখতে ব্যয় যোগ করুন।',
      tooltipAmount: 'পরিমাণ'
    },
    goals: {
      title: 'তহবিল ও সঞ্চয়',
      empty: 'কোনো সঞ্চয় তহবিল নেই।',
      saved: 'জমা',
      target: 'লক্ষ্য',
      completed: 'সম্পন্ন!',
      addMoney: 'জমা করুন',
      create: 'নতুন তহবিল যোগ করুন',
      edit: 'তহবিল আপডেট',
      update: 'আপডেট',
      name: 'তহবিলের নাম',
      placeholderName: 'যেমন: নতুন ল্যাপটপ বা এফডি',
      deleteConfirm: 'আপনি কি নিশ্চিত যে আপনি এই তহবিলটি মুছে ফেলতে চান?',
      depositTitle: 'তহবিলে জমা দিন',
      depositBtn: 'জমা দিন',
      withdrawBtn: 'উত্তোলন করুন',
      withdrawTitle: 'তহবিল থেকে উত্তোলন',
      isFixedDeposit: 'ফিক্সড ডিপোজিট (FD) হিসেবে মার্ক করুন',
      fdDesc: 'টাকা লক থাকবে। ভাঙার জন্য নিশ্চিতকরণের প্রয়োজন হবে।',
      breakFdTitle: 'ফিক্সড ডিপোজিট ভাঙবেন?',
      breakFdConfirm: 'আপনি কি নিশ্চিত যে আপনি মেয়াদের আগেই এই ফিক্সড ডিপোজিট ভাঙতে চান?',
      confirmWithdraw: 'টাকা বর্তমান ব্যালেন্সে ফেরত আসবে?',
      fixedDeposit: 'ফিক্সড ডিপোজিট',
      category: 'সঞ্চয় বিভাগ'
    },
    funds: {
      title: 'তহবিল ও সঞ্চয়',
      emptyGoals: 'কোনো তহবিল নেই।',
      saved: 'জমা',
      target: 'লক্ষ্য',
      addMoney: 'টাকা যোগ',
      addGoal: 'তহবিল যোগ',
      editGoal: 'তহবিল আপডেট',
      create: 'তৈরি',
      update: 'আপডেট',
      goalName: 'তহবিলের নাম',
      deposit: 'জমা',
      deleteGoalConfirm: 'আপনি কি নিশ্চিত যে আপনি এই তহবিলটি মুছে ফেলতে চান?'
    },
    ai: {
      title: 'এআই আর্থিক পরামর্শ',
      desc: 'জেমিনি এআই ব্যবহার করে আপনার প্রশ্ন জিজ্ঞাসা করুন বা টিপস পান।',
      btn: 'পরামর্শ তৈরি করুন',
      askBtn: 'জিজ্ঞাসা করুন',
      placeholder: 'প্রশ্ন করুন (যেমন: আমি কীভাবে আরও সঞ্চয় করতে পারি?)',
      analyzing: 'ভাবছি...',
      error: 'এই মুহূর্তে পরামর্শ পাওয়া যাচ্ছে না।',
      apiError: 'আপনার তথ্য বিশ্লেষণ করতে সমস্যা হচ্ছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।',
      missingKey: 'এপিআই কি (API Key) পাওয়া যায়নি।'
    },
    settings: {
      title: 'সেটিংস',
      generalTab: 'সাধারণ',
      categoriesTab: 'বিভাগ',
      appearance: 'চেহারা',
      darkMode: 'ডার্ক মোড',
      sound: 'সাউন্ড ইফেক্ট',
      language: 'ভাষা',
      currency: 'মুদ্রা',
      selectCurrency: 'মুদ্রা নির্বাচন করুন',
      incomeTab: 'আয়',
      expenseTab: 'ব্যয়',
      savingsTab: 'সঞ্চয়',
      placeholder: 'নতুন বিভাগের নাম...',
      add: 'যোগ করুন',
      close: 'বন্ধ করুন',
      exists: 'এই বিভাগটি ইতিমধ্যে বিদ্যমান।',
      deleteTitle: 'বিভাগ মুছুন',
      deleteConfirm: 'আপনি কি নিশ্চিত যে আপনি এই বিভাগটি মুছে ফেলতে চান?',
      dataManagement: 'ডেটা ম্যানেজমেন্ট',
      backupTitle: 'ব্যাকআপ এবং রিস্টোর',
      backupDesc: 'আপনার তথ্য সংরক্ষণ করুন বা অন্য ডিভাইসে স্থানান্তর করুন।',
      backupEmail: 'ব্যাকআপ (ইমেইল)',
      restoreData: 'ডেটা রিস্টোর করুন',
      clearData: 'লেনদেন রিসেট করুন',
      clearDataDesc: 'এই প্রোফাইলের সব লেনদেন মুছে ফেলুন, কিন্তু সেটিংস ঠিক থাকবে।',
      confirmClearTitle: 'লেনদেন রিসেট করবেন?',
      confirmClearDesc: 'এটি বর্তমান প্রোফাইলের সমস্ত লেনদেন মুছে ফেলবে। বিভাগ এবং সেটিংস সংরক্ষিত থাকবে।',
      confirmRestoreTitle: 'ডেটা রিস্টোর করবেন?',
      confirmRestoreDesc: 'এটি আপনার বর্তমান ডেটা ব্যাকআপ ফাইলের সাথে প্রতিস্থাপন করবে। আপনি কি নিশ্চিত?',
      successRestore: 'ডেটা সফলভাবে রিস্টোর করা হয়েছে!',
      errorRestore: 'অকার্যকর ব্যাকআপ ফাইল।',
      shareExport: 'শেয়ার এবং এক্সপোর্ট',
      openShare: 'শেয়ার অপশন খুলুন',
      logout: 'লগআউট',
      logoutConfirm: 'আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?'
    },
    profile: {
      title: 'প্রোফাইল ম্যানেজার',
      create: 'প্রোফাইল তৈরি করুন',
      switch: 'পরিবর্তন',
      edit: 'এডিট',
      update: 'আপডেট',
      delete: 'মুছুন',
      namePlaceholder: 'প্রোফাইলের নাম (যেমন: ভ্রমণ)',
      deleteTitle: 'প্রোফাইল মুছুন',
      confirmDelete: 'আপনি কি নিশ্চিত? এই প্রোফাইলের সব তথ্য মুছে যাবে।',
      active: 'সক্রিয়',
      cantDeleteLast: 'একমাত্র প্রোফাইলটি মুছে ফেলা যাবে না।'
    },
    share: {
      title: 'শেয়ার এবং এক্সপোর্ট',
      desc: 'আপনার তথ্য এক্সপোর্ট করুন বা শেয়ার করুন।',
      exportCsv: 'CSV এক্সপোর্ট',
      copySummary: 'সারাংশ কপি করুন',
      csvDesc: 'স্প্রেডশিট হিসেবে সব লেনদেন ডাউনলোড করুন।',
      summaryDesc: 'ক্লিপবোর্ডে রিপোর্ট কপি করুন।',
      copied: 'কপি করা হয়েছে!',
      totalBalance: 'মোট ব্যালেন্স',
      netIncome: 'নীট আয়',
      netExpense: 'নীট ব্যয়',
      totalSavings: 'মোট সঞ্চয়',
      exportPdf: 'পিডিএফ (PDF) এক্সপোর্ট',
      pdfDesc: 'বিস্তারিত পিডিএফ রিপোর্ট ডাউনলোড করুন।',
      sharePdf: 'পিডিএফ শেয়ার করুন',
      sharePdfDesc: 'জিমেইল, হোয়াটসঅ্যাপ বা মেসেঞ্জারে পাঠান।',
      shareWhatsapp: 'হোয়াটসঅ্যাপ',
      shareWhatsappDesc: 'হোয়াটসঅ্যাপে সারাংশ পাঠান।',
      shareMail: 'ইমেইল',
      shareMailDesc: 'ইমেইলে সারাংশ পাঠান।'
    },
    calculator: {
      title: 'ক্যালকুলেটর',
      copy: 'কপি করুন',
      copied: 'কপি হয়েছে!',
      clear: 'AC',
      error: 'ত্রুটি'
    },
    common: {
      soundOn: 'সাউন্ড চালু',
      soundOff: 'সাউন্ড বন্ধ',
      on: 'চালু',
      off: 'বন্ধ',
      confirm: 'নিশ্চিত করুন',
      cancel: 'বাতিল',
      note: 'নোট'
    }
  }
};