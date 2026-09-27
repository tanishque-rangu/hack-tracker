const routes = [
  '/',
  '/dashboard',
  '/hackathons',
  '/hackathons/sankalp',
  '/hackathons/iqoo',
  '/teams',
  '/teams/team-iqoo-b',
  '/projects',
  '/tasks',
  '/calendar',
  '/submissions',
  '/files',
  '/activity',
  '/settings',
  '/admin',
  '/chat',
  '/login',
  '/signup',
];

async function verify() {
  console.log('Verifying all SquadSync application routes...\n');
  let failures = 0;

  // 1. Verify unauthenticated redirect for protected routes
  try {
    const unauthRoot = await fetch('http://localhost:3000/', { redirect: 'manual' });
    if (unauthRoot.status === 307 || unauthRoot.status === 302) {
      console.log(`[PASS] / (root) redirects unauthenticated visitor -> Status: ${unauthRoot.status} (Redirect to ${unauthRoot.headers.get('location')})`);
    } else {
      console.log(`[FAIL] Expected redirect for /, got: ${unauthRoot.status}`);
      failures++;
    }

    const unauthRes = await fetch('http://localhost:3000/dashboard', { redirect: 'manual' });
    if (unauthRes.status === 307 || unauthRes.status === 302) {
      console.log(`[PASS] /dashboard redirects unauthenticated visitor -> Status: ${unauthRes.status} (Redirect to ${unauthRes.headers.get('location')})`);
    } else {
      console.log(`[FAIL] Expected redirect for /dashboard, got: ${unauthRes.status}`);
      failures++;
    }
  } catch (err) {
    console.log(`[ERROR] Middleware unauth check: ${err.message}`);
    failures++;
  }

  // 2. Verify authenticated access with authorized session cookie
  console.log('\n--- Testing Authenticated Access (Varshini Akula) ---');
  const authHeaders = {
    Cookie: 'squadsync_session=varshiniakula6@gmail.com'
  };

  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`, { headers: authHeaders });
      const text = await res.text();
      if (res.status === 200) {
        console.log(`[PASS] ${route} -> Status: 200 OK (${text.length} bytes)`);
      } else {
        console.log(`[FAIL] ${route} -> Status: ${res.status}`);
        failures++;
      }
    } catch (err) {
      console.log(`[ERROR] ${route} -> ${err.message}`);
      failures++;
    }
  }

  // 3. Verify Admin Route Guarding
  console.log('\n--- Testing Admin Role Route Guarding ---');
  try {
    // Non-admin accessing /admin
    const nonAdminRes = await fetch('http://localhost:3000/admin', {
      headers: { Cookie: 'squadsync_session=varshiniakula6@gmail.com' },
      redirect: 'manual'
    });
    if (nonAdminRes.status === 307 || nonAdminRes.status === 302) {
      console.log(`[PASS] Non-admin redirected from /admin -> Status: ${nonAdminRes.status} (Redirect: ${nonAdminRes.headers.get('location')})`);
    } else {
      console.log(`[FAIL] Expected non-admin redirect, got: ${nonAdminRes.status}`);
      failures++;
    }

    // Admin accessing /admin
    const adminRes = await fetch('http://localhost:3000/admin', {
      headers: { Cookie: 'squadsync_session=koushikkatkam@gmail.com' }
    });
    if (adminRes.status === 200) {
      console.log(`[PASS] Admin (Koushik) granted access to /admin -> Status: 200 OK`);
    } else {
      console.log(`[FAIL] Expected admin 200 OK, got: ${adminRes.status}`);
      failures++;
    }
  } catch (err) {
    console.log(`[ERROR] Admin guard check: ${err.message}`);
    failures++;
  }

  console.log(`\nVerification Complete: All security & route checks executed.`);
  if (failures > 0) process.exit(1);
}

verify();
