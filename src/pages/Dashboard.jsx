import { useEffect, useMemo, useState } from 'react';
import {
  dashboardStyles,
  trendStyles,
  chartStyles,
} from '../assets/dummyStyles';
import {
  GAUGE_COLORS,
  COLORS,
  INCOME_COLORS,
  INCOME_CATEGORY_ICONS,
  EXPENSE_CATEGORY_ICONS,
} from '../assets/color';
import { useOutletContext } from 'react-router-dom';
import {
  calculateData,
  getPreviousTimeFrameRange,
  getTimeFrameRange,
} from './../components/Helpers';
import axios from 'axios';
import {
  ArrowDown,
  BarChart2,
  ChevronDown,
  TrendingUp as ProfitIcon,
  PieChart as PieChartIcon,
  ChevronUp,
  DollarSign,
  PiggyBank,
  Plus,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import FinancialCard from './../components/FinancialCard';
import GaugeCard from '../components/GaugeCard';
import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import AddTransactionModal from '../components/Add';
import { formatBDT } from '../utils/currency';
import { toast } from 'react-toastify';
import TransactionItem from '../components/TransactionItem';
import { usePreferences } from '../context/PreferencesContext.jsx';

const API_BASE = 'http://localhost:8000/api';

const getAuthHeader = () => {
  const token =
    localStorage.getItem('token') || localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// to convert date to ISO timeline
function toIsoWithClientTime(dateValue) {
  if (!dateValue) {
    return new Date().toISOString();
  }

  if (typeof dateValue === 'string' && dateValue.length === 10) {
    const now = new Date();
    const hhmmss = now.toTimeString().slice(0, 8);
    const combined = new Date(`${dateValue}T${hhmmss}`);
    return combined.toISOString();
  }

  try {
    return new Date(dateValue).toISOString();
  } catch (err) {
    console.error(err);
    return new Date().toISOString();
  }
}

const Dashboard = () => {
  const { prefs } = usePreferences();
  const {
    transactions: outletTransactions = [],
    timeFrame = 'monthly',
    setTimeFrame = () => {},
    refreshTransactions,
  } = useOutletContext();

  const [showModal, setShowModal] = useState(false);
  const [gaugeData, setGaugeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overviewMeta, setOverviewMeta] = useState({});
  const [showAllIncome, setShowAllIncome] = useState(false);
  const [showAllExpense, setShowAllExpense] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'expense',
  });

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'expense',
    category: 'Food',
  });

  const timeFrameRange = useMemo(
    () => getTimeFrameRange(timeFrame),
    [timeFrame],
  );
  const prevTimeFrameRange = useMemo(
    () => getPreviousTimeFrameRange(timeFrame),
    [timeFrame],
  );

  const isDateInRange = (date, start, end) => {
    const transactionDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    transactionDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return transactionDate >= startDate && transactionDate <= endDate;
  };

  const filteredTransactions = useMemo(
    () =>
      (outletTransactions || []).filter(t =>
        isDateInRange(t.date, timeFrameRange.start, timeFrameRange.end),
      ),
    [outletTransactions, timeFrameRange],
  );

  const prevFilteredTransactions = useMemo(
    () =>
      (outletTransactions || []).filter(t =>
        isDateInRange(t.date, prevTimeFrameRange.start, prevTimeFrameRange.end),
      ),
    [outletTransactions, prevTimeFrameRange],
  );

  const currentTimeFrameData = useMemo(() => {
    const data = calculateData(filteredTransactions);
    data.savings = data.income - data.expenses;
    return data;
  }, [filteredTransactions]);

  const prevTimeFrameData = useMemo(() => {
    const data = calculateData(prevFilteredTransactions);
    data.savings = data.income - data.expenses;
    return data;
  }, [prevFilteredTransactions]);

  useEffect(() => {
    const maxValues = {
      income: Math.max(currentTimeFrameData.income, 5000),
      expenses: Math.max(currentTimeFrameData.expenses, 3000),
      savings: Math.max(Math.abs(currentTimeFrameData.savings), 2000),
    };

    setGaugeData([
      {
        name: 'Income',
        value: currentTimeFrameData.income,
        max: maxValues.income,
      },
      {
        name: 'Spent',
        value: currentTimeFrameData.expenses,
        max: maxValues.expenses,
      },
      {
        name: 'Savings',
        value: currentTimeFrameData.savings,
        max: maxValues.savings,
      },
    ]);
  }, [currentTimeFrameData, timeFrame]);

  const displayIncome =
    timeFrame === 'monthly' && typeof overviewMeta.monthlyIncome === 'number'
      ? overviewMeta.monthlyIncome
      : currentTimeFrameData.income;

  const displayExpenses =
    timeFrame === 'monthly' && typeof overviewMeta.monthlyExpense === 'number'
      ? overviewMeta.monthlyExpense
      : currentTimeFrameData.expenses;

  const displaySavings =
    timeFrame === 'monthly' && typeof overviewMeta.savings === 'number'
      ? overviewMeta.savings
      : currentTimeFrameData.savings;

  const expenseChange = useMemo(() => {
    const prev = prevTimeFrameData.expenses;
    const curr = displayExpenses;
    if (!prev) {
      if (!curr) return 0;
      return 100;
    }
    return Math.round(((curr - prev) / prev) * 100);
  }, [prevTimeFrameData, displayExpenses]);

  const financialOverviewData = useMemo(() => {
    if (
      timeFrame === 'monthly' &&
      overviewMeta.expenseDistribution &&
      Array.isArray(overviewMeta.expenseDistribution) &&
      overviewMeta.expenseDistribution.length > 0
    ) {
      return overviewMeta.expenseDistribution.map(d => ({
        name: d.category,
        value: Math.round(Number(d.amount) || 0),
      }));
    }

    const categories = {};
    filteredTransactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        categories[transaction.category] =
          (categories[transaction.category] || 0) + transaction.amount;
      }
    });

    return Object.keys(categories).map(category => ({
      name: category,
      value: Math.round(categories[category]),
    }));
  }, [filteredTransactions, overviewMeta, timeFrame]);

  const serverRecent = overviewMeta.recentTransactions || [];
  const serverRecentIncome = serverRecent
    .filter(t => t.type === 'income')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const serverRecentExpense = serverRecent
    .filter(t => t.type === 'expense')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const incomeTransactions = useMemo(
    () =>
      filteredTransactions
        .filter(t => t.type === 'income')
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredTransactions],
  );

  const expenseTransactions = useMemo(
    () =>
      filteredTransactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredTransactions],
  );

  const incomeListForDisplay =
    timeFrame === 'monthly' && serverRecentIncome.length > 0
      ? serverRecentIncome
      : incomeTransactions;

  const expenseListForDisplay =
    timeFrame === 'monthly' && serverRecentExpense.length > 0
      ? serverRecentExpense
      : expenseTransactions;

  const displayedIncome = showAllIncome
    ? incomeListForDisplay
    : incomeListForDisplay.slice(0, 3);

  const displayedExpense = showAllExpense
    ? expenseListForDisplay
    : expenseListForDisplay.slice(0, 3);

  const fetchDashboardOverview = async () => {
    try {
      const response = await axios.get(`${API_BASE}/dashboard`, {
        headers: getAuthHeader(),
      });
      if (response?.data?.success) {
        const data = response.data.data;

        const recent = (data.recentTransactions || []).map(item => {
          const typeFromServer =
            item.type || (item.category ? 'expense' : 'income');
          const amountNum = Number(item.amount) || 0;

          const isoDate = item.date
            ? new Date(item.date).toISOString()
            : item.createdAt
              ? new Date(item.createdAt).toISOString()
              : new Date().toISOString();

          return {
            id: item._id || item.id || Date.now() + Math.random(),
            date: isoDate,
            description:
              item.description ||
              item.note ||
              item.title ||
              (typeFromServer === 'income'
                ? item.source || 'Income'
                : item.category || 'Expense'),
            amount: amountNum,
            type: typeFromServer,
            category:
              item.category ||
              (typeFromServer === 'income' ? 'Salary' : 'Other'),
            raw: item,
          };
        });

        setOverviewMeta(prev => ({
          ...prev,
          monthlyIncome: Number(data.monthlyIncome || 0),
          monthlyExpense: Number(data.monthlyExpense || 0),
          savings:
            typeof data.savings !== 'undefined'
              ? Number(data.savings)
              : Number(data.monthlyIncome || 0) -
                Number(data.monthlyExpense || 0),
          savingsRate:
            typeof data.savingsRate !== 'undefined' ? data.savingsRate : null,
          spendByCategory: data.spendByCategory || {},
          expenseDistribution: data.expenseDistribution || [],
          recentTransactions: recent,
        }));

        if (timeFrame === 'monthly') {
          const monthlyIncome = Number(data.monthlyIncome || 0);
          const monthlyExpense = Number(data.monthlyExpense || 0);
          const savings =
            typeof data.savings !== 'undefined'
              ? Number(data.savings)
              : monthlyIncome - monthlyExpense;

          const maxValues = {
            income: Math.max(monthlyIncome, 5000),
            expenses: Math.max(monthlyExpense, 3000),
            savings: Math.max(Math.abs(savings), 2000),
          };

          setGaugeData([
            { name: 'Income', value: monthlyIncome, max: maxValues.income },
            { name: 'Spent', value: monthlyExpense, max: maxValues.expenses },
            { name: 'Savings', value: savings, max: maxValues.savings },
          ]);
        }
      } else {
        console.warn(
          'Dashboard endpoint returned success:false',
          response?.data,
        );
      }
    } catch (err) {
      console.error(
        'Failed to fetch dashboard overview:',
        err?.response || err.message || err,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  const handleEditTransaction = async () => {
    if (!editingId || !editForm.description || !editForm.amount) return;
    try {
      setLoading(true);
      const payload = {
        description: String(editForm.description).trim(),
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        date: toIsoWithClientTime(editForm.date),
      };
      if (editForm.type === 'income') {
        await axios.put(`${API_BASE}/income/update/${editingId}`, payload, {
          headers: getAuthHeader(),
        });
        toast.success('Income updated.');
      } else {
        await axios.put(`${API_BASE}/expense/update/${editingId}`, payload, {
          headers: getAuthHeader(),
        });
        toast.success('Expense updated.');
      }
      setEditingId(null);
      await refreshTransactions();
      await fetchDashboardOverview();
    } catch (e) {
      toast.error('Failed to update transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id, type) => {
    if (!id) return;
    try {
      setLoading(true);
      if (type === 'income') {
        await axios.delete(`${API_BASE}/income/delete/${id}`, {
          headers: getAuthHeader(),
        });
        toast.info('Income deleted.');
      } else {
        await axios.delete(`${API_BASE}/expense/delete/${id}`, {
          headers: getAuthHeader(),
        });
        toast.info('Expense deleted.');
      }
      await refreshTransactions();
      await fetchDashboardOverview();
    } catch (e) {
      toast.error('Failed to delete transaction.');
    } finally {
      setLoading(false);
    }
  };

  // add edit or delete transaction
  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount) return;

    const payload = {
      date: toIsoWithClientTime(newTransaction.date),
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.category,
    };

    try {
      setLoading(true);
      if (newTransaction.type === 'income') {
        const res = await axios.post(`${API_BASE}/income/add`, payload, {
          headers: getAuthHeader(),
        });
        const createdId =
          res?.data?.income?._id || res?.data?.income?.id || null;
        const toastId = toast.success(
          <div className="flex items-center justify-between gap-3">
            <span>Income added.</span>
            {createdId && (
              <button
                className="px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200"
                onClick={async () => {
                  try {
                    await axios.delete(`${API_BASE}/income/delete/${createdId}`, {
                      headers: getAuthHeader(),
                    });
                    await refreshTransactions();
                    await fetchDashboardOverview();
                    toast.dismiss(toastId);
                    toast.info('Income removed.');
                  } catch (_) {
                    toast.error('Failed to remove income.');
                  }
                }}
              >
                Undo
              </button>
            )}
          </div>,
        );
      } else {
        const res = await axios.post(`${API_BASE}/expense/add`, payload, {
          headers: getAuthHeader(),
        });
        const createdId =
          res?.data?.expense?._id || res?.data?.expense?.id || null;
        const toastId = toast.success(
          <div className="flex items-center justify-between gap-3">
            <span>Expense added.</span>
            {createdId && (
              <button
                className="px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200"
                onClick={async () => {
                  try {
                    await axios.delete(`${API_BASE}/expense/delete/${createdId}`, {
                      headers: getAuthHeader(),
                    });
                    await refreshTransactions();
                    await fetchDashboardOverview();
                    toast.dismiss(toastId);
                    toast.info('Expense removed.');
                  } catch (_) {
                    toast.error('Failed to remove expense.');
                  }
                }}
              >
                Undo
              </button>
            )}
          </div>,
        );
      }
      await refreshTransactions();
      await fetchDashboardOverview();

      setNewTransaction({
        date: new Date().toISOString(),
        description: '',
        amount: '',
        type: 'expense',
        category: 'Food',
      });
      setShowModal(false);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast.error('Failed to add transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={dashboardStyles.container}>
      {/* Header */}
      <div className={dashboardStyles.headerContainer}>
        <div className={dashboardStyles.headerContent}>
          <div>
            <h1 className={dashboardStyles.headerTitle}>Finance Dashboard</h1>
            <p className={dashboardStyles.headerSubtitle}>
              Track your income and expenses
            </p>
          </div>
          <button
            className={dashboardStyles.addButton}
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            Add Transaction
          </button>
        </div>

        <div className={dashboardStyles.timeFrameContainer}>
          <div className={dashboardStyles.timeFrameWrapper}>
            {['daily', 'weekly', 'monthly'].map(frame => (
              <button
                key={frame}
                onClick={() => setTimeFrame(frame)}
                className={dashboardStyles.timeFrameButton(timeFrame === frame)}
              >
                {frame.charAt(0).toUpperCase() + frame.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={dashboardStyles.summaryGrid}>
        <FinancialCard
          icon={
            <div className={dashboardStyles.walletIconContainer}>
              <Wallet className="w-5 h-5 text-teal-600" />
            </div>
          }
          label={'Total Balance'}
          value={formatBDT(Math.round(displayIncome - displayExpenses), {
            digits: prefs.digits,
            maximumFractionDigits: 0,
          })}
          additionalContent={
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className={dashboardStyles.balanceBadge}>
                +{formatBDT(Math.round(displayIncome), {
                  digits: prefs.digits,
                  maximumFractionDigits: 0,
                })}
              </span>
              <span className={dashboardStyles.expenseBadge}>
                -{formatBDT(Math.round(displayExpenses), {
                  digits: prefs.digits,
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          }
        />

        <FinancialCard
          icon={
            <div className={dashboardStyles.arrowDownIconContainer}>
              <ArrowDown className="w-5 h-5 text-orange-600" />
            </div>
          }
          label={`${timeFrameRange.label} Expenses`}
          value={formatBDT(Math.round(displayExpenses), {
            digits: prefs.digits,
            maximumFractionDigits: 0,
          })}
          additionalContent={
            <div
              className={`flex items-center gap-1 mt-2 text-xs ${expenseChange >= 0 ? trendStyles.positive : trendStyles.negative}`}
            >
              {expenseChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(expenseChange)}%{' '}
              {expenseChange >= 0 ? 'Increase' : 'Decrease'} from{' '}
              {prevTimeFrameRange.label}
            </div>
          }
        />

        <FinancialCard
          icon={
            <div className={dashboardStyles.piggyBankIconContainer}>
              <PiggyBank className="w-5 h-5 text-cyan-600" />
            </div>
          }
          label={`${timeFrameRange.label} Savings`}
          value={formatBDT(Math.round(displaySavings), {
            digits: prefs.digits,
            maximumFractionDigits: 0,
          })}
          additionalContent={
            <div className="mt-2 text-xs text-cyan-600 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <BarChart2 className="w-4 h-4" />
                <span>
                  {displayIncome > 0
                    ? Math.round((displaySavings / displayIncome) * 100)
                    : 0}
                  % of Income
                </span>
              </div>

              {typeof overviewMeta.savingsRate === 'number' && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    overviewMeta.savingsRate < 0
                      ? trendStyles.negativeRate
                      : trendStyles.positiveRate
                  }`}
                >
                  {overviewMeta.savingsRate}%
                </span>
              )}
            </div>
          }
        />
      </div>

      {/* Gauge Cards */}
      <div className={dashboardStyles.gaugeGrid}>
        {gaugeData.map((gauge, index) => (
          <GaugeCard
            key={index}
            gauge={gauge}
            colorInfo={GAUGE_COLORS[gauge.name]}
            timeFrameLabel={timeFrameRange.label}
          />
        ))}
      </div>

      {/* Expense distribution pie - Hidden on mobile */}
      <div className={dashboardStyles.pieChartContainer}>
        <div className={dashboardStyles.pieChartHeader}>
          <h3 className={dashboardStyles.pieChartTitle}>
            <PieChartIcon className="w-6 h-6 text-teal-500" />
            Expense Distribution
            <span className={dashboardStyles.listSubtitle}>
              {' '}
              ({timeFrameRange.label})
            </span>
          </h3>
        </div>

        <div className={dashboardStyles.pieChartHeight}>
          {financialOverviewData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-center">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  No expense data for {timeFrameRange.label.toLowerCase()}.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Add an expense to see the distribution.
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart className={chartStyles.pieChart}>
                <Pie
                  data={financialOverviewData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${Math.round(percent * 100)}%`
                  }
                  labelLine={false}
                >
                  {financialOverviewData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={value => [
                    formatBDT(Math.round(value), {
                      digits: prefs.digits,
                      maximumFractionDigits: 0,
                    }),
                    'Amount',
                  ]}
                  contentStyle={dashboardStyles.tooltipContent}
                  itemStyle={dashboardStyles.tooltipItem}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={v => (
                    <span className={dashboardStyles.legendText}>{v}</span>
                  )}
                  iconSize={10}
                  iconType="circle"
                  wrapperStyle={dashboardStyles.legendWrapper}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className={dashboardStyles.listsGrid}>
        {/* Income Column */}
        <div className={dashboardStyles.listContainer}>
          <div className={dashboardStyles.listHeader}>
            <h3 className={dashboardStyles.listTitle}>
              <ProfitIcon className="w-6 h-6 text-green-500" /> Recent Income{' '}
              <span className={dashboardStyles.listSubtitle}>
                {' '}
                ({timeFrameRange.label})
              </span>
            </h3>
            <span className={dashboardStyles.incomeCountBadge}>
              {incomeListForDisplay.length} records
            </span>
          </div>

          <div className={dashboardStyles.transactionList}>
            {displayedIncome.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                isEditing={editingId === transaction.id}
                editForm={editForm}
                setEditForm={setEditForm}
                onSave={handleEditTransaction}
                onCancel={() => setEditingId(null)}
                onDelete={id => handleDeleteTransaction(id, 'income')}
                type="income"
                categories={['Salary', 'Freelance', 'Investment', 'Bonus', 'Other']}
                categoryIcons={INCOME_CATEGORY_ICONS}
                setEditingId={id => {
                  setEditForm({
                    description: transaction.description ?? '',
                    amount: transaction.amount ?? '',
                    category: transaction.category ?? 'Salary',
                    date: (transaction.date || new Date().toISOString()).slice(0, 10),
                    type: 'income',
                  });
                  setEditingId(id);
                }}
                amountClass="font-bold truncate block text-right"
              />
            ))}

            {incomeListForDisplay.length === 0 && (
              <div className={dashboardStyles.emptyState}>
                <div
                  className={dashboardStyles.emptyIconContainer('bg-green-50')}
                >
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
                <p className={dashboardStyles.emptyText}>
                  No income transactions
                </p>
              </div>
            )}

            {incomeListForDisplay.length > 3 && (
              <div className={dashboardStyles.viewAllContainer}>
                <button
                  onClick={() => setShowAllIncome(!showAllIncome)}
                  className={dashboardStyles.viewAllButton}
                >
                  {showAllIncome ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      View All Income ({incomeListForDisplay.length})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expense Column */}
        <div className={dashboardStyles.listContainer}>
          <div className={dashboardStyles.listHeader}>
            <h3 className="text-lg md:text-xl lg:text-xl xl:text-xl font-bold text-gray-800 md:mt-3 mt-3 flex items-center gap-3">
              <ArrowDown className="w-6 h-6 text-orange-500" /> Recent Expenses{' '}
              <span className={dashboardStyles.listSubtitle}>
                {' '}
                ({timeFrameRange.label})
              </span>
            </h3>
            <span className={dashboardStyles.expenseCountBadge}>
              {expenseListForDisplay.length} records
            </span>
          </div>

          <div className={dashboardStyles.transactionList}>
            {displayedExpense.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                isEditing={editingId === transaction.id}
                editForm={editForm}
                setEditForm={setEditForm}
                onSave={handleEditTransaction}
                onCancel={() => setEditingId(null)}
                onDelete={id => handleDeleteTransaction(id, 'expense')}
                type="expense"
                categories={[
                  'Food',
                  'Housing',
                  'Transport',
                  'Shopping',
                  'Entertainment',
                  'Utilities',
                  'Healthcare',
                  'Other',
                ]}
                categoryIcons={EXPENSE_CATEGORY_ICONS}
                setEditingId={id => {
                  setEditForm({
                    description: transaction.description ?? '',
                    amount: transaction.amount ?? '',
                    category: transaction.category ?? 'Other',
                    date: (transaction.date || new Date().toISOString()).slice(0, 10),
                    type: 'expense',
                  });
                  setEditingId(id);
                }}
                amountClass="font-bold truncate block text-right"
              />
            ))}

            {expenseListForDisplay.length === 0 && (
              <div className={dashboardStyles.emptyState}>
                <div
                  className={dashboardStyles.emptyIconContainer('bg-orange-50')}
                >
                  <ShoppingCart className="w-8 h-8 text-orange-400" />
                </div>
                <p className={dashboardStyles.emptyText}>
                  No expense transactions
                </p>
              </div>
            )}

            {expenseListForDisplay.length > 3 && (
              <div className={dashboardStyles.viewAllContainer}>
                <button
                  onClick={() => setShowAllExpense(!showAllExpense)}
                  className={dashboardStyles.viewAllButton}
                >
                  {showAllExpense ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      View All Expenses ({expenseListForDisplay.length})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddTransactionModal
        showModal={showModal}
        setShowModal={setShowModal}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        handleAddTransaction={handleAddTransaction}
        loading={loading}
        type="both"
        title="Add New Transaction"
        buttonText={loading ? 'Processing...' : 'Add Transaction'}
        categories={[
          'Food',
          'Housing',
          'Transport',
          'Shopping',
          'Entertainment',
          'Utilities',
          'Healthcare',
          'Salary',
          'Freelance',
          'Investment',
          'Bonus',
          'Other',
        ]}
      />
    </div>
  );
};

export default Dashboard;
