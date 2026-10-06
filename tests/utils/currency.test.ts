import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatRupiah, parseRupiah, formatCurrencyInput } from '../../src/lib/utils/currency.ts';

describe('Currency Utilities', () => {
  it('formats regular amounts to Indonesian Rupiah standard', () => {
    assert.equal(formatRupiah(1250000), 'Rp 1.250.000');
    assert.equal(formatRupiah(50000), 'Rp 50.000');
    assert.equal(formatRupiah(0), 'Rp 0');
  });

  it('formats compact amounts correctly', () => {
    assert.equal(formatRupiah(1250000, { compact: true }), 'Rp 1,3 jt');
    assert.equal(formatRupiah(4000000, { compact: true }), 'Rp 4 jt');
    assert.equal(formatRupiah(1500000000, { compact: true }), 'Rp 1,5 M');
  });

  it('parses formatted strings back to integer', () => {
    assert.equal(parseRupiah('Rp 1.250.000'), 1250000);
    assert.equal(parseRupiah('1.250.000'), 1250000);
    assert.equal(parseRupiah('50000'), 50000);
  });

  it('formats live typing input with dot separators', () => {
    assert.equal(formatCurrencyInput('1250000'), '1.250.000');
    assert.equal(formatCurrencyInput('5000'), '5.000');
  });
});
