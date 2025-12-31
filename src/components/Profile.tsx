import React, { useState } from 'react';
import { User, Save, Download, Upload, Activity, Target, AlertCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { safeUpdateUser, validateUserIntegrity } from '../utils/userSecurity';

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

interface ProfileProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export function Profile({ user, onUpdateUser }: ProfileProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    age: user.age?.toString() || '',
    weight: user.weight?.toString() || '',
    height: user.height?.toString() || '',
    conditions: user.conditions?.join(', ') || ''
  });
  const [message, setMessage] = useState('');
  const [goals, setGoals] = useState({
    targetWeight: '',
    targetBP: '',
    exerciseGoal: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate current user integrity before making changes
    if (!validateUserIntegrity(user)) {
      setMessage('Error: User data integrity check failed. Please contact support.');
      setTimeout(() => setMessage(''), 5000);
      return;
    }
    
    const updates = {
      name: formData.name,
      email: formData.email,
      age: formData.age ? parseInt(formData.age) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      conditions: formData.conditions 
        ? formData.conditions.split(',').map(c => c.trim()).filter(c => c.length > 0)
        : undefined
    };

    // Use safe update function to prevent accidental modification of protected fields
    const updatedUser = safeUpdateUser(user, updates);

    onUpdateUser(updatedUser);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const calculateBMI = () => {
    if (formData.weight && formData.height) {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height) / 100; // Convert cm to m
      const bmi = weight / (height * height);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const exportHealthData = () => {
    const healthData = localStorage.getItem('lifelogix_health_data');
    const medications = localStorage.getItem('lifelogix_medications');
    const medicationLogs = localStorage.getItem('lifelogix_medication_logs');

    const exportData = {
      user: user,
      healthData: healthData ? JSON.parse(healthData) : [],
      medications: medications ? JSON.parse(medications) : [],
      medicationLogs: medicationLogs ? JSON.parse(medicationLogs) : [],
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifelogix-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage('Health data exported successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2>Profile & Settings</h2>
        <p className="text-muted-foreground">Manage your personal information and health goals</p>
      </div>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Personal Info</TabsTrigger>
          <TabsTrigger value="goals">Health Goals</TabsTrigger>
          <TabsTrigger value="data">Data Export</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your basic information (Unique ID cannot be changed)</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Security Notice */}
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      Your Unique ID ({user.uniqueId}) is permanently assigned and cannot be changed for security and data integrity purposes.
                    </AlertDescription>
                  </Alert>
                  
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="unique-id" className="flex items-center gap-2">
                      Unique ID
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </Label>
                    <Input
                      id="unique-id"
                      value={user.uniqueId}
                      disabled
                      className="bg-muted/50 cursor-not-allowed"
                      placeholder="Your unique identifier"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        This unique identifier cannot be changed for security reasons
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age (years)</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="70.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="175"
                    />
                  </div>

                  <div>
                    <Label htmlFor="conditions">Health Conditions</Label>
                    <Textarea
                      id="conditions"
                      value={formData.conditions}
                      onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                      placeholder="e.g., Hypertension, Diabetes, etc. (comma-separated)"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter health conditions separated by commas
                    </p>
                  </div>

                  <Button type="submit" className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Health Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Health Summary
                </CardTitle>
                <CardDescription>Your current health metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* BMI Calculation */}
                {bmi && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Body Mass Index (BMI)</span>
                      <Badge variant="outline">{bmi}</Badge>
                    </div>
                    {bmiInfo && (
                      <div className={`text-sm ${bmiInfo.color}`}>
                        Category: {bmiInfo.category}
                      </div>
                    )}
                  </div>
                )}

                {/* Health Conditions */}
                {user.conditions && user.conditions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Health Conditions</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.conditions.map((condition, index) => (
                        <Badge key={index} variant="outline">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Info Display */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>User Type</span>
                      <Badge variant={user.userType === 'admin' ? 'destructive' : 'default'}>
                        {user.userType}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Unique ID</span>
                      <Badge variant="outline">{user.uniqueId}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Basic Info</span>
                      <Badge variant={user.name && user.email ? 'default' : 'secondary'}>
                        {user.name && user.email ? 'Complete' : 'Incomplete'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Physical Metrics</span>
                      <Badge variant={user.age && user.weight && user.height ? 'default' : 'secondary'}>
                        {user.age && user.weight && user.height ? 'Complete' : 'Incomplete'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Health Conditions</span>
                      <Badge variant={user.conditions && user.conditions.length > 0 ? 'default' : 'secondary'}>
                        {user.conditions && user.conditions.length > 0 ? 'Complete' : 'Optional'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Health Goals
              </CardTitle>
              <CardDescription>Set and track your health objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target-weight">Target Weight (kg)</Label>
                  <Input
                    id="target-weight"
                    type="number"
                    step="0.1"
                    value={goals.targetWeight}
                    onChange={(e) => setGoals({ ...goals, targetWeight: e.target.value })}
                    placeholder="68.0"
                  />
                </div>
                <div>
                  <Label htmlFor="target-bp">Target Blood Pressure</Label>
                  <Input
                    id="target-bp"
                    value={goals.targetBP}
                    onChange={(e) => setGoals({ ...goals, targetBP: e.target.value })}
                    placeholder="120/80"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="exercise-goal">Exercise Goal</Label>
                <Input
                  id="exercise-goal"
                  value={goals.exerciseGoal}
                  onChange={(e) => setGoals({ ...goals, exerciseGoal: e.target.value })}
                  placeholder="e.g., 30 minutes daily, 3x per week"
                />
              </div>

              <div>
                <Label htmlFor="goal-notes">Notes</Label>
                <Textarea
                  id="goal-notes"
                  value={goals.notes}
                  onChange={(e) => setGoals({ ...goals, notes: e.target.value })}
                  placeholder="Additional health goals or notes..."
                  rows={3}
                />
              </div>

              <Button className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Goals
              </Button>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Health goals feature is coming soon! This will help you track progress towards your targets.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Export your health data for backup or sharing with healthcare providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Export Health Data</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all your health data including vitals, medications, and logs in JSON format.
                  This data can be imported into other health apps or shared with your doctor.
                </p>
                <Button onClick={exportHealthData} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Data Privacy</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• All health data is stored locally in your browser</p>
                  <p>• No data is sent to external servers</p>
                  <p>• Clearing browser data will remove all records</p>
                  <p>• Export regularly to backup your data</p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  For enhanced security and cloud synchronization, connect to Supabase backend.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}