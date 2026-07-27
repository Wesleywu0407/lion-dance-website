import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeInquiry, validateInquiry } from '../supabase/functions/_shared/validation.mjs';

const validInput = {
  name: '王先生',
  phone: '0912345678',
  eventDate: '2026-09-18',
  dateFlexible: false,
  eventCity: '台北市',
  eventType: 'opening',
  services: ['auspicious-lion'],
  message: '上午開幕，希望安排採青流程。',
  consent: true
};

test('accepts a complete inquiry', () => {
  const result = validateInquiry(normalizeInquiry(validInput));
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('requires at least one contact method', () => {
  const result = validateInquiry(normalizeInquiry({ ...validInput, phone: '', lineId: '', email: '' }));
  assert.equal(result.valid, false);
  assert.equal(result.errors.contact, 'required');
});

test('accepts a flexible date without eventDate', () => {
  const result = validateInquiry(normalizeInquiry({ ...validInput, eventDate: '', dateFlexible: true }));
  assert.equal(result.valid, true);
});

test('rejects honeypot content and missing consent', () => {
  const result = validateInquiry(normalizeInquiry({ ...validInput, honeypot: 'bot', consent: false }));
  assert.equal(result.valid, false);
  assert.equal(result.errors.honeypot, 'spam');
  assert.equal(result.errors.consent, 'required');
});

test('normalizes strings and caps service entries', () => {
  const normalized = normalizeInquiry({ ...validInput, name: '  王先生  ', services: Array(20).fill('lion') });
  assert.equal(normalized.name, '王先生');
  assert.equal(normalized.services.length, 12);
});
