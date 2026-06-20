import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendValidationEmail } from '../../lib/email';

describe('Email Library Utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    // Clone env variables
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = originalEnv;
  });

  it('should skip sending and log warning if RESEND_API_KEY is not set', async () => {
    delete process.env.RESEND_API_KEY;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await sendValidationEmail('test@example.com', 'Test User', 'mock-token-123');

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('RESEND_API_KEY not configured'));
    expect(fetch).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('should call Resend API successfully when api key is configured', async () => {
    process.env.RESEND_API_KEY = 're_testkey123';
    process.env.SENDER_EMAIL = 'test-sender@beelink.id';
    process.env.ROOT_DOMAIN = 'beelink.id';

    const mockResponse = { id: 'email_id_123' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await sendValidationEmail('buyer@example.com', 'Buyer Name', 'mock-token-123');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_testkey123',
        'Content-Type': 'application/json'
      },
      body: expect.any(String)
    });

    // Check that body contains correct info
    const callArgs = vi.mocked(fetch).mock.calls[0];
    const requestBody = JSON.parse(callArgs[1]?.body as string);
    expect(requestBody.from).toBe('test-sender@beelink.id');
    expect(requestBody.to).toBe('buyer@example.com');
    expect(requestBody.subject).toBe('Verify Your BeelInk Account 🐝');
    expect(requestBody.html).toContain('Buyer Name');
    expect(requestBody.html).toContain('https://beelink.id/api/auth/verify?token=mock-token-123');
  });

  it('should handle API errors gracefully', async () => {
    process.env.RESEND_API_KEY = 're_testkey123';
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid API key' }),
    } as Response);

    const result = await sendValidationEmail('buyer@example.com', 'Buyer Name', 'mock-token-123');

    expect(result).toEqual({ message: 'Invalid API key' });
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('should retry sending if a transient error (e.g. 500) occurs, and succeed when API responds with 200', async () => {
    process.env.RESEND_API_KEY = 're_testkey123';

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // First attempt fails with 500
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Temporary Server Error' }),
    } as Response);

    // Second attempt fails with 429
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ message: 'Rate Limit Exceeded' }),
    } as Response);

    // Third attempt succeeds with 200
    const mockResponse = { id: 'email_id_retry' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await sendValidationEmail('buyer@example.com', 'Buyer Name', 'mock-token-123');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('successfully on attempt 3'));

    errorSpy.mockRestore();
    logSpy.mockRestore();
  });
});
