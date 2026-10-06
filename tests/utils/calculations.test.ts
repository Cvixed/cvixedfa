import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMonthlyContribution,
  calculateEmergencyFund,
  calculateMonthlyAllocation,
  calculateSavingsRate,
} from '../../src/lib/utils/calculations.ts';

describe('Financial Calculation Logic', () => {
  it('calculates monthly contribution for vehicle tax goal correctly', () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 10);
    futureDate.setDate(futureDate.getDate() + 2);

    const monthlyNeeded = calculateMonthlyContribution(4000000, 0, futureDate);
    assert.equal(monthlyNeeded, 400000);
  });

  it('calculates ideal emergency fund based on expense and dependents', () => {
    const single = calculateEmergencyFund(5000000, false, false);
    assert.equal(single.min, 15000000); // 3x
    assert.equal(single.max, 30000000); // 6x

    const withFamily = calculateEmergencyFund(5000000, true, false);
    assert.equal(withFamily.min, 30000000); // 6x
    assert.equal(withFamily.max, 60000000); // 12x
  });

  it('calculates adjusted 50/30/20 monthly allocation', () => {
    // When emergency fund complete -> 50% needs, 30% wants, 20% savings
    const standard = calculateMonthlyAllocation(10000000, { emergencyFundComplete: true });
    assert.equal(standard.needs, 5000000);
    assert.equal(standard.wants, 3000000);
    assert.equal(standard.savings, 2000000);

    // When building emergency fund -> 50% needs, 20% wants, 30% savings
    const prioritySavings = calculateMonthlyAllocation(10000000, { emergencyFundComplete: false });
    assert.equal(prioritySavings.needs, 5000000);
    assert.equal(prioritySavings.wants, 2000000);
    assert.equal(prioritySavings.savings, 3000000);
  });

  it('calculates savings rate percentage accurately', () => {
    assert.equal(calculateSavingsRate(10000000, 6000000), 40);
    assert.equal(calculateSavingsRate(10000000, 10000000), 0);
    assert.equal(calculateSavingsRate(0, 1000000), 0);
  });
});
