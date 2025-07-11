# Wipay User Management Guide

## Overview

As a professional software engineer managing the Wipay application, you now have access to a comprehensive admin dashboard that allows you to manage all users, track subscriptions, send reminders, and handle account issues efficiently.

## Accessing the Admin Dashboard

1. **Navigate to Admin Dashboard**: Go to `http://localhost:8088/admin` in your browser
2. **Admin Access**: Currently, admin access is granted to:
   - Users with email containing "admin"
   - Users with role "admin"
   - The first user in the system

## Key Features

### 1. User Overview & Statistics

The admin dashboard provides real-time statistics:
- **Total Users**: Complete user count
- **Active Subscriptions**: Users with active subscriptions
- **Monthly Revenue**: Current monthly revenue
- **Expired Subscriptions**: Users needing attention

### 2. User Management

#### Viewing All Users
- **Search**: Use the search bar to find specific users by name, email, or phone
- **Filters**: Filter by:
  - Subscription status (active, trialing, past_due, canceled, unpaid)
  - Account status (active, suspended, disabled)
  - Plan type (free, basic, pro, enterprise)

#### User Information Displayed
- **Basic Info**: Name, email, phone number
- **Subscription**: Current plan, status, expiry date
- **Payment Status**: Verification status, failed payment attempts
- **Account Status**: Active, suspended, or disabled
- **Days Until Expiry**: Visual indicators for urgent cases

### 3. Subscription Management

#### Identifying Problem Users

**Users Without Subscriptions:**
```sql
-- Filter by subscription status: "none" or empty
-- These users haven't completed profile setup
```

**Users with Expired Subscriptions:**
```sql
-- Filter by subscription status: "past_due" or "canceled"
-- Check "Days Until Expiry" column for negative values
```

**Users with Failed Payments:**
```sql
-- Look for users with "Failed Payment Attempts" > 0
-- These users need payment method updates
```

### 4. Bulk Operations

#### Selecting Users
- Use checkboxes to select multiple users
- Select all users with the header checkbox
- Clear selection with the "Clear Selection" button

#### Available Bulk Actions

1. **Send Reminders**
   - Send personalized messages to users
   - Useful for subscription renewals
   - Message template: "Hi [Name], your subscription expires on [Date]. Please renew to continue using Wipay services."

2. **Suspend Accounts**
   - Suspend users with expired subscriptions
   - Automatically changes subscription status to "past_due"
   - Use for users who haven't responded to reminders

3. **Activate Accounts**
   - Reactivate suspended accounts
   - Use when users have made payments
   - Resets subscription status to "active"

4. **Reset Payment Attempts**
   - Clear failed payment counters
   - Use when users have updated payment methods
   - Helps users retry payments

### 5. Individual User Actions

#### Send Individual Reminders
- Click the mail icon next to any user
- Enter a personalized message
- Track reminder history

#### Toggle Account Status
- Click the shield icon to suspend/activate accounts
- Immediate status change
- Useful for quick account management

## Professional Management Workflows

### 1. Daily Monitoring Routine

**Morning Check (15 minutes):**
1. Open admin dashboard
2. Review statistics overview
3. Check for new expired subscriptions
4. Send reminders to users expiring within 7 days

**Weekly Review (30 minutes):**
1. Export user data for analysis
2. Review failed payment users
3. Plan bulk actions for the week
4. Update reminder templates

### 2. Subscription Renewal Process

**Step 1: Identify Users Due for Renewal**
- Filter by subscription status: "active" or "trialing"
- Sort by "Days Until Expiry"
- Focus on users with 7 days or less

**Step 2: Send Personalized Reminders**
- Use bulk action "Send Reminder"
- Template: "Hi [Name], your Wipay subscription expires on [Date]. Renew now to avoid service interruption."

**Step 3: Follow Up**
- After 3 days, send second reminder
- After 7 days, suspend account if no response
- Monitor payment attempts

**Step 4: Account Recovery**
- When users make payments, activate accounts
- Reset payment attempt counters
- Send welcome back message

### 3. Payment Issue Resolution

**Identifying Payment Problems:**
- Look for users with "Failed Payment Attempts" > 0
- Check "Payment Status" for unverified accounts
- Review users with "suspended" account status

**Resolution Steps:**
1. **Contact User**: Send reminder about payment issues
2. **Update Payment Method**: Guide users to update MTN MoMo number
3. **Reset Attempts**: Clear failed payment counters
4. **Test Payment**: Verify new payment method works
5. **Activate Account**: Restore service once payment succeeds

### 4. Account Deactivation Strategy

**When to Suspend Accounts:**
- Subscription expired for more than 7 days
- Multiple failed payment attempts (3+)
- No response to reminders
- Suspicious activity

**Suspension Process:**
1. Send final warning (3 days before suspension)
2. Suspend account using bulk action
3. Send suspension notification
4. Monitor for payment attempts
5. Reactivate upon successful payment

## Advanced Features

### 1. Revenue Tracking

The dashboard provides revenue statistics:
- **Total Revenue**: Lifetime revenue
- **Monthly Revenue**: Current month's revenue
- **Average Revenue Per User**: Revenue per active subscription
- **Active Subscriptions**: Number of paying users

### 2. User Analytics

Track user behavior:
- **Last Login**: User activity patterns
- **Token Usage**: Service utilization
- **Payment History**: Payment reliability
- **Plan Changes**: Upgrade/downgrade patterns

### 3. Automated Workflows

**Set up these automated processes:**

1. **Daily Reminder System**
   - Automatically identify users expiring in 7 days
   - Send standardized reminder messages
   - Track reminder delivery

2. **Weekly Suspension Review**
   - Identify accounts suspended for more than 30 days
   - Consider permanent deactivation
   - Archive inactive accounts

3. **Monthly Revenue Reports**
   - Export user data for financial analysis
   - Track subscription growth
   - Identify revenue opportunities

## Best Practices

### 1. Communication Strategy

**Reminder Templates:**
- **7 Days Before**: "Your subscription expires soon. Renew to continue enjoying Wipay services."
- **3 Days Before**: "Urgent: Your subscription expires in 3 days. Please renew immediately."
- **1 Day Before**: "Final reminder: Your subscription expires tomorrow. Renew now to avoid service interruption."

### 2. Data Management

**Regular Backups:**
- Export user data weekly
- Keep payment history records
- Document all admin actions

**Privacy Compliance:**
- Only access user data for legitimate business purposes
- Respect user privacy preferences
- Secure all admin access

### 3. Customer Service

**Response Times:**
- Respond to payment issues within 24 hours
- Process account activations within 2 hours
- Follow up on reminders within 3 days

**Escalation Process:**
1. Automated reminders (first 7 days)
2. Manual follow-up (days 8-14)
3. Account suspension (day 15+)
4. Final warning (day 30)
5. Permanent deactivation (day 60)

## Technical Implementation

### Admin Service Functions

The `adminService` provides these key functions:

```typescript
// Get all users with filters
await adminService.getAllUsers(filters)

// Get users with expired subscriptions
await adminService.getExpiredSubscriptions()

// Get users due for reminders
await adminService.getUsersDueForReminders(7)

// Perform bulk actions
await adminService.performBulkAction({
  userIds: ['user1', 'user2'],
  action: 'send_reminder',
  message: 'Your subscription expires soon'
})

// Send individual reminder
await adminService.sendReminder(userId, message)

// Get statistics
await adminService.getUserStatistics()
await adminService.getRevenueStatistics()
```

### Database Queries

**Find users without subscriptions:**
```javascript
const users = await adminService.getAllUsers({
  hasPaymentProfile: false
})
```

**Find users with failed payments:**
```javascript
const users = await adminService.getFailedPaymentUsers()
```

**Find users expiring soon:**
```javascript
const users = await adminService.getUsersDueForReminders(7)
```

## Security Considerations

### 1. Access Control
- Admin dashboard is protected by role-based access
- Only authorized users can access admin functions
- All admin actions are logged

### 2. Data Protection
- User data is encrypted in transit and at rest
- Payment information is handled securely
- Admin actions are audited

### 3. Backup Strategy
- Regular database backups
- Export critical user data
- Document all administrative actions

## Troubleshooting

### Common Issues

**1. Users can't access admin dashboard:**
- Check if user has admin role
- Verify email contains "admin" or role is "admin"
- Check authentication status

**2. Bulk actions not working:**
- Ensure users are selected
- Check network connectivity
- Verify Firebase permissions

**3. Reminders not sending:**
- Check SMS service configuration
- Verify user phone numbers
- Review reminder message format

### Support Resources

- **Firebase Console**: Monitor database operations
- **Application Logs**: Check for errors
- **User Feedback**: Monitor user complaints
- **Payment Gateway**: Verify transaction status

## Conclusion

This admin dashboard provides you with professional-grade user management capabilities. By following these workflows and best practices, you can effectively manage your Wipay user base, ensure subscription renewals, and maintain high customer satisfaction while maximizing revenue.

Remember to:
- Monitor the dashboard regularly
- Respond to issues promptly
- Maintain clear communication with users
- Keep detailed records of all actions
- Continuously improve processes based on data

The system is designed to scale with your business needs and can be extended with additional features as required.
