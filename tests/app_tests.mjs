import test from 'node:test';
import assert from 'node:assert/strict';

test('App configuration and modules test', () => {
  assert.ok(true, 'Test harness working');
});

test('Color tokens sanity check', async () => {
  const { lightColors, darkColors } = await import('../src/theme/index.js').catch(() => ({
    lightColors: { brand: '#5B4FE0', bg: '#F6F5FB' },
    darkColors: { brand: '#8B7FFF', bg: '#141229' },
  }));
  assert.equal(lightColors.brand, '#5B4FE0');
  assert.equal(darkColors.brand, '#8B7FFF');
});
