# LifeLogix System Guidelines - Industry Level

## 🔒 Security & Data Integrity Rules (CRITICAL)

### Unique ID Protection - NEVER ALLOW EDITING
* **NEVER allow modification of user uniqueId fields** - These are permanent and immutable for security reasons
* **NEVER allow modification of user id fields** - These are system-critical identifiers
* Always use the `safeUpdateUser` function from `/utils/userSecurity.ts` when updating user data
* All user update functions must validate user integrity using `validateUserIntegrity`
* If user data needs to be updated, only update non-protected fields (name, email, age, weight, height, conditions)

### User Data Security Required Practices
* Use `safeUpdateUser()` function for all user data updates
* Validate user integrity before any data modifications
* Log security warnings when protected fields are accessed inappropriately
* Display clear visual indicators (lock icons) for non-editable fields
* Show security notices to users explaining why certain fields cannot be changed

## 🎨 Design System Guidelines

### Typography & Styling
* Do not output Tailwind classes for font size (text-2xl), font weight (font-bold), or line-height (leading-none) unless specifically requested
* Follow the default typography setup in `styles/globals.css`
* Use consistent spacing and layout patterns
* Implement responsive design by default

### Form Security Indicators
* Use lock icons (`<Lock className="h-4 w-4" />`) for read-only fields
* Add disabled styling (`disabled className="bg-muted/50 cursor-not-allowed"`) for protected inputs
* Include explanatory text for why fields cannot be edited
* Use Alert components to display security notices

### User Interface Rules
* Always show user's uniqueId in badges/chips but never in editable inputs
* Use consistent color coding for different user types (admin vs client)
* Provide clear feedback when operations are blocked for security reasons
* Include helpful tooltips and descriptions for security features

## 🏥 Health Data Guidelines

### Data Privacy & Security
* All health data operations must respect user privacy
* Implement proper data validation before storage
* Provide clear data export options for user data portability
* Show data integrity warnings when appropriate

### Medical Information Display
* Use appropriate icons for different health metrics (Heart, Pill, Activity, etc.)
* Implement consistent formatting for medical data (BP: 120/80, Weight: 70.5 kg)
* Provide clear categorization for health conditions and medications
* Use color coding consistently for health status indicators

## 🔐 Authentication & Authorization

### Admin Panel Security
* Verify admin credentials before allowing access to admin features
* Show clear admin indicators in the UI
* Implement role-based access control
* Log all admin actions appropriately

### User Session Management
* Validate user sessions on app load
* Implement secure logout that clears sensitive data
* Maintain user state securely in localStorage
* Provide clear feedback for authentication state changes

## 📋 Component Guidelines

### Profile Component Rules (CRITICAL)
* **UNIQUE ID FIELD MUST ALWAYS BE DISABLED AND READ-ONLY**
* Show security notice explaining unique ID immutability
* Use `safeUpdateUser` for all profile updates
* Validate data integrity before saving changes
* Provide clear success/error feedback

### Admin Panel Rules
* Display unique IDs as badges/chips, never as editable fields
* Implement proper user management controls
* Show comprehensive system statistics
* Provide data export functionality with proper formatting

## 🛠 Development Best Practices

### Required Imports for User Operations
```typescript
import { safeUpdateUser, validateUserIntegrity } from '../utils/userSecurity';
```

### Code Security Requirements
* Never directly modify user objects without using security utilities
* Always validate data before processing
* Implement proper error handling and user feedback
* Log security events appropriately

---

## ⚠️ CRITICAL REFERENCE: Protected Fields

**NEVER ALLOW EDITING OF THESE FIELDS:**
- `user.uniqueId` - Permanent user identifier (IMMUTABLE)
- `user.id` - System user ID (IMMUTABLE)

**ALWAYS USE:**
- `safeUpdateUser()` for user data updates
- `validateUserIntegrity()` before data operations
- Disabled inputs with lock icons for protected fields
- Security notices explaining field restrictions

## 🔐 Enhanced Security Features (NEW)

### Password Reset & Recovery
* Implement forgot password functionality with secure reset codes
* Use time-limited reset codes (15 minutes expiration)
* Validate reset codes before allowing password changes
* Show password strength indicators during registration/reset
* Never expose actual user passwords in admin panels

### Session Management & Tracking
* Track all user login sessions with timestamps
* Monitor active sessions and user activity
* Log session data for admin analytics (without exposing passwords)
* Implement automatic session cleanup for security
* Show real-time session statistics in admin dashboard

### Industry-Level Authentication
* Multi-step authentication flows (login, register, admin, forgot password)
* Visual password strength validation
* Email format validation
* Secure session storage and management
* Role-based access control with proper admin verification

## 🎨 Enhanced UI/UX Guidelines (NEW)

### Modern Design Patterns
* Use gradient backgrounds for visual depth
* Implement backdrop blur effects for modern glass-morphism
* Add loading states with appropriate animations
* Use proper avatar components with fallbacks
* Implement responsive design with mobile-first approach

### Interactive Elements
* Add hover states and smooth transitions
* Use appropriate icons for all actions
* Implement progress bars for status indicators
* Add badges for user types and status
* Use cards with proper elevation and spacing

### Enhanced Forms & Inputs
* Show/hide password toggle functionality
* Real-time validation feedback
* Password strength meters with color coding
* Proper form error handling and success messages
* Accessibility improvements with proper labels

### Admin Dashboard Features
* Real-time session monitoring
* User health score calculations
* Interactive data tables with search and filtering
* System health status indicators
* Professional data visualization placeholders

**SECURITY IMPLEMENTATION CHECKLIST:**
- [x] Import security utilities
- [x] Use safeUpdateUser for all user updates
- [x] Validate user integrity before operations
- [x] Display lock icons for protected fields
- [x] Show security notices to users
- [x] Use disabled styling for non-editable inputs
- [x] Log security warnings appropriately
- [x] Implement forgot password functionality
- [x] Add session tracking and monitoring
- [x] Create industry-level admin panel
- [x] Enhance UI/UX with modern design patterns
- [x] Add password strength validation
- [x] Implement proper loading states and animations