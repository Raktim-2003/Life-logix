/**
 * Authentication Security Utilities
 * Industry-level security for user authentication and session management
 */

interface LoginSession {
  userId: string;
  email: string;
  name: string;
  userType: 'client' | 'admin';
  loginTime: string;
  lastActivity: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId: string;
}

interface PasswordResetRequest {
  email: string;
  resetCode: string;
  requestTime: string;
  isUsed: boolean;
  expiresAt: string;
}

/**
 * Session Management
 */
export class AuthManager {
  private static readonly SESSION_KEY = 'lifelogix_sessions';
  private static readonly RESET_REQUESTS_KEY = 'lifelogix_reset_requests';
  private static readonly MAX_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static trackLogin(user: any): LoginSession {
    const sessions = this.getActiveSessions();
    const sessionId = this.generateSessionId();
    
    const newSession: LoginSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      sessionId,
      ipAddress: 'localhost', // In real app, get actual IP
      userAgent: navigator.userAgent
    };

    // Remove any existing sessions for this user
    const filteredSessions = sessions.filter(s => s.userId !== user.id);
    filteredSessions.push(newSession);

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(filteredSessions));
    return newSession;
  }

  static updateActivity(userId: string): void {
    const sessions = this.getActiveSessions();
    const updatedSessions = sessions.map(session => 
      session.userId === userId 
        ? { ...session, lastActivity: new Date().toISOString() }
        : session
    );
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(updatedSessions));
  }

  static logout(userId: string): void {
    const sessions = this.getActiveSessions();
    const filteredSessions = sessions.filter(s => s.userId !== userId);
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(filteredSessions));
  }

  static getActiveSessions(): LoginSession[] {
    try {
      const sessions = localStorage.getItem(this.SESSION_KEY);
      if (!sessions) return [];
      
      const allSessions: LoginSession[] = JSON.parse(sessions);
      
      // Filter out expired sessions
      const now = Date.now();
      const activeSessions = allSessions.filter(session => {
        const sessionTime = new Date(session.loginTime).getTime();
        return (now - sessionTime) < this.MAX_SESSION_DURATION;
      });

      // Update storage with active sessions only
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(activeSessions));
      return activeSessions;
    } catch {
      return [];
    }
  }

  static getSessionStats() {
    const sessions = this.getActiveSessions();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return {
      totalActiveSessions: sessions.length,
      clientSessions: sessions.filter(s => s.userType === 'client').length,
      adminSessions: sessions.filter(s => s.userType === 'admin').length,
      recentLogins: sessions.filter(s => new Date(s.loginTime) > oneDayAgo).length,
      sessions: sessions.map(s => ({
        ...s,
        // Never expose actual passwords
        maskedInfo: {
          email: s.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
          name: s.name,
          userType: s.userType,
          loginTime: s.loginTime,
          lastActivity: s.lastActivity
        }
      }))
    };
  }

  /**
   * Password Reset Management
   */
  static generateResetCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  static requestPasswordReset(email: string): string {
    const resetCode = this.generateResetCode();
    const resetRequests = this.getResetRequests();
    
    // Remove any existing requests for this email
    const filteredRequests = resetRequests.filter(r => r.email !== email);
    
    const newRequest: PasswordResetRequest = {
      email,
      resetCode,
      requestTime: new Date().toISOString(),
      isUsed: false,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };

    filteredRequests.push(newRequest);
    localStorage.setItem(this.RESET_REQUESTS_KEY, JSON.stringify(filteredRequests));
    
    return resetCode;
  }

  static validateResetCode(email: string, code: string): boolean {
    const resetRequests = this.getResetRequests();
    const request = resetRequests.find(r => 
      r.email === email && 
      r.resetCode === code && 
      !r.isUsed &&
      new Date(r.expiresAt) > new Date()
    );

    if (request) {
      // Mark as used
      request.isUsed = true;
      localStorage.setItem(this.RESET_REQUESTS_KEY, JSON.stringify(resetRequests));
      return true;
    }

    return false;
  }

  private static getResetRequests(): PasswordResetRequest[] {
    try {
      const requests = localStorage.getItem(this.RESET_REQUESTS_KEY);
      return requests ? JSON.parse(requests) : [];
    } catch {
      return [];
    }
  }

  private static generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * Demo user credentials for testing (ADMIN ACCESS ONLY)
   */
  static getDemoCredentials() {
    return {
      users: [
        { 
          id: 'user_001',
          email: 'demo@lifelogix.com', 
          password: 'Demo@123', 
          type: 'client',
          name: 'Demo User',
          uniqueId: 'DEMO_USER_001',
          medications: ['Lisinopril 10mg', 'Metformin 500mg'],
          conditions: ['Hypertension', 'Type 2 Diabetes']
        },
        { 
          id: 'admin_001',
          email: 'admin@lifelogix.com', 
          password: 'LifeLogix@2024', 
          type: 'admin',
          name: 'System Administrator',
          uniqueId: 'ADMIN_SYSTEM_001',
          medications: [],
          conditions: []
        },
        { 
          id: 'user_002',
          email: 'test@lifelogix.com', 
          password: 'Test@123', 
          type: 'client',
          name: 'Test User',
          uniqueId: 'TEST_USER_002',
          medications: ['Aspirin 81mg', 'Vitamin D 1000IU'],
          conditions: ['High Cholesterol']
        },
        { 
          id: 'user_003',
          email: 'john.doe@lifelogix.com', 
          password: 'John@2024', 
          type: 'client',
          name: 'John Doe',
          uniqueId: 'LL_USER_003',
          medications: ['Amlodipine 5mg', 'Atorvastatin 20mg', 'Metoprolol 50mg'],
          conditions: ['Hypertension', 'High Cholesterol', 'Anxiety']
        },
        { 
          id: 'user_004',
          email: 'sarah.wilson@lifelogix.com', 
          password: 'Sarah@123', 
          type: 'client',
          name: 'Sarah Wilson',
          uniqueId: 'LL_USER_004',
          medications: ['Albuterol Inhaler', 'Montelukast 10mg'],
          conditions: ['Asthma', 'Allergies']
        }
      ]
    };
  }

  /**
   * Simulate password reset (in real app, this would send email)
   */
  static simulatePasswordReset(email: string): { success: boolean; message: string; resetCode?: string } {
    const demoUsers = this.getDemoCredentials().users;
    const user = demoUsers.find(u => u.email === email);
    
    if (!user) {
      return { success: false, message: 'Email address not found in our system.' };
    }

    const resetCode = this.requestPasswordReset(email);
    return { 
      success: true, 
      message: `Password reset code sent to ${email}. Use code: ${resetCode}`,
      resetCode 
    };
  }
}