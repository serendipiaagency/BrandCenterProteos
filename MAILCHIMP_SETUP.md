# Mailchimp Integration Setup

## Overview
Brand Center is now integrated with Mailchimp to automatically synchronize user data with your Mailchimp list "BrandCenter". This enables automated email marketing campaigns based on user activity and preferences.

## Required Configuration

### 1. Get Mailchimp API Key

1. Log in to your Mailchimp account
2. Go to **Account > Extras > API Keys**
3. Click **Create A Key**
4. Copy the API key (format: `xxxxxxxxxxxxxxxxxxxxx-us1` where `us1` is your server)

### 2. Get Mailchimp List ID

1. Go to **Audience > All contacts**
2. Click **Settings > Audience name and defaults**
3. Find **Audience ID** (also called List ID)
4. Copy the ID (format: `abc123def4`)

### 3. Configure Cloudflare Environment Variables

Run these commands to set up the Mailchimp integration:

```bash
# Set Mailchimp API Key
npx wrangler pages secret put MAILCHIMP_API_KEY --project-name brandcenter-pbserum

# Set Mailchimp List ID
npx wrangler pages secret put MAILCHIMP_LIST_ID --project-name brandcenter-pbserum
```

When prompted, paste the corresponding values from steps 1 and 2.

### 4. Verify Configuration

After setting the secrets, deploy the project:

```bash
npm run deploy
```

## Mailchimp List Setup

### Required Merge Fields

Configure these merge fields in your Mailchimp list:

| Field Name | Mailchimp Tag | Type | Description |
|------------|---------------|------|-------------|
| First Name | FNAME | Text | User's first name |
| Last Name | LNAME | Text | User's last name |
| Role | ROLE | Text | User role (admin, marketing, distributor, agency) |
| Region | REGION | Text | User region (EMEA, LATAM, APAC, etc.) |
| Country | COUNTRY | Text | User country |
| Distributor | DISTRIB | Text | Distributor name (if applicable) |
| Language | LANGUAGE | Text | User language preference (EN, ES, FR, etc.) |

To add merge fields in Mailchimp:
1. Go to **Audience > All contacts > Settings > Audience fields and *|MERGE|* tags**
2. Click **Add A Field**
3. Choose **Text** field type
4. Set the Field label and Tag as shown in table above
5. Repeat for all fields

### Tags

The integration automatically adds these tags to contacts:
- `BrandCenter` - All users from Brand Center
- User's role (e.g., `admin`, `marketing`, `distributor`, `agency`)
- User's region (e.g., `EMEA`, `LATAM`, `APAC`, `GLOBAL`)

## Features

### Automatic Synchronization

Users are automatically synchronized to Mailchimp in these scenarios:

1. **New User Creation** - When admin creates a new user
2. **User Update** - When user information is updated
3. **User Deactivation** - User is unsubscribed from Mailchimp

### Manual Bulk Sync

Admin users can manually sync all active users to Mailchimp:

1. Log in to Brand Center as admin
2. Go to **Admin Panel > Users**
3. Click **Sync to Mailchimp** button
4. Confirm the operation
5. View sync results (success/failed counts)

## Data Mapping

Brand Center → Mailchimp:

```javascript
{
  email_address: user.email,
  status: 'subscribed', // or 'unsubscribed' if inactive
  merge_fields: {
    FNAME: firstName,
    LNAME: lastName,
    ROLE: user.role,
    REGION: user.region,
    COUNTRY: user.country,
    DISTRIB: user.distributor,
    LANGUAGE: user.language
  },
  tags: ['BrandCenter', role, region]
}
```

## Behavior Details

### Subscribe (Create/Update User)

- New users are automatically added to Mailchimp with status `subscribed`
- Existing users are updated with latest information
- Uses PUT method to create or update (idempotent)

### Unsubscribe (Deactivate User)

- When user is deactivated in Brand Center, their status is changed to `unsubscribed` in Mailchimp
- User data remains in Mailchimp but they won't receive emails
- Uses PATCH method to update status

### Duplicate Handling

- Mailchimp uses email as unique identifier
- PUT requests automatically handle duplicates by updating existing records
- No manual duplicate checking needed

## Error Handling

- Mailchimp errors are logged but don't prevent user operations
- Failed syncs are reported in bulk sync results
- Individual sync failures don't affect other users

## Testing

### Local Development

For local testing with `.dev.vars`:

```bash
# .dev.vars
MAILCHIMP_API_KEY=your_api_key_here-us1
MAILCHIMP_LIST_ID=your_list_id_here
```

### Verify Configuration

Check configuration status:

```bash
curl https://brandcenter.pbserum.com/api/mailchimp/status
```

Expected response:
```json
{
  "configured": true,
  "hasApiKey": true,
  "hasListId": true,
  "server": "us1"
}
```

### Test Sync

1. Create a test user in Brand Center
2. Check Mailchimp Audience to verify the contact was added
3. Update the user information
4. Verify changes reflected in Mailchimp
5. Deactivate the user
6. Verify status changed to `unsubscribed` in Mailchimp

## Troubleshooting

### Configuration Not Working

1. Verify secrets are set correctly:
   ```bash
   npx wrangler pages secret list --project-name brandcenter-pbserum
   ```
2. Check API endpoint:
   ```bash
   curl https://brandcenter.pbserum.com/api/mailchimp/status
   ```
3. Review logs in Cloudflare Pages dashboard

### Sync Failures

Common issues:
- Invalid API key or List ID
- Mailchimp API rate limits (10 concurrent requests)
- Invalid merge field data
- Missing merge fields in Mailchimp list

### Rate Limiting

The bulk sync processes users in batches of 10 with 100ms delay between batches to respect Mailchimp API limits.

## API Endpoints

### Check Configuration Status
```
GET /api/mailchimp/status
```

Returns:
```json
{
  "configured": true,
  "hasApiKey": true,
  "hasListId": true,
  "server": "us1"
}
```

### Bulk Sync Users
```
POST /api/users/sync-mailchimp
Authorization: Bearer <admin-token>
```

Returns:
```json
{
  "success": true,
  "total": 94,
  "synced": 94,
  "failed": 0,
  "errors": []
}
```

## Security Notes

- API key is stored as Cloudflare secret (encrypted)
- Only admin users can trigger bulk sync
- User data is transmitted over HTTPS
- Email addresses are hashed for Mailchimp API calls

## Support

For issues or questions:
1. Check Cloudflare Pages logs
2. Review Mailchimp API documentation: https://mailchimp.com/developer/
3. Contact support with error details

## References

- [Mailchimp Marketing API v3](https://mailchimp.com/developer/marketing/api/)
- [Mailchimp Merge Fields](https://mailchimp.com/developer/marketing/docs/merge-fields/)
- [Cloudflare Pages Secrets](https://developers.cloudflare.com/pages/platform/functions/bindings/#environment-variables)
