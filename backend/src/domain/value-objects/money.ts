export type Currency = 'COP' | 'USD';

const DEFAULT_CURRENCY = 'COP';

const INTEGER_MINOR_UNITS_ERROR =
  'Money amount must be an integer number of minor units';
const NEGATIVE_AMOUNT_ERROR = 'Money amount cannot be negative';
const CURRENCY_MISMATCH_ERROR = 'Cannot add money of different currencies';

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency,
  ) {}

  static ofMinorUnits(
    amount: number,
    currency: Currency = DEFAULT_CURRENCY,
  ): Money {
    if (!Number.isInteger(amount)) {
      throw new Error(INTEGER_MINOR_UNITS_ERROR);
    }
    if (amount < 0) {
      throw new Error(NEGATIVE_AMOUNT_ERROR);
    }
    return new Money(amount, currency);
  }

  add(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new Error(CURRENCY_MISMATCH_ERROR);
    }
    return Money.ofMinorUnits(this.amount + other.amount, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
