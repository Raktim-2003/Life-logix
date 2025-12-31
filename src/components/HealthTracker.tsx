import React, { useState, useEffect } from 'react';
import { Heart, Activity, Droplets, Weight, Plus, Save, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'client' | 'admin';
  uniqueId: string;
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

interface HealthTrackerProps {
  user: User;
}

export function HealthTracker({ user }: HealthTrackerProps) {
  const [healthData, setHealthData] = useState<HealthEntry[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    systolic: '',
    diastolic: '',
    heartRate: '',
    bloodSugar: '',
    weight: '',
    notes: ''
  });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('blood_pressure');

  useEffect(() => {
    const saved = localStorage.getItem('lifelogix_health_data');
    if (saved) {
      setHealthData(JSON.parse(saved));
    }
  }, []);

  const saveHealthData = (newData: HealthEntry[]) => {
    setHealthData(newData);
    localStorage.setItem('lifelogix_health_data', JSON.stringify(newData));
  };

  const handleSubmit = (type: string) => {
    let newEntry: HealthEntry | null = null;

    switch (type) {
      case 'blood_pressure':
        if (!formData.systolic || !formData.diastolic) {
          setMessage('Please enter both systolic and diastolic values');
          return;
        }
        newEntry = {
          id: `bp_${Date.now()}`,
          date: formData.date,
          type: 'blood_pressure',
          systolic: parseInt(formData.systolic),
          diastolic: parseInt(formData.diastolic),
          notes: formData.notes || undefined
        };
        break;

      case 'heart_rate':
        if (!formData.heartRate) {
          setMessage('Please enter heart rate value');
          return;
        }
        newEntry = {
          id: `hr_${Date.now()}`,
          date: formData.date,
          type: 'heart_rate',
          value: parseInt(formData.heartRate),
          unit: 'bpm',
          notes: formData.notes || undefined
        };
        break;

      case 'blood_sugar':
        if (!formData.bloodSugar) {
          setMessage('Please enter blood sugar value');
          return;
        }
        newEntry = {
          id: `bs_${Date.now()}`,
          date: formData.date,
          type: 'blood_sugar',
          value: parseInt(formData.bloodSugar),
          unit: 'mg/dL',
          notes: formData.notes || undefined
        };
        break;

      case 'weight':
        if (!formData.weight) {
          setMessage('Please enter weight value');
          return;
        }
        newEntry = {
          id: `weight_${Date.now()}`,
          date: formData.date,
          type: 'weight',
          value: parseFloat(formData.weight),
          unit: 'kg',
          notes: formData.notes || undefined
        };
        break;
    }

    if (newEntry) {
      const updatedData = [...healthData, newEntry];
      saveHealthData(updatedData);
      setMessage('Health data saved successfully!');
      
      // Clear form
      setFormData({
        ...formData,
        systolic: '',
        diastolic: '',
        heartRate: '',
        bloodSugar: '',
        weight: '',
        notes: ''
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getRecentEntries = (type: string) => {
    return healthData
      .filter(entry => entry.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const formatEntryValue = (entry: HealthEntry) => {
    if (entry.type === 'blood_pressure') {
      return `${entry.systolic}/${entry.diastolic} mmHg`;
    }
    return `${entry.value} ${entry.unit}`;
  };

  const getHealthStatus = (type: string, entry: HealthEntry) => {
    switch (type) {
      case 'blood_pressure':
        const systolic = entry.systolic || 0;
        const diastolic = entry.diastolic || 0;
        if (systolic >= 140 || diastolic >= 90) return 'high';
        if (systolic <= 90 || diastolic <= 60) return 'low';
        return 'normal';
      
      case 'heart_rate':
        const hr = entry.value || 0;
        if (hr > 100) return 'high';
        if (hr < 60) return 'low';
        return 'normal';
      
      case 'blood_sugar':
        const bs = entry.value || 0;
        if (bs > 140) return 'high';
        if (bs < 70) return 'low';
        return 'normal';
      
      default:
        return 'normal';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Health Tracker</h2>
          <p className="text-muted-foreground">Record your daily health metrics</p>
        </div>
        <Badge variant="outline">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(formData.date).toLocaleDateString()}
        </Badge>
      </div>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Reading</CardTitle>
            <CardDescription>Record your health metrics for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="blood_pressure">
                    <Heart className="h-4 w-4 mr-1" />
                    BP
                  </TabsTrigger>
                  <TabsTrigger value="heart_rate">
                    <Activity className="h-4 w-4 mr-1" />
                    HR
                  </TabsTrigger>
                  <TabsTrigger value="blood_sugar">
                    <Droplets className="h-4 w-4 mr-1" />
                    BS
                  </TabsTrigger>
                  <TabsTrigger value="weight">
                    <Weight className="h-4 w-4 mr-1" />
                    Weight
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="blood_pressure" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="systolic">Systolic (mmHg)</Label>
                      <Input
                        id="systolic"
                        type="number"
                        placeholder="120"
                        value={formData.systolic}
                        onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
                      <Input
                        id="diastolic"
                        type="number"
                        placeholder="80"
                        value={formData.diastolic}
                        onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bp-notes">Notes (optional)</Label>
                    <Textarea
                      id="bp-notes"
                      placeholder="Any observations or context..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  <Button onClick={() => handleSubmit('blood_pressure')} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Blood Pressure
                  </Button>
                </TabsContent>

                <TabsContent value="heart_rate" className="space-y-4">
                  <div>
                    <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
                    <Input
                      id="heart-rate"
                      type="number"
                      placeholder="72"
                      value={formData.heartRate}
                      onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hr-notes">Notes (optional)</Label>
                    <Textarea
                      id="hr-notes"
                      placeholder="Resting, after exercise, etc..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  <Button onClick={() => handleSubmit('heart_rate')} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Heart Rate
                  </Button>
                </TabsContent>

                <TabsContent value="blood_sugar" className="space-y-4">
                  <div>
                    <Label htmlFor="blood-sugar">Blood Sugar (mg/dL)</Label>
                    <Input
                      id="blood-sugar"
                      type="number"
                      placeholder="100"
                      value={formData.bloodSugar}
                      onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bs-notes">Notes (optional)</Label>
                    <Textarea
                      id="bs-notes"
                      placeholder="Fasting, after meal, etc..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  <Button onClick={() => handleSubmit('blood_sugar')} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Blood Sugar
                  </Button>
                </TabsContent>

                <TabsContent value="weight" className="space-y-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70.5"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight-notes">Notes (optional)</Label>
                    <Textarea
                      id="weight-notes"
                      placeholder="Morning weight, after meal, etc..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  <Button onClick={() => handleSubmit('weight')} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Weight
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Your latest health readings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="blood_pressure">BP</TabsTrigger>
                <TabsTrigger value="heart_rate">HR</TabsTrigger>
                <TabsTrigger value="blood_sugar">BS</TabsTrigger>
                <TabsTrigger value="weight">Weight</TabsTrigger>
              </TabsList>

              {['blood_pressure', 'heart_rate', 'blood_sugar', 'weight'].map((type) => (
                <TabsContent key={type} value={type}>
                  <div className="space-y-3">
                    {getRecentEntries(type).length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No entries yet. Add your first reading!
                      </p>
                    ) : (
                      getRecentEntries(type).map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatEntryValue(entry)}</span>
                              <Badge 
                                variant={getHealthStatus(type, entry) === 'normal' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {getHealthStatus(type, entry)}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString()}
                            </div>
                            {entry.notes && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {entry.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}