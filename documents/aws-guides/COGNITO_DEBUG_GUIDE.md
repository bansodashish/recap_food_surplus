# 🔧 Cognito Integration Troubleshooting Guide

## 🚨 Most Common "Failed to Create Account" Issues:

### 1. **User Pool Client Authentication Flows** (Most Likely Issue)
**Problem**: The Cognito User Pool App Client doesn't have the right authentication flows enabled.

**Solution**: In AWS Console → Cognito → User Pools → `eu-west-1_Y2tRumZ22` → App clients → `1sh3gt6g7eupf69i8c1ht8ang0`:

✅ **Enable these Authentication Flows**:
- `ALLOW_USER_PASSWORD_AUTH` ← **Critical for email/password signup**
- `ALLOW_USER_SRP_AUTH` (recommended)
- `ALLOW_REFRESH_TOKEN_AUTH` (for token refresh)

❌ **Disable**:
- `ALLOW_ADMIN_USER_PASSWORD_AUTH` (server-side only)

### 2. **Password Policy Mismatch**
**Problem**: User password doesn't meet the User Pool policy requirements.

**Current Policy**: Minimum 8 chars, uppercase, lowercase, numbers required
**Test Password**: `TestPass123!` (should work)

### 3. **CORS/Domain Issues** (For Amplify Deployment)
**Problem**: Amplify domain not whitelisted in Cognito.

**Solution**: In App Client Settings:
- **Callback URLs**: Add your Amplify domain (e.g., `https://dev.xxxxx.amplifyapp.com`)
- **Sign out URLs**: Add your Amplify domain
- **OAuth flows**: Enable "Authorization code grant"

### 4. **Network Connectivity**
**Problem**: Can't reach AWS Cognito endpoints.

**Test**: Check browser network tab for failed requests to `cognito-idp.eu-west-1.amazonaws.com`

## 🔍 How to Debug:

1. **Open Browser Console** (F12 → Console)
2. **Try signup** on your deployed site
3. **Look for errors** starting with `❌ Detailed signup error:`
4. **Check the error name**: `UsernameExistsException`, `InvalidPasswordException`, etc.

## 📊 Error Code Meanings:

| Error Name | Meaning | Solution |
|------------|---------|----------|
| `ResourceNotFoundException` | User Pool/Client not found | Check User Pool ID/Client ID |
| `NotAuthorizedException` | Client not allowed to signup | Enable `ALLOW_USER_PASSWORD_AUTH` |
| `InvalidPasswordException` | Password policy violation | Use stronger password |
| `UsernameExistsException` | Email already registered | Try different email |
| `InvalidParameterException` | Invalid email/parameters | Check email format |

## 🛠 Quick Fixes:

### **Most Likely Fix** (90% of cases):
```bash
1. Go to AWS Console → Cognito → User Pools
2. Select: eu-west-1_Y2tRumZ22  
3. Click "App integration" or "App clients"
4. Find client: 1sh3gt6g7eupf69i8c1ht8ang0
5. Edit Authentication flows
6. Enable: ALLOW_USER_PASSWORD_AUTH ✅
7. Save changes
```

### **If still failing** - Check password:
- Must be 8+ characters
- Must have uppercase letter
- Must have lowercase letter  
- Must have number
- Example: `TestPass123!`

## 📞 Support Information:

If none of the above fixes work, the issue is likely:
1. **AWS permissions** - IAM roles for Cognito
2. **User Pool configuration** - Advanced settings
3. **Network/firewall** blocking AWS API calls

**Next Steps**: Run the debug component in your app and check the detailed error logs.
