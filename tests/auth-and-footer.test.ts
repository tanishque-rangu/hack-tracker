(process.env as any).NODE_ENV = 'test';

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { isEmailAuthorized, getAllowedUserConfig, ALLOWED_TEAM_CONFIG } from '../src/lib/auth/allowed-users';
import { sendEmailOtp, verifyEmailOtp, canViewDeveloperFooter } from '../src/lib/auth/auth-service';
import { UserProfile } from '../src/lib/types';
import { INITIAL_MEMBERS } from '../src/lib/seed/seed-data';

describe('Auth & Authorization: Email OTP Flow', () => {
  it('1. Authorized team emails can successfully request an OTP', async () => {
    // Test all 6 core team emails + tester email
    const authorizedEmails = [
      'koushikkatkam@gmail.com',
      'pidugushivaram@gmail.com',
      'varshiniakula6@gmail.com',
      'nivedankatkam@gmail.com',
      'tanishque1959@gmail.com',
      'nagavellivyshnavi3@gmail.com',
      'nothingonlyforsaving@gmail.com',
    ];

    for (const email of authorizedEmails) {
      assert.equal(isEmailAuthorized(email), true, `Expected ${email} to be authorized`);
      const result = await sendEmailOtp(email);
      assert.equal(result.success, true, `Failed to send OTP for ${email}: ${result.message}`);
      assert.ok(result.devCode, 'Expected dev OTP code to be generated');
    }
  });

  it('2. Invalid emails are strictly rejected', async () => {
    const invalidEmails = [
      'not-an-email',
      '@missinguser.com',
      'user@missingtld',
      'spaces in email@gmail.com',
    ];

    for (const email of invalidEmails) {
      assert.equal(isEmailAuthorized(email), false, `Expected ${email} to be rejected`);
      const result = await sendEmailOtp(email);
      assert.equal(result.success, false, `Expected request to fail for invalid email ${email}`);
    }
  });

  it('Case-insensitive email handling', async () => {
    assert.equal(isEmailAuthorized('KOUSHIKKATKAM@GMAIL.COM'), true);
    assert.equal(isEmailAuthorized('VarshiniAkula6@Gmail.Com'), true);
    assert.equal(isEmailAuthorized('  tanishque1959@gmail.com  '), true);

    const res = await sendEmailOtp('VARSHINIAKULA6@GMAIL.COM');
    assert.equal(res.success, true);
  });

  it('3. Valid OTP authenticates the user and creates/returns user profile', async () => {
    const email = 'varshiniakula6@gmail.com';
    const sendRes = await sendEmailOtp(email);
    assert.equal(sendRes.success, true);

    const otp = sendRes.devCode!;
    const verifyRes = await verifyEmailOtp(email, otp);

    assert.equal(verifyRes.success, true);
    assert.ok(verifyRes.user, 'Expected user profile to be returned');
    assert.equal(verifyRes.user.email, email);
    assert.equal(verifyRes.user.footer_visible, true);
  });

  it('4. Invalid OTP displays an error and rejects authentication', async () => {
    const email = 'koushikkatkam@gmail.com';
    await sendEmailOtp(email);

    const wrongOtp = '000000';
    const verifyRes = await verifyEmailOtp(email, wrongOtp);

    assert.equal(verifyRes.success, false);
    assert.ok(verifyRes.message.toLowerCase().includes('incorrect'));
  });
});

describe('Developer Footer: Role-Based Visibility', () => {
  const userKoushik: UserProfile = {
    id: 'user-koushik',
    email: 'koushikkatkam@gmail.com',
    full_name: 'Koushik Katkam',
    role: 'admin',
    footer_visible: false,
  };

  const userShivaram: UserProfile = {
    id: 'user-shivaram',
    email: 'pidugushivaram@gmail.com',
    full_name: 'Shivaram Pidugu',
    role: 'member',
    footer_visible: false,
  };

  const userTanishque: UserProfile = {
    id: 'user-tanishque',
    email: 'tanishque1959@gmail.com',
    full_name: 'Tanishque Rangu',
    role: 'member',
    footer_visible: false,
  };

  const userVarshini: UserProfile = {
    id: 'user-varshini',
    email: 'varshiniakula6@gmail.com',
    full_name: 'Varshini Akula',
    role: 'member',
    footer_visible: true,
  };

  const userNivedan: UserProfile = {
    id: 'user-nivedan',
    email: 'nivedankatkam@gmail.com',
    full_name: 'Nivedan Katkam',
    role: 'coordinator',
    footer_visible: true,
  };

  const userVyshnavi: UserProfile = {
    id: 'user-vyshnavi',
    email: 'nagavellivyshnavi3@gmail.com',
    full_name: 'Vyshnavi Nagavelli',
    role: 'member',
    footer_visible: true,
  };

  const userTester: UserProfile = {
    id: 'user-tester',
    email: 'nothingonlyforsaving@gmail.com',
    full_name: 'Tester Persona',
    role: 'member',
    footer_visible: true,
  };

  it('1. Koushik cannot see footer (HIDDEN)', () => {
    assert.equal(canViewDeveloperFooter(userKoushik), false);
  });

  it('2. Shivaram cannot see footer (HIDDEN)', () => {
    assert.equal(canViewDeveloperFooter(userShivaram), false);
  });

  it('3. Tanishque cannot see footer (HIDDEN)', () => {
    assert.equal(canViewDeveloperFooter(userTanishque), false);
  });

  it('4. Varshini can see footer (VISIBLE)', () => {
    assert.equal(canViewDeveloperFooter(userVarshini), true);
  });

  it('5. Nivedan can see footer (VISIBLE)', () => {
    assert.equal(canViewDeveloperFooter(userNivedan), true);
  });

  it('6. Vyshnavi can see footer (VISIBLE)', () => {
    assert.equal(canViewDeveloperFooter(userVyshnavi), true);
  });

  it('7. nothingonlyforsaving@gmail.com can see footer (VISIBLE)', () => {
    assert.equal(canViewDeveloperFooter(userTester), true);
  });

  it('8. Unauthenticated / Null users cannot see footer', () => {
    assert.equal(canViewDeveloperFooter(null), false);
    assert.equal(canViewDeveloperFooter(undefined), false);
  });

  it('9. Fallback to ALLOWED_TEAM_CONFIG when footer_visible is not populated on profile', () => {
    const unannotatedVarshini: UserProfile = {
      id: 'var-1',
      email: 'varshiniakula6@gmail.com',
      full_name: 'Varshini',
      role: 'member',
    };
    assert.equal(canViewDeveloperFooter(unannotatedVarshini), true);

    const unannotatedTanishque: UserProfile = {
      id: 'tan-1',
      email: 'tanishque1959@gmail.com',
      full_name: 'Tanishque',
      role: 'member',
    };
    assert.equal(canViewDeveloperFooter(unannotatedTanishque), false);
  });
});
