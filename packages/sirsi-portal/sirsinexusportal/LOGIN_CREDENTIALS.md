# 🔐 SirsiNexus Investor Login Credentials

## Demo Login Credentials

The investor login page at [https://sirsimaster.github.io/investor-login.html](https://sirsimaster.github.io/investor-login.html) now has functional login with the following demo credentials:

### Available Accounts:

1. **Demo Investor**
   - **Investor ID**: `INV001`
   - **Access Code**: `DEMO2025`
   - **Access Level**: Standard Investor

2. **Beta Investor**
   - **Investor ID**: `INV002`
   - **Access Code**: `BETA2025`
   - **Access Level**: Beta Tester

3. **Administrator**
   - **Investor ID**: `ADMIN`
   - **Access Code**: `ADMIN2025`
   - **Access Level**: Full Access

4. **Guest Access**
   - **Investor ID**: `GUEST`
   - **Access Code**: `GUEST2025`
   - **Access Level**: Limited Access

## How It Works

1. **Login Process**:
   - Enter valid Investor ID and Access Code
   - Click "Access Portal" button
   - System simulates authentication (1.5 second delay)
   - On success: redirects to `investor-portal/index.html`
   - On failure: displays error message

2. **Session Management**:
   - Successful login stores session data in browser's `sessionStorage`
   - Session includes: user ID, name, and login timestamp
   - Session data can be used by the investor portal for personalization

3. **Security Features**:
   - Form validation for required fields
   - Loading states during authentication
   - Error handling for invalid credentials
   - Automatic field clearing on failed attempts

## Features

- ✅ **Functional Authentication**: Real login validation
- ✅ **Error Handling**: Clear error messages for invalid credentials
- ✅ **Loading States**: Visual feedback during login process
- ✅ **Session Management**: Stores user session data
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Dark Mode Support**: Matches site theme
- ✅ **Demo Credentials**: Built-in test accounts for development

## Development Notes

- This is a **client-side demo implementation**
- In production, authentication should be handled server-side
- Credentials are stored in JavaScript for demo purposes only
- For production use, implement proper backend authentication
- Consider adding features like password reset, 2FA, etc.

## Testing

Try logging in with any of the demo credentials above at:
**https://sirsimaster.github.io/investor-login.html**

The login page will redirect to the investor portal on successful authentication.
