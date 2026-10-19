import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSummaryAPI,
  getTransactionsAPI,
  createTransactionAPI,
  updateTransactionAPI,
  deleteTransactionAPI,
  seedDemoDataAPI,
} from '../services/api';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Settings state
  const [currency, setCurrency] = useState(() => localStorage.getItem('bizpulse_currency') || '₹');
  const [businessName, setBusinessName] = useState(() => localStorage.getItem('bizpulse_bname') || 'Apex Retail & Traders');

  // Filter state
  const [period, setPeriod] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('sale'); // 'sale' | 'expense' | 'edit'
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Delete Confirm Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch summary & transactions from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { period };
      if (period === 'custom') {
        params.startDate = customStart;
        params.endDate = customEnd;
      }

      const [summaryRes, transRes] = await Promise.all([
        getSummaryAPI(params),
        getTransactionsAPI(params),
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (transRes.success) setTransactions(transRes.data);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  }, [period, customStart, customEnd]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open modal handlers
  const openAddSaleModal = () => {
    setModalMode('sale');
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openAddExpenseModal = () => {
    setModalMode('expense');
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction) => {
    setModalMode('edit');
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Handle Save (Create or Update)
  const handleSaveTransaction = async (formData) => {
    try {
      if (modalMode === 'edit' && editingTransaction) {
        const res = await updateTransactionAPI(editingTransaction._id, formData);
        if (res.success) {
          addToast('Transaction updated successfully', 'success');
          closeModal();
          fetchData();
        }
      } else {
        const res = await createTransactionAPI(formData);
        if (res.success) {
          const sym = currency || '₹';
          const amt = `${sym}${Number(formData.amount).toLocaleString('en-IN')}`;
          const msg = formData.type === 'sale'
            ? `Sale recorded — ${amt} added to your revenue.`
            : `Expense added — ${amt} recorded.`;
          addToast(msg, 'success');
          closeModal();
          fetchData();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving transaction';
      addToast(msg, 'error');
    }
  };

  // Handle Delete
  const confirmDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTransaction = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteTransactionAPI(deletingId);
      if (res.success) {
        addToast('Transaction deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        setDeletingId(null);
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error deleting transaction', 'error');
    }
  };

  // Seed sample data
  const handleSeedData = async () => {
    try {
      setLoading(true);
      const res = await seedDemoDataAPI();
      if (res.success) {
        addToast(res.message || 'Sample demo data seeded successfully!', 'success');
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to seed demo data', 'error');
      setLoading(false);
    }
  };

  // Update Settings
  const updateSettings = (name, curr) => {
    setBusinessName(name);
    setCurrency(curr);
    localStorage.setItem('bizpulse_bname', name);
    localStorage.setItem('bizpulse_currency', curr);
    addToast('Settings updated successfully', 'success');
  };

  return (
    <TransactionContext.Provider
      value={{
        summary,
        transactions,
        loading,
        error,
        currency,
        businessName,
        period,
        setPeriod,
        customStart,
        setCustomStart,
        customEnd,
        setCustomEnd,
        isModalOpen,
        modalMode,
        editingTransaction,
        openAddSaleModal,
        openAddExpenseModal,
        openEditModal,
        closeModal,
        handleSaveTransaction,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        confirmDelete,
        handleDeleteTransaction,
        handleSeedData,
        updateSettings,
        toasts,
        addToast,
        removeToast,
        refetch: fetchData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};
