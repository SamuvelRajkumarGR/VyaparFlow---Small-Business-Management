const Transaction = require('../models/Transaction');
const { isCreditGivenTransaction } = require('../utils/transactionClassification');

const SALES_TERMS = /\b(?:sales?|revenue|turnover)\b|விற்பனை|வருவாய்/iu;
const EXPENSE_TERMS = /\b(?:expenses?|spend|spending|costs?)\b|செலவு|செலவுகள்|செலவினம்/iu;
const PROFIT_TERMS = /\b(?:profit|profits|earnings|margin|income)\b|லாபம்|இலாபம்/iu;
const DATA_TERMS = /\b(?:sales?|revenue|turnover|expenses?|spend|spending|costs?|profit|profits|earnings|margin|income|transaction|transactions|invoice|invoices|customer|customers|inventory|stock|payment|payments|supplier|suppliers|budget|goal|goals|performance|stats?|summary|overview|insights?)\b|விற்பனை|வருவாய்|செலவு|செலவுகள்|செலவினம்|லாபம்|இலாபம்|பரிவர்த்தனை|விலைப்பட்டியல்|வாடிக்கையாளர்|சரக்கு|கட்டணம்|பட்ஜெட்|இலக்கு|சுருக்கம்|நிலைமை/iu;
const SAMPLE_TERMS = /\b(?:sample|fictional|demo)\b/i;
const GENERAL_ADVICE_TERMS = /\b(?:how can|how do i|how to|ways?\s+(?:to|a|an|for)|tips?|ideas?|strateg(?:y|ies)|recommendations?|what should i do)\b/i;
const PERSONAL_DATA_TERMS = /\b(?:my|our|account|records?|data|transactions?)\b|என்|எனது|எங்கள்|நமது|எனது தரவு|என் பதிவுகள்/iu;
const FINANCIAL_VALUE_TERMS = /\b(?:sales?|revenue|expenses?|profit|income)\s*(?:are|is|was|were|of|=|:)?\s*(?:₹|\$|INR|USD)?\s*\d/i;
const PERIOD_TERMS = /\b(?:today|yesterday|this month|current month|last month|previous month|this year|last year|all time|year to date)\b|\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b|இன்று|நேற்று|இந்த மாதம்|இம்மாதம்|கடந்த மாதம்|முந்தைய மாதம்|இந்த ஆண்டு|இந்த வருடம்|கடந்த ஆண்டு|இதுவரை/iu;
const QUESTION_TERMS = /\b(?:how much|what (?:is|are|was|were)|show|give me|tell me|list|compare|break down|calculate|summari[sz]e)\b|எவ்வளவு|என்ன|காட்டு|கூறு|ஒப்பிட|பிரித்து|சுருக்கம்/iu;
const COMPARISON_TERMS = /\b(?:compare|comparison|versus|vs\.?|growth|increase|decrease|change|trend)\b|ஒப்பிட|மாற்றம்|வளர்ச்சி|அதிகரிப்பு|குறைவு/iu;
const BREAKDOWN_TERMS = /\b(?:breakdown|category|categories|biggest|largest|highest|most|top)\b|பிரிவு|வகை|மிகப்பெரிய|அதிகமான|அதிக செலவு/iu;
const UNSUPPORTED_DETAIL_TERMS = /\b(?:goal|goals|customer|customers|invoice|invoices|supplier|suppliers|inventory|product|products|order|orders|payment|payments)\b|இலக்கு|வாடிக்கையாளர்|விலைப்பட்டியல்|சரக்கு|கட்டணம்/iu;
const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

const isBusinessDataQuestion = (message) => {
  const hasPersonalData = PERSONAL_DATA_TERMS.test(message);
  const hasFinancialValue = FINANCIAL_VALUE_TERMS.test(message);
  if ((SAMPLE_TERMS.test(message) && !hasPersonalData && !hasFinancialValue) || !DATA_TERMS.test(message)) return false;
  if (GENERAL_ADVICE_TERMS.test(message) && !hasPersonalData && !hasFinancialValue) return false;

  return PERSONAL_DATA_TERMS.test(message)
    || hasFinancialValue
    || PERIOD_TERMS.test(message)
    || QUESTION_TERMS.test(message)
    || COMPARISON_TERMS.test(message)
    || BREAKDOWN_TERMS.test(message);
};

const makeMonthPeriod = (year, month, kind = 'month') => ({
  kind,
  start: new Date(year, month, 1),
  end: new Date(year, month + 1, 1),
  year,
  month,
});

const getRequestedPeriod = (message, now) => {
  if (/\btoday\b|இன்று/iu.test(message)) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { kind: 'today', start, end };
  }
  if (/\byesterday\b|நேற்று/iu.test(message)) {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(end);
    start.setDate(start.getDate() - 1);
    return { kind: 'yesterday', start, end };
  }
  if (/\b(?:this month|current month)\b|இந்த மாதம்|இம்மாதம்/iu.test(message)) {
    return makeMonthPeriod(now.getFullYear(), now.getMonth(), 'current-month');
  }
  if (/\b(?:last month|previous month)\b|கடந்த மாதம்|முந்தைய மாதம்/iu.test(message)) {
    return makeMonthPeriod(now.getFullYear(), now.getMonth() - 1, 'last-month');
  }
  if (/\bthis year\b|இந்த ஆண்டு|இந்த வருடம்/iu.test(message)) {
    return {
      kind: 'current-year',
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear() + 1, 0, 1),
      year: now.getFullYear(),
    };
  }
  if (/\blast year\b|கடந்த ஆண்டு/iu.test(message)) {
    return {
      kind: 'last-year',
      start: new Date(now.getFullYear() - 1, 0, 1),
      end: new Date(now.getFullYear(), 0, 1),
      year: now.getFullYear() - 1,
    };
  }

  const monthMatches = [...message.matchAll(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi)];
  if (monthMatches.length) {
    const month = MONTH_NAMES.indexOf(monthMatches[monthMatches.length - 1][1].toLowerCase());
    const year = Number(message.match(/\b20\d{2}\b/)?.[0]) || now.getFullYear();
    return makeMonthPeriod(year, month);
  }

  const year = Number(message.match(/\b20\d{2}\b/)?.[0]);
  if (year) {
    return {
      kind: 'year',
      start: new Date(year, 0, 1),
      end: new Date(year + 1, 0, 1),
      year,
    };
  }

  return { kind: 'all-time' };
};

const getComparisonPeriods = (message, now) => {
  const monthMatches = [...message.matchAll(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi)];
  const explicitYear = Number(message.match(/\b20\d{2}\b/)?.[0]);

  if (monthMatches.length >= 2) {
    return monthMatches.slice(-2).map((match) => (
      makeMonthPeriod(
        explicitYear || now.getFullYear(),
        MONTH_NAMES.indexOf(match[1].toLowerCase()),
      )
    ));
  }

  if (monthMatches.length === 1) {
    const month = MONTH_NAMES.indexOf(monthMatches[0][1].toLowerCase());
    const period = makeMonthPeriod(explicitYear || now.getFullYear(), month);
    return [period, makeMonthPeriod(period.year, period.month - 1)];
  }

  return [
    makeMonthPeriod(now.getFullYear(), now.getMonth(), 'current-month'),
    makeMonthPeriod(now.getFullYear(), now.getMonth() - 1, 'last-month'),
  ];
};

const getPeriodLabel = (period, isTamil) => {
  if (isTamil) {
    if (period.kind === 'all-time') return 'முழு பதிவுக் காலத்தில்';
    if (period.kind === 'today') return 'இன்று';
    if (period.kind === 'yesterday') return 'நேற்று';
    if (period.kind === 'current-month') return 'இந்த மாதம்';
    if (period.kind === 'last-month') return 'கடந்த மாதம்';
    if (period.kind === 'current-year') return 'இந்த ஆண்டு';
    if (period.kind === 'last-year') return 'கடந்த ஆண்டு';
    return new Date(period.year, period.month, 1)
      .toLocaleDateString('ta-IN', { month: 'long', year: 'numeric' });
  }

  if (period.kind === 'all-time') return 'all time';
  if (period.kind === 'today') return 'today';
  if (period.kind === 'yesterday') return 'yesterday';
  if (period.kind === 'current-month') return 'this month';
  if (period.kind === 'last-month') return 'last month';
  if (period.kind === 'current-year') return 'this year';
  if (period.kind === 'last-year') return 'last year';
  return new Date(period.year, period.month, 1)
    .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

const getMetrics = async (ownerId, period) => {
  const query = { owner: ownerId };
  if (period.start && period.end) query.date = { $gte: period.start, $lt: period.end };

  const transactions = await Transaction.find(query)
    .select('type amount category isCreditGiven description')
    .lean();
  const metrics = { sales: 0, expenses: 0, expenseCategories: {} };

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount) || 0;
    if (transaction.type === 'sale' && !isCreditGivenTransaction(transaction)) {
      metrics.sales += amount;
    } else if (transaction.type === 'expense') {
      metrics.expenses += amount;
      const category = transaction.category || 'other';
      metrics.expenseCategories[category] = (metrics.expenseCategories[category] || 0) + amount;
    }
  });

  metrics.profit = metrics.sales - metrics.expenses;
  metrics.profitMargin = metrics.sales > 0 ? (metrics.profit / metrics.sales) * 100 : 0;
  return metrics;
};

const formatMoney = (amount, currency, isTamil) => {
  const value = new Intl.NumberFormat(isTamil ? 'ta-IN' : 'en-IN', {
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return amount < 0 ? `-${currency}${value}` : `${currency}${value}`;
};

const getCategoryName = (category, isTamil) => {
  const names = isTamil
    ? { stock: 'சரக்கு வாங்குதல்', rent: 'வாடகை', bills: 'கட்டணங்கள்', salaries: 'சம்பளம்', other: 'மற்றவை' }
    : { stock: 'Stock', rent: 'Rent', bills: 'Bills', salaries: 'Salaries', other: 'Other' };
  return names[category] || category;
};

const formatMetricLine = (metric, metrics, currency, isTamil) => {
  if (metric === 'sales') {
    return isTamil
      ? `விற்பனை: ${formatMoney(metrics.sales, currency, true)}`
      : `Sales: ${formatMoney(metrics.sales, currency, false)}`;
  }
  if (metric === 'expenses') {
    return isTamil
      ? `செலவுகள்: ${formatMoney(metrics.expenses, currency, true)}`
      : `Expenses: ${formatMoney(metrics.expenses, currency, false)}`;
  }
  return isTamil
    ? `நிகர லாபம்: ${formatMoney(metrics.profit, currency, true)} (லாப வரம்பு ${metrics.profitMargin.toFixed(1)}%)`
    : `Net profit: ${formatMoney(metrics.profit, currency, false)} (profit margin ${metrics.profitMargin.toFixed(1)}%)`;
};

const buildLocalAnswer = async ({ message, ownerId, currency = '₹', now = new Date() }) => {
  if (!isBusinessDataQuestion(message)) return null;

  const isTamil = /[\u0B80-\u0BFF]/.test(message);
  const isComparison = COMPARISON_TERMS.test(message);
  const asksBreakdown = BREAKDOWN_TERMS.test(message) && EXPENSE_TERMS.test(message);
  const asksSummary = /\b(?:stats?|summary|overview|performance|insight|insights)\b|சுருக்கம்|நிலைமை|வணிக நிலை/iu.test(message);
  const asksSales = SALES_TERMS.test(message);
  const asksExpenses = EXPENSE_TERMS.test(message);
  const asksProfit = PROFIT_TERMS.test(message);
  const period = getRequestedPeriod(message, now);

  if (UNSUPPORTED_DETAIL_TERMS.test(message)) {
    return isTamil
      ? 'இலக்குகள், வாடிக்கையாளர், விலைப்பட்டியல் மற்றும் தனிப்பட்ட பரிவர்த்தனை விவரங்கள் இன்னும் chat-ல் கிடைக்கவில்லை. விற்பனை, செலவு, லாபம் மற்றும் செலவு வகைப் பிரிவுகளை கேட்கலாம்.'
      : 'Goal tracking, customer, invoice, inventory, payment, and individual transaction details are not available in chat yet. You can ask about sales, expenses, profit, and expense categories.';
  }

  if (!asksBreakdown && !asksSummary && !asksSales && !asksExpenses && !asksProfit) {
    return isTamil
      ? 'தற்போது, விற்பனை, செலவுகள், லாபம், மாத ஒப்பீடு மற்றும் செலவு வகைப் பிரிவுகளை மட்டுமே பார்க்க முடியும். இலக்கு, வாடிக்கையாளர் அல்லது பரிவர்த்தனை விவரங்கள் இன்னும் கிடைக்கவில்லை.'
      : 'I can currently answer questions about sales, expenses, profit, month comparisons, and expense categories. Goal, customer, and individual transaction details are not available in chat yet.';
  }

  if (isComparison) {
    const [currentPeriod, previousPeriod] = getComparisonPeriods(message, now);
    const [current, previous] = await Promise.all([
      getMetrics(ownerId, currentPeriod),
      getMetrics(ownerId, previousPeriod),
    ]);
    const metrics = [
      ...(asksSales ? ['sales'] : []),
      ...(asksExpenses ? ['expenses'] : []),
      ...(asksProfit ? ['profit'] : []),
    ];
    if (!metrics.length) metrics.push('sales', 'expenses', 'profit');

    const currentLabel = getPeriodLabel(currentPeriod, isTamil);
    const previousLabel = getPeriodLabel(previousPeriod, isTamil);
    const lines = metrics.map((metric) => {
      const currentValue = current[metric];
      const previousValue = previous[metric];
      const change = currentValue - previousValue;
      const changeText = previousValue
        ? ` (${change >= 0 ? '+' : ''}${((change / Math.abs(previousValue)) * 100).toFixed(1)}%)`
        : '';
      return isTamil
        ? `${metric === 'sales' ? 'விற்பனை' : metric === 'expenses' ? 'செலவுகள்' : 'நிகர லாபம்'}: ${currentLabel} ${formatMoney(currentValue, currency, true)}, ${previousLabel} ${formatMoney(previousValue, currency, true)}${changeText}`
        : `${metric === 'sales' ? 'Sales' : metric === 'expenses' ? 'Expenses' : 'Net profit'}: ${currentLabel} ${formatMoney(currentValue, currency, false)}, ${previousLabel} ${formatMoney(previousValue, currency, false)}${changeText}`;
    });

    return isTamil
      ? `மாத ஒப்பீடு:\n${lines.map((line) => `- ${line}`).join('\n')}`
      : `Month comparison:\n${lines.map((line) => `- ${line}`).join('\n')}`;
  }

  const metrics = await getMetrics(ownerId, period);
  const periodLabel = getPeriodLabel(period, isTamil);
  const hasData = metrics.sales > 0 || metrics.expenses > 0;
  if (!hasData) {
    return isTamil
      ? `${periodLabel} பரிவர்த்தனைகள் எதுவும் கிடைக்கவில்லை.`
      : `I couldn't find any transactions for ${periodLabel}.`;
  }

  if (asksBreakdown) {
    const categories = Object.entries(metrics.expenseCategories)
      .sort(([, amountA], [, amountB]) => amountB - amountA);
    if (!categories.length) {
      return isTamil
        ? `${periodLabel} செலவு பதிவுகள் எதுவும் இல்லை.`
        : `There are no expense records for ${periodLabel}.`;
    }
    const lines = categories.map(([category, amount]) => (
      `- ${getCategoryName(category, isTamil)}: ${formatMoney(amount, currency, isTamil)}`
    ));
    return isTamil
      ? `${periodLabel} செலவு வகைப் பிரிவு:\n${lines.join('\n')}`
      : `Expense breakdown for ${periodLabel}:\n${lines.join('\n')}`;
  }

  const selectedMetrics = [
    ...(asksSales ? ['sales'] : []),
    ...(asksExpenses ? ['expenses'] : []),
    ...(asksProfit ? ['profit'] : []),
  ];
  if (asksSummary || selectedMetrics.length !== 1) {
    selectedMetrics.splice(0, selectedMetrics.length, 'sales', 'expenses', 'profit');
  }

  const lines = selectedMetrics.map((metric) => (
    `- ${formatMetricLine(metric, metrics, currency, isTamil)}`
  ));
  if (isTamil) {
    if (selectedMetrics.length === 1 && !asksSummary) {
      const metricLabel = selectedMetrics[0] === 'sales'
        ? 'விற்பனை'
        : selectedMetrics[0] === 'expenses' ? 'செலவுகள்' : 'நிகர லாபம்';
      return `${periodLabel} உங்கள் ${metricLabel}:\n${lines.join('\n')}`;
    }
    return period.kind === 'all-time'
      ? `உங்கள் முழு பதிவுக் கால வணிகச் சுருக்கம்:\n${lines.join('\n')}`
      : `${periodLabel} உங்கள் வணிகச் சுருக்கம்:\n${lines.join('\n')}`;
  }
  if (selectedMetrics.length === 1 && !asksSummary) {
    const metricLabel = selectedMetrics[0] === 'sales'
      ? 'sales'
      : selectedMetrics[0] === 'expenses' ? 'expenses' : 'net profit';
    return `Your ${metricLabel} for ${periodLabel}:\n${lines.join('\n')}`;
  }
  return period.kind === 'all-time'
    ? `Your all-time business summary:\n${lines.join('\n')}`
    : `Your business summary for ${periodLabel}:\n${lines.join('\n')}`;
};

module.exports = { buildLocalAnswer, isBusinessDataQuestion };
