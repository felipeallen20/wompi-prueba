import { Money } from './money.js';

describe('Money', () => {
  it('creates money from an integer amount in minor units', () => {
    const money = Money.ofMinorUnits(45000);

    expect(money.amount).toBe(45000);
    expect(money.currency).toBe('COP');
  });

  it('accepts an explicit currency', () => {
    const money = Money.ofMinorUnits(100, 'USD');

    expect(money.amount).toBe(100);
    expect(money.currency).toBe('USD');
  });

  it('rejects fractional amounts', () => {
    expect(() => Money.ofMinorUnits(45000.5)).toThrow(
      'Money amount must be an integer number of minor units',
    );
  });

  it('rejects negative amounts', () => {
    expect(() => Money.ofMinorUnits(-1)).toThrow(
      'Money amount cannot be negative',
    );
  });

  it('adds money of the same currency', () => {
    const total = Money.ofMinorUnits(45000).add(Money.ofMinorUnits(2000));

    expect(total).toEqual(Money.ofMinorUnits(47000));
  });

  it('rejects adding money of a different currency', () => {
    const cop = Money.ofMinorUnits(45000, 'COP');
    const usd = Money.ofMinorUnits(100, 'USD');

    expect(() => cop.add(usd)).toThrow(
      'Cannot add money of different currencies',
    );
  });

  it('compares money by amount and currency', () => {
    const same = Money.ofMinorUnits(100, 'COP');
    const differentAmount = Money.ofMinorUnits(200, 'COP');
    const differentCurrency = Money.ofMinorUnits(100, 'USD');

    expect(same.equals(Money.ofMinorUnits(100, 'COP'))).toBe(true);
    expect(same.equals(differentAmount)).toBe(false);
    expect(same.equals(differentCurrency)).toBe(false);
  });
});
