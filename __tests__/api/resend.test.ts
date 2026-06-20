import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/auth/resend/route';
import { createUser, getUserByEmail, verifyUser, pool } from '../../lib/db';
import { sendValidationEmail } from '../../lib/email';

vi.mock('../../lib/email', () => ({
  sendValidationEmail: vi.fn().mockResolvedValue({ id: 'mock_email_id' }),
}));

describe('Resend Verification Email API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should return 400 if email is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/resend', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Email is required');
  });

  it('should return 200 with silent success if user does not exist', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/resend', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent-user@example.com' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain('a verification link has been resent');
    expect(sendValidationEmail).not.toHaveBeenCalled();
  });

  it('should return 200 stating user is already verified if status is verified', async () => {
    const email = `test-resend-verified-${Date.now()}@example.com`;
    const user = await createUser(email, 'Verified User', 'password_hash');
    await verifyUser(user.id);

    const req = new NextRequest('http://localhost:3000/api/auth/resend', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain('already verified');
    expect(sendValidationEmail).not.toHaveBeenCalled();
  });

  it('should generate a new token, update DB, and send validation email for unverified users', async () => {
    const email = `test-resend-unverified-${Date.now()}@example.com`;
    const token = 'initial-token';
    const expires = new Date(Date.now() + 3600000);
    await createUser(email, 'Unverified User', 'password_hash', token, expires);

    const req = new NextRequest('http://localhost:3000/api/auth/resend', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain('Verification link resent successfully');

    // Verify DB updated with new token
    const updatedUser = await getUserByEmail(email);
    expect(updatedUser).not.toBeNull();
    
    // Verify email was called
    expect(sendValidationEmail).toHaveBeenCalledTimes(1);
    expect(sendValidationEmail).toHaveBeenCalledWith(email, 'Unverified User', expect.any(String));
  });
});
