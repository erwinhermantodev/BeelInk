import { describe, it, expect } from 'vitest';
import { generateShortId } from '../lib/nanoid';
import { getInvoice, saveInvoice } from '../lib/db';

describe('Integration System Check', () => {
  it('ensures the core infrastructure is completely exported', () => {
    expect(generateShortId).toBeDefined();
    expect(getInvoice).toBeDefined();
    expect(saveInvoice).toBeDefined();
  });
});
