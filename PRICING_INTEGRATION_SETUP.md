# Pricing Step Integration Setup Guide

## Overview
A new pricing step has been successfully added to the registration process as Step 4 (between Beneficiaries and Summary). This guide outlines the next steps to complete the integration.

## Current Status ✅
- ✅ Updated registration store with pricing information
- ✅ Created PricingStep.tsx component with Liquid Glass design
- ✅ Updated Register.tsx to include the new step
- ✅ Integrated real-time translation support
- ✅ Added Onepay payment integration (configured for Secure Retire)
- ✅ Created database schema for subscriptions and credits

## Next Steps Required 🔧

### 1. Apply Database Schema
**Priority: HIGH**

Run the SQL migration file `schema-update-subscriptions-credits.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the entire content of `schema-update-subscriptions-credits.sql`
3. Click "Run" to execute the migration
4. Verify the tables were created: `subscriptions` and `credits`

### 2. Enable Supabase Integration in PricingStep
**Priority: HIGH**

After applying the schema, uncomment the database integration code in `src/components/register/PricingStep.tsx`:

- Lines 60-84: Uncomment the subscription saving logic
- Lines 139-148: Uncomment the transaction ID update logic

### 3. Set up Cron Job for Credit Reset
**Priority: MEDIUM**

Set up the monthly credit reset function:

1. Deploy the `reset-monthly-credits` edge function
2. Enable pg_cron extension in Supabase
3. Schedule the cron job as documented in the SQL file

### 4. Configure Onepay Integration
**Priority: HIGH**

The Onepay integration is configured with the provided credentials:
- App ID: `7BXP1189E5F3ECF3C48E9`
- App Token: `bea769fdd80d0be3d45bce3fd4f1b9f05ea16b383418ca77ee`

**Test the payment flow thoroughly in Onepay's sandbox environment before going live.**

### 5. Handle Payment Callbacks
**Priority: MEDIUM**

Create handlers for payment success/failure:
- Success URL: `/register?payment=success`
- Cancel URL: `/register?payment=cancelled`

Consider adding URL parameter handling in the Register component to show appropriate messages.

### 6. Update Summary Step
**Priority: LOW**

Update the Summary component to display the selected pricing plan and payment status.

## Features Included 🎯

### Free Plan
- 100 credits per month
- Basic retirement calculator
- Financial overview dashboard
- Simple beneficiary management
- Email support

### Pro Plan ($20/month)
- Unlimited credits
- Advanced AI retirement advisor
- Comprehensive financial planning
- Professional document generation
- Investment recommendations
- Tax optimization strategies
- Priority customer support
- Advanced beneficiary management
- Portfolio rebalancing alerts
- Custom financial reports

## Design Features 🎨
- Liquid Glass effects with backdrop-blur
- Responsive card layout
- Hover animations and transitions
- Visual selection indicators
- Loading states for payment processing
- Proper dark/light mode support

## Translation Support 🌍
All text content is wrapped with `translateContent()` for real-time translation support across all supported languages.

## Security Notes 🔒
- Onepay credentials are hardcoded for demonstration - consider moving to environment variables in production
- Payment processing includes proper error handling and loading states
- Database operations use RLS policies for user data protection

## Testing Checklist ✅
- [ ] Apply database schema and verify table creation
- [ ] Test Free plan selection and storage
- [ ] Test Pro plan selection and Onepay integration
- [ ] Verify translation functionality
- [ ] Test payment success/failure flows
- [ ] Verify responsive design on mobile/tablet
- [ ] Test navigation between registration steps

## Support
For any issues with the Onepay integration, refer to their API documentation or contact their support team with the provided App ID.