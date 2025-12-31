import React, { useState, useEffect } from 'react';
import { Activity, Heart, Droplets, Weight, TrendingUp, TrendingDown, Calendar, Pill, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { HealthAlerts } from './HealthAlerts';

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

interface HealthEntry {
  id: string;
  date: string;
  type: 'blood_pressure' | 'heart_rate' | 'blood_sugar' | 'weight';
  systolic?: number;
  diastolic?: number;
  value?: number;
  unit?: string;
  notes?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  nextDue: string;
}

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [healthData, setHealthData] = useState<HealthEntry[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    // Load health data from localStorage - NO DEMO DATA
    const savedHealthData = localStorage.getItem('lifelogix_health_data');
    const savedMedications = localStorage.getItem('lifelogix_medications');

    if (savedHealthData) {
      setHealthData(JSON.parse(savedHealthData));
    }

    if (savedMedications) {
      setMedications(JSON.parse(savedMedications));
    }
  }, []);

  const getLatestReading = (type: string) => {
    return healthData
      .filter(entry => entry.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const getChartData = (type: string) => {
    return healthData
      .filter(entry => entry.type === type)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7) // Last 7 days
      .map(entry => ({
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: entry.value || entry.systolic,
        diastolic: entry.diastolic,
      }));
  };

  const getTrend = (type: string) => {
    const data = healthData
      .filter(entry => entry.type === type)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);
    
    if (data.length < 2) return 'stable';
    
    const recent = data.slice(-3);
    const older = data.slice(0, 3);
    
    const recentAvg = recent.reduce((sum, entry) => sum + (entry.value || entry.systolic || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + (entry.value || entry.systolic || 0), 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (Math.abs(change) < 5) return 'stable';
    return change > 0 ? 'up' : 'down';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 20) {
      return 'Good evening';
    } else {
      return 'Welcome';
    }
  };

  const upcomingMedications = medications.filter(med => {
    const nextDue = new Date(med.nextDue);
    const now = new Date();
    const hoursUntil = (nextDue.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil <= 24 && hoursUntil > 0;
  });

  const latestBP = getLatestReading('blood_pressure');
  const latestHR = getLatestReading('heart_rate');
  const latestBS = getLatestReading('blood_sugar');
  const latestWeight = getLatestReading('weight');

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-chart-1/10 to-chart-2/10 rounded-lg p-6">
        <h2>{getGreeting()}, {user.name}!</h2>
        <p className="text-muted-foreground mt-1">
          {user.userType === 'admin' 
            ? 'Welcome to the admin dashboard. Monitor system health and user activity.' 
            : 'Here\'s your health summary for today.'}
        </p>
        {user.uniqueId && (
          <Badge variant="outline" className="mt-2">
            ID: {user.uniqueId}
          </Badge>
        )}
      </div>

      {/* Health Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
            <Heart className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : 'No data'}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={getTrend('blood_pressure') === 'up' ? 'destructive' : getTrend('blood_pressure') === 'down' ? 'default' : 'secondary'}>
                {getTrend('blood_pressure') === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                {getTrend('blood_pressure') === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                {getTrend('blood_pressure')}
              </Badge>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
            <Activity className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestHR ? `${latestHR.value} bpm` : 'No data'}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={getTrend('heart_rate') === 'up' ? 'destructive' : getTrend('heart_rate') === 'down' ? 'default' : 'secondary'}>
                {getTrend('heart_rate') === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                {getTrend('heart_rate') === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                {getTrend('heart_rate')}
              </Badge>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Sugar</CardTitle>
            <Droplets className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestBS ? `${latestBS.value} mg/dL` : 'No data'}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={getTrend('blood_sugar') === 'up' ? 'destructive' : getTrend('blood_sugar') === 'down' ? 'default' : 'secondary'}>
                {getTrend('blood_sugar') === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                {getTrend('blood_sugar') === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                {getTrend('blood_sugar')}
              </Badge>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight</CardTitle>
            <Weight className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestWeight ? `${latestWeight.value} kg` : 'No data'}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={getTrend('weight') === 'up' ? 'destructive' : getTrend('weight') === 'down' ? 'default' : 'secondary'}>
                {getTrend('weight') === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                {getTrend('weight') === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                {getTrend('weight')}
              </Badge>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Medication Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Blood Pressure Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getChartData('blood_pressure')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" name="Systolic" strokeWidth={2} />
                <Line type="monotone" dataKey="diastolic" stroke="hsl(var(--chart-2))" name="Diastolic" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heart Rate Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getChartData('heart_rate')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Health Alerts - Real-time monitoring */}
      {user.userType === 'client' && <HealthAlerts userId={user.id} />}

      {/* Upcoming Medications */}
      {upcomingMedications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-chart-3" />
              Upcoming Medications
            </CardTitle>
            <CardDescription>Medications due in the next 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingMedications.map((med) => {
                const nextDue = new Date(med.nextDue);
                const hoursUntil = Math.round((nextDue.getTime() - new Date().getTime()) / (1000 * 60 * 60));
                
                return (
                  <div key={med.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{med.name}</div>
                      <div className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={hoursUntil <= 2 ? 'destructive' : 'default'}>
                        {hoursUntil <= 1 ? 'Due soon' : `In ${hoursUntil}h`}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Conditions */}
      {user.conditions && user.conditions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-chart-5" />
              Health Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.conditions.map((condition, index) => (
                <Badge key={index} variant="outline">
                  {condition}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}