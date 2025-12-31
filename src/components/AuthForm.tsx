import React, { useState, useEffect } from 'react';
import { Heart, Mail, Lock, User, ArrowRight, Shield, Eye, EyeOff, KeyRound, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { ThemeToggle } from './ThemeToggle';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AuthManager } from '../utils/authSecurity';
import { generateUniqueId } from '../utils/userSecurity';
import { UserStorageManager } from '../utils/userStorage';

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

interface AuthFormProps {
  onLogin: (user: User) => void;
}

type AuthStep = 'auth' | 'reset-request' | 'reset-verify' | 'reset-complete';

export function AuthForm({ onLogin }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [step, setStep] = useState<AuthStep>('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [adminData, setAdminData] = useState({ email: '', password: '' });
  const [resetData, setResetData] = useState({ 
    email: '', 
    resetCode: '', 
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  useEffect(() => {
    if (registerData.password) {
      setPasswordStrength(checkPasswordStrength(registerData.password));
    }
  }, [registerData.password]);

  // Initialize the user storage system
  useEffect(() => {
    UserStorageManager.initializeSystem();
  }, []);

  const resetForm = () => {
    setError('');
    setSuccess('');
    setLoading(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setStep('auth');
    resetForm();
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!loginData.email || !loginData.password) {
        throw new Error('Please fill in all fields');
      }

      if (!validateEmail(loginData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Authenticate user with stored data
      const authenticatedUser = UserStorageManager.authenticateUser(loginData.email, loginData.password);
      
      if (authenticatedUser) {
        const user: User = {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          name: authenticatedUser.name,
          userType: authenticatedUser.userType,
          uniqueId: authenticatedUser.uniqueId,
          age: authenticatedUser.age,
          weight: authenticatedUser.weight,
          height: authenticatedUser.height,
          conditions: authenticatedUser.conditions
        };
        
        AuthManager.trackLogin(user);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => onLogin(user), 1000);
        return;
      }

      throw new Error('Invalid email or password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
        throw new Error('Please fill in all fields');
      }

      if (!validateEmail(registerData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (passwordStrength < 3) {
        throw new Error('Password is too weak. Please use a stronger password.');
      }

      // Check if email already exists
      if (UserStorageManager.getUserByEmail(registerData.email)) {
        throw new Error('An account with this email already exists');
      }

      // Register the new user
      const newUser = UserStorageManager.registerUser({
        email: registerData.email,
        name: registerData.name,
        password: registerData.password,
        userType: 'client'
      });

      if (!newUser) {
        throw new Error('Failed to create account. Please try again.');
      }

      const user: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        userType: newUser.userType,
        uniqueId: newUser.uniqueId,
        age: newUser.age,
        weight: newUser.weight,
        height: newUser.height,
        conditions: newUser.conditions
      };

      AuthManager.trackLogin(user);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => onLogin(user), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!adminData.email || !adminData.password) {
        throw new Error('Please fill in all fields');
      }

      // Check admin credentials - Updated to simple Admin/Admin
      if (adminData.email === 'Admin' && adminData.password === 'Admin') {
        const adminUser: User = {
          id: 'admin_user',
          email: 'admin@lifelogix.com',
          name: 'System Administrator',
          userType: 'admin',
          uniqueId: 'ADMIN_SYSTEM_001'
        };
        
        AuthManager.trackLogin(adminUser);
        setSuccess('Admin access granted! Redirecting...');
        setTimeout(() => onLogin(adminUser), 1000);
        return;
      }

      throw new Error('Invalid admin credentials');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!resetData.email) {
        throw new Error('Please enter your email address');
      }

      if (!validateEmail(resetData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const result = AuthManager.simulatePasswordReset(resetData.email);
      
      if (result.success) {
        setSuccess(result.message);
        setStep('reset-verify');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!resetData.resetCode) {
        throw new Error('Please enter the reset code');
      }

      const isValid = AuthManager.validateResetCode(resetData.email, resetData.resetCode);
      
      if (isValid) {
        setSuccess('Reset code verified! Please set your new password.');
        setStep('reset-complete');
      } else {
        throw new Error('Invalid or expired reset code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!resetData.newPassword || !resetData.confirmPassword) {
        throw new Error('Please fill in all fields');
      }

      if (resetData.newPassword !== resetData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (checkPasswordStrength(resetData.newPassword) < 3) {
        throw new Error('Password is too weak. Please use a stronger password.');
      }

      setSuccess('Password reset successful! Please login with your new password.');
      setTimeout(() => {
        setStep('auth');
        setActiveTab('login');
        setResetData({ email: '', resetCode: '', newPassword: '', confirmPassword: '' });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 1) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  if (step !== 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-3/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-12 w-12 text-chart-1" />
              <div>
                <h1 className="text-2xl font-bold">LifeLogix</h1>
                <p className="text-sm text-muted-foreground">Password Recovery</p>
              </div>
            </div>
          </div>

          <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <KeyRound className="h-5 w-5 text-chart-1" />
                {step === 'reset-request' && 'Reset Password'}
                {step === 'reset-verify' && 'Verify Reset Code'}
                {step === 'reset-complete' && 'Set New Password'}
              </CardTitle>
              <CardDescription>
                {step === 'reset-request' && 'Enter your email to receive a reset code'}
                {step === 'reset-verify' && 'Enter the verification code sent to your email'}
                {step === 'reset-complete' && 'Create a new secure password'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'reset-request' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={resetData.email}
                        onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Reset Code...
                      </>
                    ) : (
                      <>
                        Send Reset Code
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => setStep('auth')}
                  >
                    Back to Login
                  </Button>
                </form>
              )}

              {step === 'reset-verify' && (
                <form onSubmit={handleResetVerify} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-code">Verification Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-code"
                        type="text"
                        placeholder="Enter 6-digit code"
                        className="pl-10 text-center tracking-wider"
                        maxLength={6}
                        value={resetData.resetCode}
                        onChange={(e) => setResetData({ ...resetData, resetCode: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Code sent to {resetData.email}
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => setStep('reset-request')}
                  >
                    Resend Code
                  </Button>
                </form>
              )}

              {step === 'reset-complete' && (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="pl-10 pr-10"
                        value={resetData.newPassword}
                        onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    
                    {resetData.newPassword && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Password Strength</span>
                          <span className={`font-medium ${checkPasswordStrength(resetData.newPassword) >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                            {getPasswordStrengthText(checkPasswordStrength(resetData.newPassword))}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(checkPasswordStrength(resetData.newPassword))}`}
                            style={{ width: `${(checkPasswordStrength(resetData.newPassword) / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-new-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        className="pl-10 pr-10"
                        value={resetData.confirmPassword}
                        onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-3/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center space-x-2 flex-1">
              <Heart className="h-12 w-12 text-chart-1 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
                  LifeLogix
                </h1>
                <p className="text-sm text-muted-foreground">Smart Tracking for a Healthier You</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle>Welcome to LifeLogix</CardTitle>
            <CardDescription>
              Track your health metrics, manage medications, and visualize your wellness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Register
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <button
                        type="button"
                        className="text-xs text-chart-1 hover:text-chart-2 transition-colors"
                        onClick={() => setStep('reset-request')}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    
                    {registerData.password && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Password Strength</span>
                          <span className={`font-medium ${passwordStrength >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                            {getPasswordStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin ID</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="admin-email"
                        type="text"
                        placeholder="Enter admin ID"
                        className="pl-10"
                        value={adminData.email}
                        onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter admin password"
                        className="pl-10 pr-10"
                        value={adminData.password}
                        onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accessing Admin Panel...
                      </>
                    ) : (
                      <>
                        Access Admin Panel
                        <Shield className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}