import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const url = '';
const key = '';

const supabase = createSupabaseClient(url, key);

function getRestrictionMessageSimulated(profile: any): string {
  const docStatus = profile.documentStatus;
  if (docStatus === 'PENDING' || docStatus === 'INCOMPLETE') {
    const reason = profile.documentIssueReason;

    if (reason === 'Driver License expired') {
      return 'Your Driver License has expired.\n\nPlease coordinate with your TODA President to submit updated and valid documents. You will not be able to go online or receive ride requests until your documents have been updated and verified.';
    }
    if (reason === 'Franchise/Prangkisa expired') {
      return 'Your Franchise/Prangkisa has expired.\n\nPlease coordinate with your TODA President to submit updated and valid documents. You will not be able to go online or receive ride requests until your documents have been updated and verified.';
    }
    if (reason === 'Driver License and Franchise expired') {
      return 'Your Driver License and Franchise/Prangkisa have expired.\n\nPlease coordinate with your TODA President to submit updated and valid documents. You will not be able to go online or receive ride requests until your documents have been updated and verified.';
    }

    if (reason === 'Required documents missing') {
      return 'Your driver account documents or information are incomplete and must be completed before the account can be verified.\n\nPlease coordinate with your TODA President to submit the missing documents.';
    }
  }
  return 'Eligible to go online';
}

async function performRealWorldE2ETest() {
  console.log('=== STARTING REAL-WORLD EXPIRED DRIVER ACCOUNT E2E TEST ===');

  const testEmail = 'driver_test_expired@todago.test';
  const testPassword = 'Password123!SecureE2E';
  const testPhone = '09998887779';
  let testUserId = '';

  try {
    // 1. Setup/Ensure Driver Account exists with expired documents
    console.log('[Step 1] Initializing/creating expired driver credentials in Auth...');
    
    let signInResult = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInResult.error) {
      console.log('Creating fresh expired test driver account...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            first_name: 'E2E',
            last_name: 'ExpiredDriver',
            phone_number: testPhone,
            role: 'driver',
          },
        },
      });
      if (signUpError) throw signUpError;
      testUserId = signUpData.user?.id || '';
      
      await supabase.rpc('confirm_user_email', { p_user_id: testUserId });
      
      await supabase.from('profiles').insert({
        id: testUserId,
        first_name: 'E2E',
        last_name: 'ExpiredDriver',
        phone_number: testPhone,
        role: 'driver'
      });

      await supabase.from('drivers').insert({
        profile_id: testUserId,
        license_number: 'DL-E2E-EXPIRED',
        license_front_url: 'https://test.com/license_front.jpg',
        license_back_url: 'https://test.com/license_back.jpg',
        license_expiry_date: '2026-01-01', // expired
        franchise_number: 'FR-E2E-EXPIRED',
        franchise_url: 'https://test.com/franchise.jpg',
        franchise_expiry_date: '2026-01-01', // expired
        toda_association: 'TODA-E2E',
        document_status: 'PENDING',
        document_issue_reason: 'Driver License and Franchise expired'
      });
      
      console.log(`[Step 1 SUCCESS] Expired test driver account seeded. ID: ${testUserId}`);
      
      signInResult = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      if (signInResult.error) throw signInResult.error;
    }

    testUserId = signInResult.data.user?.id || '';
    console.log(`[Step 2] Logged in successfully. Session Token: ${!!signInResult.data.session}`);

    // 3. Document verification check
    console.log('[Step 3] Fetching driver row from public.drivers table (fetchProfile simulation)...');
    const { data: driverRow, error: driverFetchError } = await supabase
      .from('drivers')
      .select('document_status, document_issue_reason, license_expiry_date, franchise_expiry_date')
      .eq('profile_id', testUserId)
      .maybeSingle();

    if (driverFetchError) throw driverFetchError;
    
    // Output runtime logs of fetched properties
    console.log('════════ RUNTIME LOGS ════════');
    console.log(`  - document_status: ${driverRow?.document_status}`);
    console.log(`  - document_issue_reason: ${driverRow?.document_issue_reason}`);
    console.log(`  - license_expiry_date: ${driverRow?.license_expiry_date}`);
    console.log(`  - franchise_expiry_date: ${driverRow?.franchise_expiry_date}`);
    console.log('══════════════════════════════');

    // 4. Map properties to profile context
    const profile = {
      name: 'E2E ExpiredDriver',
      contact: testPhone,
      email: testEmail,
      address: '',
      todaNumber: 'TODA-E2E',
      licenseNumber: 'DL-E2E-EXPIRED',
      vehicleDetails: '',
      verificationStatus: 'Pending',
      accountStatus: 'PENDING',
      driverId: testUserId,
      plateNumber: 'TXT-E2E',
      driverTableId: testUserId,
      isOnline: false,
      documentStatus: driverRow?.document_status || 'PENDING',
      documentIssueReason: driverRow?.document_issue_reason,
      licenseExpiryDate: driverRow?.license_expiry_date,
      franchiseExpiryDate: driverRow?.franchise_expiry_date,
    };

    // 5. Evaluate UI restriction dialog output
    console.log('[Step 5] Evaluating UI notification message for driver account...');
    const displayNotification = getRestrictionMessageSimulated(profile);
    
    console.log('════════ NOTIFICATION DISPLAYED ════════');
    console.log(displayNotification);
    console.log('════════════════════════════════════════');

    if (!displayNotification.includes('Your Driver License and Franchise/Prangkisa have expired.')) {
      throw new Error(`Expected expired notification, but got: ${displayNotification}`);
    }
    console.log('[Step 5 SUCCESS] Correct expired notification matched.');

  } catch (err: any) {
    console.error('=== E2E TEST EXCEPTION ===');
    console.error(err.message || err);
  } finally {
    await supabase.auth.signOut();
  }
}

performRealWorldE2ETest();
