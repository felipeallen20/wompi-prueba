import { CARD_BRANDS, detectCardBrand, isCardBrand } from './card-brand.js';

describe('CardBrand', () => {
  it('exposes the supported brands', () => {
    expect(CARD_BRANDS).toEqual(['VISA', 'MASTERCARD', 'UNKNOWN']);
  });

  it.each(CARD_BRANDS)('recognizes %s as a valid brand', (brand) => {
    expect(isCardBrand(brand)).toBe(true);
  });

  it('rejects unknown brands', () => {
    expect(isCardBrand('AMEX')).toBe(false);
  });

  describe('detectCardBrand', () => {
    it('detects Visa from the IIN', () => {
      expect(detectCardBrand('4111111111111111')).toBe('VISA');
    });

    it('detects Mastercard from the 51-55 range', () => {
      expect(detectCardBrand('5500005555555555')).toBe('MASTERCARD');
    });

    it('detects Mastercard from the 2221-2720 range', () => {
      expect(detectCardBrand('2221000000000009')).toBe('MASTERCARD');
    });

    it('returns UNKNOWN for unsupported IINs', () => {
      expect(detectCardBrand('5012345678901234')).toBe('UNKNOWN');
    });

    it('ignores separators in the card number', () => {
      expect(detectCardBrand('4111 1111 1111 1111')).toBe('VISA');
    });
  });
});
