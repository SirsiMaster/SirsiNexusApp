# Demo Scenario 1: User Registration & Authentication

## Objective
Demonstrate user registration, authentication, and role-based access control.

## Steps
1. **Navigate to Application**
   - Access: http://localhost:8080 (or LoadBalancer IP)
   - Show the clean, modern UI

2. **User Registration**
   - Click "Register New User"
   - Fill in details:
     - Name: "Demo User"
     - Email: "demo@library.org"
     - Role: "Librarian"
   - Submit form

3. **Authentication Demo**
   - Login with created credentials
   - Show role-based dashboard
   - Demonstrate different permission levels

4. **Real-time Updates**
   - Show user appears in admin dashboard
   - Demonstrate live user count updates

## Expected Results
- Smooth registration process (< 2 seconds)
- Immediate authentication
- Role-appropriate interface
- Real-time dashboard updates

## Key Points to Highlight
- Security: JWT-based authentication
- Performance: Sub-second response times
- Scalability: Multi-user concurrent access
- UX: Intuitive interface design
