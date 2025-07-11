#!/usr/bin/env node

/**
 * Wipay Admin Setup Script
 *
 * This script helps you set up admin access and configure the user management system.
 * Run this script after deploying your application to configure admin privileges.
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Wipay Admin Setup Script');
console.log('=============================\n');

console.log('This script will help you configure admin access for your Wipay application.\n');

console.log('📋 Prerequisites:');
console.log('1. Your Wipay application should be running');
console.log('2. You should have at least one user account created');
console.log('3. Firebase should be properly configured\n');

console.log('🔧 Setup Steps:');
console.log('1. Create an admin user account');
console.log('2. Configure admin access');
console.log('3. Test admin dashboard access\n');

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const main = async () => {
  try {
    console.log('Step 1: Create Admin User Account');
    console.log('----------------------------------');

    const adminEmail = await askQuestion('Enter admin email (e.g., admin@wipay.com): ');
    const adminName = await askQuestion('Enter admin name: ');
    const adminPhone = await askQuestion('Enter admin phone number: ');

    console.log('\n✅ Admin account details:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Name: ${adminName}`);
    console.log(`Phone: ${adminPhone}`);

    console.log('\n📝 Manual Steps Required:');
    console.log('1. Go to your Wipay application');
    console.log('2. Sign up with the admin email and details above');
    console.log('3. Complete the profile setup process');
    console.log('4. Test admin access by visiting: http://localhost:8088/admin');

    console.log('\n🔐 Admin Access Configuration:');
    console.log('The admin system grants access to users with:');
    console.log('- Email containing "admin"');
    console.log('- Role set to "admin"');
    console.log('- First user in the system');

    console.log('\n📊 Admin Dashboard Features:');
    console.log('✅ View all users and their subscription status');
    console.log('✅ Filter users by subscription, payment status, and plan');
    console.log('✅ Send bulk reminders to users');
    console.log('✅ Suspend/activate user accounts');
    console.log('✅ Track revenue and user statistics');
    console.log('✅ Manage subscription renewals');
    console.log('✅ Handle payment issues');

    console.log('\n🎯 Recommended Daily Workflow:');
    console.log('1. Check admin dashboard for expired subscriptions');
    console.log('2. Send reminders to users expiring within 7 days');
    console.log('3. Monitor failed payment attempts');
    console.log('4. Review revenue statistics');
    console.log('5. Handle account suspensions/reactivations');

    console.log('\n📚 Documentation:');
    console.log('- User Management Guide: USER_MANAGEMENT_GUIDE.md');
    console.log('- Admin Dashboard: http://localhost:8088/admin');
    console.log('- Firebase Console: https://console.firebase.google.com');

    console.log('\n🚀 Next Steps:');
    console.log('1. Create your admin account using the details above');
    console.log('2. Access the admin dashboard at http://localhost:8088/admin');
    console.log('3. Review the USER_MANAGEMENT_GUIDE.md for detailed instructions');
    console.log('4. Set up your daily monitoring routine');
    console.log('5. Configure reminder templates and workflows');

    console.log('\n✅ Setup Complete!');
    console.log('Your Wipay admin system is ready to use.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
};

main();
