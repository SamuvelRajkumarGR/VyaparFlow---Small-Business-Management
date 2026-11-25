const assert = require('assert');
const { chat } = require('../controllers/chatController');
const Transaction = require('../models/Transaction');

const invokeChat = async (body, user = { _id: 'owner-test', currency: '₹' }) => {
  const result = {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  await chat({ body, user }, result);
  return result;
};

const runTests = async () => {
  const originalApiKey = process.env.GEMINI_API_KEY;
  const originalFetch = global.fetch;
  const originalTransactionFind = Transaction.find;

  try {
    delete process.env.GEMINI_API_KEY;
    const missingKey = await invokeChat({ message: 'How much is the sample profit?' });
    assert.strictEqual(missingKey.statusCode, 503);
    assert.match(missingKey.payload.message, /not configured/i);

    Transaction.find = () => ({
      select() {
        return this;
      },
      lean: async () => [],
    });
    const generalExpenseAdvice = await invokeChat({
      message: 'What are some general ways a small business can reduce expenses?',
    });
    assert.strictEqual(generalExpenseAdvice.statusCode, 503);
    assert.match(generalExpenseAdvice.payload.message, /not configured/i);

    const sampleTransactions = [
      { type: 'sale', amount: 500, category: 'other', description: 'Cash sale' },
      { type: 'sale', amount: 300, category: 'other', description: 'Udhar (Credit) given to customer', isCreditGiven: true },
      { type: 'expense', amount: 100, category: 'rent', description: 'Shop rent' },
      { type: 'expense', amount: 50, category: 'stock', description: 'Stock purchase' },
    ];
    let capturedQuery;
    let selectedFields;
    Transaction.find = (query) => {
      capturedQuery = query;
      return {
        select(fields) {
          selectedFields = fields;
          return this;
        },
        lean: async () => sampleTransactions,
      };
    };

    const localProfit = await invokeChat({ message: 'What is my total profit?' });
    assert.strictEqual(localProfit.statusCode, 200);
    assert.match(localProfit.payload.answer, /Net profit: ₹350/);
    assert.match(localProfit.payload.answer, /Your net profit for all time/);
    assert.deepStrictEqual(capturedQuery, { owner: 'owner-test' });
    assert.strictEqual(selectedFields, 'type amount category isCreditGiven description');

    const localStats = await invokeChat({ message: 'whats my stats' });
    assert.strictEqual(localStats.statusCode, 200);
    assert.match(localStats.payload.answer, /Your all-time business summary/);
    assert.match(localStats.payload.answer, /Sales: ₹500/);
    assert.match(localStats.payload.answer, /Expenses: ₹150/);
    assert.match(localStats.payload.answer, /Net profit: ₹350/);

    const localBreakdown = await invokeChat({ message: 'What was my biggest expense?' });
    assert.strictEqual(localBreakdown.statusCode, 200);
    assert.match(localBreakdown.payload.answer, /Rent: ₹100[\s\S]*Stock: ₹50/);

    const currentMonthSales = await invokeChat({ message: 'What are my sales this month?' });
    assert.strictEqual(currentMonthSales.statusCode, 200);
    assert.strictEqual(capturedQuery.owner, 'owner-test');
    assert.ok(capturedQuery.date.$gte instanceof Date);
    assert.ok(capturedQuery.date.$lt instanceof Date);
    assert.strictEqual(capturedQuery.date.$gte.getDate(), 1);

    const todayExpenses = await invokeChat({ message: 'இன்று நான் எவ்வளவு செலவு செய்தேன்?' });
    assert.strictEqual(todayExpenses.statusCode, 200);
    assert.match(todayExpenses.payload.answer, /இன்று உங்கள் செலவுகள்/);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    assert.strictEqual(capturedQuery.date.$gte.getTime(), todayStart.getTime());
    assert.strictEqual(capturedQuery.date.$lt.getTime(), tomorrowStart.getTime());

    const tamilProfit = await invokeChat({ message: 'என் மொத்த லாபம் என்ன?' });
    assert.strictEqual(tamilProfit.statusCode, 200);
    assert.match(tamilProfit.payload.answer, /நிகர லாபம்: ₹350/);

    const unsupportedGoal = await invokeChat({ message: 'What is my sales goal?' });
    assert.strictEqual(unsupportedGoal.statusCode, 200);
    assert.match(unsupportedGoal.payload.answer, /Goal tracking.*not available/i);
    Transaction.find = originalTransactionFind;

    process.env.GEMINI_API_KEY = 'test-key';
    const invalidMessage = await invokeChat({ message: '   ' });
    assert.strictEqual(invalidMessage.statusCode, 400);
    const oversizedMessage = await invokeChat({ message: 'x'.repeat(601) });
    assert.strictEqual(oversizedMessage.statusCode, 400);

    let requestOptions;
    global.fetch = async (url, options) => {
      assert.strictEqual(
        url,
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
      );
      requestOptions = options;
      return {
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{ text: 'Sample profit is ₹54,900.' }],
            },
          }],
        }),
      };
    };

    const success = await invokeChat({ message: 'How much is the sample profit?' });
    assert.strictEqual(success.statusCode, 200);
    assert.strictEqual(success.payload.answer, 'Sample profit is ₹54,900.');

    const sentBody = JSON.parse(requestOptions.body);
    assert.strictEqual(sentBody.contents[0].role, 'user');
    assert.strictEqual(sentBody.contents[0].parts[0].text, 'How much is the sample profit?');
    assert.match(sentBody.systemInstruction.parts[0].text, /Fictional sample figures/);
    assert.match(sentBody.systemInstruction.parts[0].text, /answer naturally in Tamil script/i);
    assert.match(sentBody.systemInstruction.parts[0].text, /Never use LaTeX/);
    assert.strictEqual(sentBody.generationConfig.maxOutputTokens, 512);
    assert.strictEqual(requestOptions.headers['x-goog-api-key'], 'test-key');

    let attempts = 0;
    global.fetch = async () => {
      attempts++;
      return { ok: false, status: 503 };
    };
    const unavailable = await invokeChat({ message: 'Can you help?' });
    assert.strictEqual(attempts, 2);
    assert.strictEqual(unavailable.statusCode, 503);
    assert.match(unavailable.payload.message, /temporarily unavailable/i);

    global.fetch = async () => ({
      ok: true,
      json: async () => ({ candidates: [] }),
    });
    const invalidProviderPayload = await invokeChat({ message: 'Can you help?' });
    assert.strictEqual(invalidProviderPayload.statusCode, 502);

    console.log('Chat controller tests passed.');
  } finally {
    if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalApiKey;
    global.fetch = originalFetch;
    Transaction.find = originalTransactionFind;
  }
};

runTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
