const LEGACY_CREDIT_GIVEN_PREFIX = 'Udhar (Credit) given to ';

const isCreditGivenTransaction = (transaction) => (
  transaction.isCreditGiven === true ||
  String(transaction.description || '').startsWith(LEGACY_CREDIT_GIVEN_PREFIX)
);

module.exports = { isCreditGivenTransaction };
