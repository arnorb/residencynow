# Habitera Authentication Setup

This project uses [Supabase Authentication](https://supabase.com/docs/guides/auth) for user management. The application is now configured to allow any valid Supabase user to log in.

## Setup Instructions

1. **Enable Email Authentication in Supabase**:
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Providers
   - Enable Email provider
   - Set "Confirm email" to OFF if you want passwordless sign-ins

2. **Create Users**:
   - Go to Authentication > Users
   - Click "Add User"
   - Enter any email address
   - Set a secure password
   - Click "Save"

3. **Set Up Environment Variables**:
   - Ensure the following environment variables are in your `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## How Authentication Works

1. The application uses a React Context (`AuthContext`) to manage authentication state
2. All content is wrapped in a `ProtectedRoute` component that redirects to the login page if not authenticated
3. Authentication is performed using Supabase's authentication methods
4. Any valid user in your Supabase project can log in to the application
5. Login state is persisted using Supabase's session management

## Troubleshooting

If you encounter issues with data not loading after authentication:

1. Check the browser console for authentication-related errors
2. Verify that the authenticated user has the correct database permissions in Supabase
3. Ensure your Row Level Security (RLS) policies are correctly configured
4. Try clearing browser cookies/local storage and logging in again

## Setting Up Row Level Security (RLS)

For proper security, set up RLS policies in Supabase:

1. Go to your Supabase dashboard
2. Navigate to Database > Tables
3. Select a table (e.g., 'buildings' or 'residents')
4. Go to "Auth Policies"
5. Add a policy allowing authenticated users to read/write:

Example policy for SELECT (read):
```sql
CREATE POLICY "Allow authenticated users to read data" 
ON public.buildings 
FOR SELECT 
TO authenticated 
USING (true);
```

Example policy for INSERT/UPDATE (write):
```sql
CREATE POLICY "Allow authenticated users to modify data" 
ON public.buildings 
FOR ALL 
TO authenticated 
USING (true);
```

## Extending Authentication

If you want to implement more advanced authentication features:

1. **Role-Based Access Control**:
   - Create a 'roles' table in your database
   - Assign users to specific roles
   - Modify the AuthContext to fetch and store user roles
   - Implement conditional rendering based on roles

2. **Invitation System**:
   - Implement a system where existing users can invite new users
   - Create an 'invitations' table in your database
   - Set up email templates in Supabase for sending invitations

3. **Social Authentication**:
   - Enable additional authentication providers in Supabase (Google, GitHub, etc.)
   - Update the login UI to include buttons for these providers
   - Example for adding Google login:

```typescript
// Add to your login component
const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  
  if (error) {
    console.error('Google login error:', error);
    setError(error.message);
  }
};
``` 