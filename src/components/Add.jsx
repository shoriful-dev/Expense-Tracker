import React, { useMemo, useState } from 'react';
import { modalStyles } from '../assets/dummyStyles';
import { X } from 'lucide-react';

const AddTransactionModal = ({
  showModal,
  setShowModal,
  newTransaction,
  setNewTransaction,
  handleAddTransaction,
  loading = false,
  type = 'both',
  title = 'Add New Transaction',
  buttonText = 'Add Transaction',
  requireConfirm = true,
  categories = [
    'Food',
    'Housing',
    'Transport',
    'Shopping',
    'Entertainment',
    'Utilities',
    'Healthcare',
    'Salary',
    'Freelance',
    'Investments',
    'Bonus',
    'Other',
  ],
  color = 'teal',
}) => {
  if (!showModal) return null;

  // Get current date in YYYY-MM-DD format
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentDate = today.toISOString().split('T')[0];
  const minDate = `${currentYear}-01-01`;

  const colorClass = modalStyles.colorClasses[color];
  const [showConfirm, setShowConfirm] = useState(false);

  const confirmTitle = useMemo(() => {
    if (type === 'income') return 'Confirm add income';
    if (type === 'expense') return 'Confirm add expense';
    return 'Confirm add transaction';
  }, [type]);

  const confirmMessage = useMemo(() => {
    const txType =
      type === 'both' ? newTransaction?.type || 'transaction' : type;
    const desc = String(newTransaction?.description || '').trim();
    const amt = newTransaction?.amount;
    const date = newTransaction?.date;
    const cat = newTransaction?.category;
    return `Add ${txType}?\n\nDescription: ${desc || '-'}\nAmount: ${amt || '-'}\nCategory: ${cat || '-'}\nDate: ${date || '-'}`;
  }, [type, newTransaction]);

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modalContainer}>
        <div className={modalStyles.modalHeader}>
          <h3 className={modalStyles.modalTitle}>{title}</h3>
          <button
            className={modalStyles.closeButton}
            onClick={() => setShowModal(false)}
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (loading) return;
            if (!requireConfirm) {
              handleAddTransaction();
              return;
            }
            setShowConfirm(true);
          }}
        >
          <div className={modalStyles.form}>
            <div>
              <label className={modalStyles.label}>Description</label>
              <input
                type="text"
                value={newTransaction.description}
                onChange={e =>
                  setNewTransaction(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={modalStyles.input(colorClass.ring)}
                placeholder={
                  type === 'both'
                    ? 'Selary, Funds, etc'
                    : 'Groceries, Rent, etc'
                }
                required
              />
            </div>

            <div>
              <label className={modalStyles.label}>Amount</label>
              <input
                type="number"
                value={newTransaction.amount}
                onChange={e =>
                  setNewTransaction(prev => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                className={modalStyles.input(colorClass.ring)}
                placeholder="0.00"
                required
              />
            </div>

            {type === 'both' && (
              <div>
                <label className={modalStyles.label}>Type</label>
                <div className={modalStyles.typeButtonContainer}>
                  <button
                    type="button"
                    className={modalStyles.typeButton(
                      newTransaction.type === 'income',
                      modalStyles.colorClasses.teal.typeButtonSelected,
                    )}
                    onClick={() =>
                      setNewTransaction(prev => ({ ...prev, type: 'income' }))
                    }
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    className={modalStyles.typeButton(
                      newTransaction.type === 'expense',
                      modalStyles.colorClasses.orange.typeButtonSelected,
                    )}
                    onClick={() =>
                      setNewTransaction(prev => ({ ...prev, type: 'expense' }))
                    }
                  >
                    Expense
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className={modalStyles.label}>Category</label>
              <select
                value={newTransaction.category}
                onChange={e =>
                  setNewTransaction(prev => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className={modalStyles.input(colorClass.ring)}
              >
                {categories.map((category, index) => (
                  <option value={category} key={index}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={modalStyles.label}>Date</label>
              <input
                type="date"
                value={newTransaction.date}
                onChange={e =>
                  (() => {
                    return setNewTransaction(prev => ({
                      ...prev,
                      date: e.target.value,
                    }));
                  })()
                }
                className={modalStyles.input(colorClass.ring)}
                min={minDate}
                max={currentDate}
                required
              />
            </div>
            <button
              type="submit"
              className={modalStyles.submitButton(colorClass.button)}
              disabled={loading}
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>

      {showConfirm && (
        <div className={modalStyles.overlay}>
          <div className={modalStyles.modalContainer}>
            <div className={modalStyles.modalHeader}>
              <h3 className={modalStyles.modalTitle}>{confirmTitle}</h3>
              <button
                className={modalStyles.closeButton}
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                <X size={24} />
              </button>
            </div>
            <div className="px-6 pb-6">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                {confirmMessage}
              </pre>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className={modalStyles.submitButton('bg-gray-500 hover:bg-gray-600')}
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={modalStyles.submitButton(colorClass.button)}
                  onClick={() => {
                    if (loading) return;
                    setShowConfirm(false);
                    handleAddTransaction();
                  }}
                  disabled={loading}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AddTransactionModal;
