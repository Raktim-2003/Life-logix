/**
 * User Storage System for LifeLogix
 * Handles persistent storage and retrieval of all registered users
 */

interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string; // In production, this would be hashed
  userType: 'client' | 'admin';
  uniqueId: string;
  age?: number;
  weight?: number;
  height?: number;
  conditions?: string[];
  medications?: string[];
  registrationDate: string;
  lastLogin: string;
  profileComplete: boolean;
  healthRecords: number;
  criticalAlerts: number;
  averageBloodPressure?: string;
  averageHeartRate?: number;
  lastHealthEntry?: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface HealthData {
  userId: string;
  date: string;
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  weight?: number;
  bloodSugar?: number;
  notes?: string;
}

interface MedicationData {
  userId: string;
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    active: boolean;
  }>;
}

export class UserStorageManager {
  private static readonly USERS_KEY = 'lifelogix_all_users';
  private static readonly HEALTH_DATA_KEY = 'lifelogix_health_data';
  private static readonly MEDICATION_DATA_KEY = 'lifelogix_medications';

  /**
   * Initialize default admin user if not exists
   */
  static initializeSystem() {
    const users = this.getAllUsers();
    const adminExists = users.some(user => user.userType === 'admin');
    
    if (!adminExists) {
      const defaultAdmin: StoredUser = {
        id: 'admin_system_001',
        email: 'admin@lifelogix.com',
        name: 'System Administrator',
        password: 'LifeLogix@2024',
        userType: 'admin',
        uniqueId: 'ADMIN_SYSTEM_001',
        registrationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        profileComplete: true,
        healthRecords: 0,
        criticalAlerts: 0,
        status: 'active'
      };
      
      this.addUser(defaultAdmin);
    }
  }

  /**
   * Get all registered users
   */
  static getAllUsers(): StoredUser[] {
    try {
      const usersData = localStorage.getItem(this.USERS_KEY);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  /**
   * Get a specific user by email
   */
  static getUserByEmail(email: string): StoredUser | null {
    const users = this.getAllUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Get a specific user by ID
   */
  static getUserById(id: string): StoredUser | null {
    const users = this.getAllUsers();
    return users.find(user => user.id === id) || null;
  }

  /**
   * Add a new user
   */
  static addUser(user: StoredUser): boolean {
    try {
      const users = this.getAllUsers();
      
      // Check if user already exists
      if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        return false; // User already exists
      }
      
      users.push(user);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      return false;
    }
  }

  /**
   * Update an existing user
   */
  static updateUser(userId: string, updates: Partial<StoredUser>): boolean {
    try {
      const users = this.getAllUsers();
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        return false; // User not found
      }
      
      // Prevent updating protected fields
      const { id, uniqueId, registrationDate, ...allowedUpdates } = updates;
      users[userIndex] = { ...users[userIndex], ...allowedUpdates };
      
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  /**
   * Update user's last login time
   */
  static updateLastLogin(userId: string): void {
    this.updateUser(userId, { lastLogin: new Date().toISOString() });
  }

  /**
   * Register a new user
   */
  static registerUser(userData: {
    email: string;
    name: string;
    password: string;
    userType?: 'client' | 'admin';
  }): StoredUser | null {
    try {
      const newUser: StoredUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email,
        name: userData.name,
        password: userData.password, // In production, hash this
        userType: userData.userType || 'client',
        uniqueId: this.generateUniqueId(),
        registrationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        profileComplete: false,
        healthRecords: 0,
        criticalAlerts: 0,
        status: 'active'
      };
      
      const success = this.addUser(newUser);
      return success ? newUser : null;
    } catch (error) {
      console.error('Error registering user:', error);
      return null;
    }
  }

  /**
   * Authenticate a user
   */
  static authenticateUser(email: string, password: string): StoredUser | null {
    const user = this.getUserByEmail(email);
    if (user && user.password === password) {
      this.updateLastLogin(user.id);
      return user;
    }
    return null;
  }

  /**
   * Get user statistics for admin dashboard
   */
  static getUserStats() {
    const users = this.getAllUsers();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      totalUsers: users.length,
      totalClients: users.filter(u => u.userType === 'client').length,
      totalAdmins: users.filter(u => u.userType === 'admin').length,
      activeUsers: users.filter(u => u.status === 'active').length,
      recentLogins: users.filter(u => new Date(u.lastLogin) > oneDayAgo).length,
      newRegistrations: users.filter(u => new Date(u.registrationDate) > oneWeekAgo).length,
      usersWithHealthData: users.filter(u => u.healthRecords > 0).length,
      criticalAlerts: users.reduce((sum, u) => sum + u.criticalAlerts, 0)
    };
  }

  /**
   * Generate a unique user ID
   */
  private static generateUniqueId(): string {
    const prefix = 'LL_USER';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Store health data for a user
   */
  static storeHealthData(userId: string, healthData: Omit<HealthData, 'userId'>): void {
    try {
      const allHealthData = this.getAllHealthData();
      const newEntry: HealthData = { userId, ...healthData };
      
      allHealthData.push(newEntry);
      localStorage.setItem(this.HEALTH_DATA_KEY, JSON.stringify(allHealthData));
      
      // Update user's health record count
      const userHealthCount = allHealthData.filter(h => h.userId === userId).length;
      this.updateUser(userId, { 
        healthRecords: userHealthCount,
        lastHealthEntry: healthData.date
      });
    } catch (error) {
      console.error('Error storing health data:', error);
    }
  }

  /**
   * Get all health data
   */
  static getAllHealthData(): HealthData[] {
    try {
      const healthData = localStorage.getItem(this.HEALTH_DATA_KEY);
      return healthData ? JSON.parse(healthData) : [];
    } catch (error) {
      console.error('Error loading health data:', error);
      return [];
    }
  }

  /**
   * Get health data for a specific user
   */
  static getUserHealthData(userId: string): HealthData[] {
    const allHealthData = this.getAllHealthData();
    return allHealthData.filter(data => data.userId === userId);
  }

  /**
   * Store medication data for a user
   */
  static storeMedicationData(userId: string, medications: MedicationData['medications']): void {
    try {
      const allMedicationData = this.getAllMedicationData();
      const userMedIndex = allMedicationData.findIndex(med => med.userId === userId);
      
      const medicationEntry: MedicationData = { userId, medications };
      
      if (userMedIndex >= 0) {
        allMedicationData[userMedIndex] = medicationEntry;
      } else {
        allMedicationData.push(medicationEntry);
      }
      
      localStorage.setItem(this.MEDICATION_DATA_KEY, JSON.stringify(allMedicationData));
      
      // Update user's medication count
      const activeMedications = medications.filter(med => med.active).length;
      this.updateUser(userId, { medications: medications.map(m => `${m.name} ${m.dosage}`) });
    } catch (error) {
      console.error('Error storing medication data:', error);
    }
  }

  /**
   * Get all medication data
   */
  static getAllMedicationData(): MedicationData[] {
    try {
      const medicationData = localStorage.getItem(this.MEDICATION_DATA_KEY);
      return medicationData ? JSON.parse(medicationData) : [];
    } catch (error) {
      console.error('Error loading medication data:', error);
      return [];
    }
  }

  /**
   * Get medication data for a specific user
   */
  static getUserMedicationData(userId: string): MedicationData | null {
    const allMedicationData = this.getAllMedicationData();
    return allMedicationData.find(data => data.userId === userId) || null;
  }

  /**
   * Delete a user (admin only)
   */
  static deleteUser(userId: string): boolean {
    try {
      const users = this.getAllUsers();
      const filteredUsers = users.filter(user => user.id !== userId);
      
      if (filteredUsers.length === users.length) {
        return false; // User not found
      }
      
      localStorage.setItem(this.USERS_KEY, JSON.stringify(filteredUsers));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * Clear all data (for development/testing)
   */
  static clearAllData(): void {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.HEALTH_DATA_KEY);
    localStorage.removeItem(this.MEDICATION_DATA_KEY);
    this.initializeSystem(); // Re-initialize with default admin
  }

  /**
   * Export user data (for admin panel)
   */
  static exportUserData(): string {
    const users = this.getAllUsers();
    const healthData = this.getAllHealthData();
    const medicationData = this.getAllMedicationData();
    
    return JSON.stringify({
      users: users.map(user => ({ ...user, password: '***HIDDEN***' })), // Hide passwords in export
      healthData,
      medicationData,
      exportDate: new Date().toISOString(),
      totalRecords: users.length
    }, null, 2);
  }
}