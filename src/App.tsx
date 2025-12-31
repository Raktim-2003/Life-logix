import React, { useState, useEffect } from 'react';
import { Heart, Activity, TrendingUp, Calendar, Settings, Pill, Home, User, Shield, Stethoscope, LogOut, Bell, Search, AlertTriangle } from 'lucide-react';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { HealthTracker } from './components/HealthTracker';
import { MedicationReminder } from './components/MedicationReminder';
import { CalendarView } from './components/CalendarView';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { DoctorAppointments } from './components/DoctorAppointments';
import { HealthAlerts } from './components/HealthAlerts';
import { ThemeToggle } from './components/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { safeUpdateUser, validateUserIntegrity } from './utils/userSecurity';
import { AuthManager } from './utils/authSecurity';
import { NotificationManager } from './utils/notificationSystem';
import { UserStorageManager } from './utils/userStorage';

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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize the user storage system
    UserStorageManager.initializeSystem();
    
    // Check for existing session
    const savedUser = localStorage.getItem('lifelogix_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      // Update activity for session tracking
      AuthManager.updateActivity(userData.id);
    }
    setLoading(false);
  }, []);

  // Update user activity periodically
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        AuthManager.updateActivity(user.id);
      }, 5 * 60 * 1000); // Update every 5 minutes

      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogin = (userData: User) => {
    // Track the login session
    AuthManager.trackLogin(userData);
    setUser(userData);
    localStorage.setItem('lifelogix_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    // Clean up session tracking
    if (user) {
      AuthManager.logout(user.id);
    }
    setUser(null);
    localStorage.removeItem('lifelogix_user');
    // Clear all health data on logout for privacy
    localStorage.removeItem('lifelogix_health_data');
    localStorage.removeItem('lifelogix_medications');
  };

  const updateUser = (updatedUser: User) => {
    // Validate user integrity before allowing updates
    if (!validateUserIntegrity(updatedUser)) {
      console.error('❌ Attempted to update user with invalid data. Update blocked.');
      return;
    }
    
    // If there's an existing user, use safe update to prevent protected field modifications
    const finalUser = user ? safeUpdateUser(user, updatedUser) : updatedUser;
    
    // Update in storage
    if (finalUser.id) {
      UserStorageManager.updateUser(finalUser.id, {
        name: finalUser.name,
        email: finalUser.email,
        age: finalUser.age,
        weight: finalUser.weight,
        height: finalUser.height,
        conditions: finalUser.conditions,
        lastLogin: new Date().toISOString()
      });
    }
    
    setUser(finalUser);
    localStorage.setItem('lifelogix_user', JSON.stringify(finalUser));
  };

  const getGreeting = () => {
    const greetingData = NotificationManager.getGreetingBasedOnTime();
    return `${greetingData.greeting} ${greetingData.icon}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-chart-1/5 via-chart-2/5 to-chart-3/5 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Heart className="h-12 w-12 text-chart-1 animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 text-chart-2 animate-ping opacity-75">
              <Heart className="h-12 w-12" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              LifeLogix
            </h2>
            <p className="text-muted-foreground animate-pulse">Loading your health dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Heart className="h-8 w-8 text-chart-1" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
                  LifeLogix
                </h1>
                <p className="text-xs text-muted-foreground">Smart Tracking for a Healthier You</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* User info with avatar */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium">{getGreeting()}, {user.name.split(' ')[0]}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.userType === 'admin' ? 'Administrator' : 'Health Member'}
                  </p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-chart-1 text-white">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Status badges */}
              <div className="flex items-center space-x-2">
                {user.userType === 'admin' && (
                  <Badge variant="destructive" className="text-xs flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs flex items-center gap-1 bg-green-50 border-green-200 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Online
                </Badge>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Bell className="h-4 w-4" />
                </Button>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue={user.userType === 'admin' ? 'admin' : 'dashboard'} className="w-full">
          <TabsList className={`grid w-full ${user.userType === 'admin' ? 'grid-cols-3' : 'grid-cols-6'} mb-6 bg-card/50 backdrop-blur`}>
            {user.userType === 'client' && (
              <>
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="tracker" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Track Health
                </TabsTrigger>
                <TabsTrigger value="medications" className="flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Medications
                </TabsTrigger>
                <TabsTrigger value="appointments" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Appointments
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
              </>
            )}
            {user.userType === 'admin' && (
              <>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {user.userType === 'admin' && (
            <TabsContent value="admin">
              <AdminPanel user={user as any} onUpdateCredentials={updateUser} />
            </TabsContent>
          )}

          <TabsContent value="dashboard">
            <Dashboard user={user} />
          </TabsContent>

          {user.userType === 'client' && (
            <>
              <TabsContent value="tracker">
                <HealthTracker user={user} />
              </TabsContent>

              <TabsContent value="medications">
                <MedicationReminder user={user} />
              </TabsContent>

              <TabsContent value="appointments">
                <DoctorAppointments user={user} />
              </TabsContent>

              <TabsContent value="calendar">
                <CalendarView user={user} />
              </TabsContent>
            </>
          )}

          <TabsContent value="profile">
            <Profile user={user} onUpdateUser={updateUser} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}