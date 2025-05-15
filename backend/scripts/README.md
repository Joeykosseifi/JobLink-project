# Backend Scripts

This directory contains utility scripts for the JobLink backend.

## Update Existing Users Script

The `updateExistingUsers.js` script adds the default 'free' subscription plan to all existing users in the database who don't have a subscription plan set.

### How to Run

1. Make sure your `.env` file is properly configured with your MongoDB connection string
2. Navigate to the backend directory
3. Run the script with Node:

```bash
node scripts/updateExistingUsers.js
```

### What It Does

- Connects to the MongoDB database
- Finds all users without a `subscriptionPlan` field
- Sets the `subscriptionPlan` to 'free' for each user
- Saves the changes to the database

This script is useful when deploying the subscription plan feature to an existing user base. 