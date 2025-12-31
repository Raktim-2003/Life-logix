/**
 * User Security Utilities
 * Ensures that critical user data like uniqueId cannot be accidentally modified
 */

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'client' | 'admin';
  uniqueId: string;
  age?: number;
  weight?: number;
  height?: number;
  conditions?: string[];
}

/**
 * Safely updates user data while preserving immutable fields
 * This function ensures that uniqueId and id cannot be modified
 */
export function safeUpdateUser(originalUser: User, updates: Partial<User>): User {
  // Create a copy of updates without protected fields
  const { uniqueId, id, ...safeUpdates } = updates;
  
  // If someone tries to modify protected fields, log a warning
  if (uniqueId && uniqueId !== originalUser.uniqueId) {
    console.warn('⚠️ Attempt to modify uniqueId blocked. UniqueId is immutable.');
  }
  
  if (id && id !== originalUser.id) {
    console.warn('⚠️ Attempt to modify user ID blocked. User ID is immutable.');
  }
  
  // Return user with safe updates only
  return {
    ...originalUser,
    ...safeUpdates
  };
}

/**
 * Validates that a user object has all required immutable fields
 */
export function validateUserIntegrity(user: User): boolean {
  if (!user.uniqueId || typeof user.uniqueId !== 'string' || user.uniqueId.trim().length === 0) {
    console.error('❌ User integrity check failed: uniqueId is missing or invalid');
    return false;
  }
  
  if (!user.id || typeof user.id !== 'string' || user.id.trim().length === 0) {
    console.error('❌ User integrity check failed: id is missing or invalid');
    return false;
  }
  
  return true;
}

/**
 * Generates a unique ID for new users (only used during registration)
 * Format: LL_XXXXX where XXXXX is a random 5-digit string
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `LL_${timestamp}${random}`;
}

/**
 * Checks if a unique ID follows the expected format
 */
export function isValidUniqueIdFormat(uniqueId: string): boolean {
  // Check for standard formats: LL_XXXXX, DEMO_USER_XXX, ADMIN_SYSTEM_XXX
  const patterns = [
    /^LL_[A-Z0-9]{5,8}$/,           // Standard user format
    /^DEMO_USER_\d{3}$/,            // Demo user format
    /^ADMIN_SYSTEM_\d{3}$/          // Admin user format
  ];
  
  return patterns.some(pattern => pattern.test(uniqueId));
}