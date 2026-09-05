export const CARD_BRANDS = ['VISA', 'MASTERCARD', 'UNKNOWN'] as const;

export type CardBrand = (typeof CARD_BRANDS)[number];

const VISA_IIN_PREFIX = '4';

const MASTERCARD_TWO_DIGIT_RANGE = { min: 51, max: 55 } as const;
const MASTERCARD_FOUR_DIGIT_RANGE = { min: 2221, max: 2720 } as const;

type DigitRange = { readonly min: number; readonly max: number };

export function isCardBrand(value: unknown): value is CardBrand {
  return CARD_BRANDS.includes(value as CardBrand);
}

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.startsWith(VISA_IIN_PREFIX)) {
    return 'VISA';
  }

  if (
    inRange(Number(digits.slice(0, 2)), MASTERCARD_TWO_DIGIT_RANGE) ||
    inRange(Number(digits.slice(0, 4)), MASTERCARD_FOUR_DIGIT_RANGE)
  ) {
    return 'MASTERCARD';
  }

  return 'UNKNOWN';
}

function inRange(value: number, range: DigitRange): boolean {
  return value >= range.min && value <= range.max;
}
