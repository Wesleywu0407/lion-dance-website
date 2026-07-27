const limits = {
  name: 80,
  company: 120,
  phone: 40,
  lineId: 80,
  email: 160,
  eventCity: 120,
  venue: 180,
  eventType: 40,
  budgetRange: 40,
  message: 3000,
  sourcePage: 500,
  referrer: 500
};

const text = (value) => typeof value === 'string' ? value.trim() : '';

export function normalizeInquiry(input = {}) {
  return {
    name: text(input.name),
    company: text(input.company),
    phone: text(input.phone),
    lineId: text(input.lineId),
    email: text(input.email).toLowerCase(),
    preferredContact: text(input.preferredContact),
    eventDate: text(input.eventDate),
    dateFlexible: input.dateFlexible === true,
    eventCity: text(input.eventCity),
    venue: text(input.venue),
    eventType: text(input.eventType),
    services: Array.isArray(input.services) ? input.services.map(text).filter(Boolean).slice(0, 12) : [],
    budgetRange: text(input.budgetRange),
    guestCount: Number.isInteger(input.guestCount) ? input.guestCount : null,
    message: text(input.message),
    sourcePage: text(input.sourcePage),
    referrer: text(input.referrer),
    utm: {
      source: text(input.utm?.source).slice(0, 120),
      medium: text(input.utm?.medium).slice(0, 120),
      campaign: text(input.utm?.campaign).slice(0, 160)
    },
    consent: input.consent === true,
    honeypot: text(input.honeypot),
    turnstileToken: text(input.turnstileToken)
  };
}

export function validateInquiry(value) {
  const errors = {};
  ['name', 'eventCity', 'eventType', 'message'].forEach((field) => {
    if (!value[field]) errors[field] = 'required';
  });

  if (!value.phone && !value.lineId && !value.email) errors.contact = 'required';
  if (!value.eventDate && !value.dateFlexible) errors.eventDate = 'required';
  if (value.eventDate && !/^\d{4}-\d{2}-\d{2}$/.test(value.eventDate)) errors.eventDate = 'invalid';
  if (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) errors.email = 'invalid';
  if (!value.consent) errors.consent = 'required';
  if (value.honeypot) errors.honeypot = 'spam';

  Object.entries(limits).forEach(([field, max]) => {
    if ((value[field] || '').length > max) errors[field] = 'too_long';
  });

  if (value.services.some((service) => service.length > 80)) errors.services = 'too_long';
  return { valid: Object.keys(errors).length === 0, errors };
}
