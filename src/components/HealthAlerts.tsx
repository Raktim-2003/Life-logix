import React, { useState, useEffect } from 'react';
import { AlertTriangle, Heart, Activity, Droplets, Wind, Bell, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface HealthEntry {
  id: string;
  date: string;
  type: 'blood_pressure' | 'heart_rate' | 'blood_sugar' | 'weight' | 'oxygen';
  systolic?: number;
  diastolic?: number;
  value?: number;
  unit?: string;
  notes?: string;
}

interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'blood_pressure' | 'heart_rate' | 'blood_sugar' | 'oxygen';
  title: string;
  message: string;
  value: string;
  timestamp: string;
  dismissed: boolean;
}

interface HealthAlertsProps {
  userId: string;
}

export function HealthAlerts({ userId }: HealthAlertsProps) {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check if notifications are supported and get permission status
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    // Check health data for abnormal values
    checkHealthData();

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkHealthData, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const checkHealthData = () => {
    const savedHealthData = localStorage.getItem('lifelogix_health_data');
    if (!savedHealthData) return;

    const healthData: HealthEntry[] = JSON.parse(savedHealthData);
    const recentData = healthData
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return entryDate >= dayAgo;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const newAlerts: HealthAlert[] = [];

    // Check blood pressure
    const latestBP = recentData.find(e => e.type === 'blood_pressure');
    if (latestBP && latestBP.systolic && latestBP.diastolic) {
      if (latestBP.systolic >= 140 || latestBP.diastolic >= 90) {
        newAlerts.push({
          id: `alert_bp_${Date.now()}`,
          type: latestBP.systolic >= 160 || latestBP.diastolic >= 100 ? 'critical' : 'warning',
          category: 'blood_pressure',
          title: 'High Blood Pressure Detected',
          message: `Your blood pressure reading of ${latestBP.systolic}/${latestBP.diastolic} mmHg is elevated. Consider consulting your healthcare provider.`,
          value: `${latestBP.systolic}/${latestBP.diastolic} mmHg`,
          timestamp: latestBP.date,
          dismissed: false
        });
      } else if (latestBP.systolic <= 90 || latestBP.diastolic <= 60) {
        newAlerts.push({
          id: `alert_bp_low_${Date.now()}`,
          type: 'warning',
          category: 'blood_pressure',
          title: 'Low Blood Pressure Detected',
          message: `Your blood pressure reading of ${latestBP.systolic}/${latestBP.diastolic} mmHg is low. Monitor for symptoms like dizziness.`,
          value: `${latestBP.systolic}/${latestBP.diastolic} mmHg`,
          timestamp: latestBP.date,
          dismissed: false
        });
      }
    }

    // Check heart rate
    const latestHR = recentData.find(e => e.type === 'heart_rate');
    if (latestHR && latestHR.value) {
      if (latestHR.value > 100) {
        newAlerts.push({
          id: `alert_hr_${Date.now()}`,
          type: latestHR.value > 120 ? 'critical' : 'warning',
          category: 'heart_rate',
          title: 'Elevated Heart Rate',
          message: `Your heart rate of ${latestHR.value} bpm is above normal resting range. If persistent, consult your doctor.`,
          value: `${latestHR.value} bpm`,
          timestamp: latestHR.date,
          dismissed: false
        });
      } else if (latestHR.value < 60) {
        newAlerts.push({
          id: `alert_hr_low_${Date.now()}`,
          type: 'warning',
          category: 'heart_rate',
          title: 'Low Heart Rate',
          message: `Your heart rate of ${latestHR.value} bpm is below normal range. This may be normal for athletes, but consult your doctor if concerned.`,
          value: `${latestHR.value} bpm`,
          timestamp: latestHR.date,
          dismissed: false
        });
      }
    }

    // Check blood sugar
    const latestBS = recentData.find(e => e.type === 'blood_sugar');
    if (latestBS && latestBS.value) {
      if (latestBS.value > 140) {
        newAlerts.push({
          id: `alert_bs_${Date.now()}`,
          type: latestBS.value > 180 ? 'critical' : 'warning',
          category: 'blood_sugar',
          title: 'High Blood Sugar',
          message: `Your blood sugar level of ${latestBS.value} mg/dL is elevated. Monitor your diet and contact your healthcare provider if persistent.`,
          value: `${latestBS.value} mg/dL`,
          timestamp: latestBS.date,
          dismissed: false
        });
      } else if (latestBS.value < 70) {
        newAlerts.push({
          id: `alert_bs_low_${Date.now()}`,
          type: latestBS.value < 54 ? 'critical' : 'warning',
          category: 'blood_sugar',
          title: 'Low Blood Sugar',
          message: `Your blood sugar level of ${latestBS.value} mg/dL is low. Consume fast-acting carbohydrates and monitor closely.`,
          value: `${latestBS.value} mg/dL`,
          timestamp: latestBS.date,
          dismissed: false
        });
      }
    }

    // Check oxygen level
    const latestO2 = recentData.find(e => e.type === 'oxygen');
    if (latestO2 && latestO2.value) {
      if (latestO2.value < 95) {
        newAlerts.push({
          id: `alert_o2_${Date.now()}`,
          type: latestO2.value < 90 ? 'critical' : 'warning',
          category: 'oxygen',
          title: 'Low Oxygen Level',
          message: `Your oxygen saturation of ${latestO2.value}% is below normal. Seek immediate medical attention if below 90%.`,
          value: `${latestO2.value}%`,
          timestamp: latestO2.date,
          dismissed: false
        });
      }
    }

    // Update alerts and send notifications
    if (newAlerts.length > 0) {
      setAlerts(prev => {
        // Filter out old alerts with same category
        const filtered = prev.filter(a => 
          !newAlerts.some(na => na.category === a.category)
        );
        return [...filtered, ...newAlerts];
      });

      // Send browser notifications for critical alerts
      if (notificationsEnabled) {
        newAlerts.forEach(alert => {
          if (alert.type === 'critical') {
            sendBrowserNotification(alert);
          }
        });
      }
    }
  };

  const sendBrowserNotification = (alert: HealthAlert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('LifeLogix Health Alert', {
        body: alert.message,
        icon: '/favicon.ico',
        tag: alert.id,
        requireInteraction: alert.type === 'critical'
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, dismissed: true } : a
    ));
  };

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'blood_pressure':
        return <Heart className="h-4 w-4" />;
      case 'heart_rate':
        return <Activity className="h-4 w-4" />;
      case 'blood_sugar':
        return <Droplets className="h-4 w-4" />;
      case 'oxygen':
        return <Wind className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const activeAlerts = alerts.filter(a => !a.dismissed);
  const criticalAlerts = activeAlerts.filter(a => a.type === 'critical');
  const warningAlerts = activeAlerts.filter(a => a.type === 'warning');

  return (
    <div className="space-y-4">
      {/* Notification Settings */}
      {!notificationsEnabled && 'Notification' in window && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Enable browser notifications to receive real-time health alerts</span>
            <Button size="sm" onClick={requestNotificationPermission}>
              Enable
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Alert Summary */}
      {activeAlerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{criticalAlerts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{warningAlerts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Monitor closely</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Total Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeAlerts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Health alerts today</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Alerts List */}
      {activeAlerts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Active Health Alerts
            </CardTitle>
            <CardDescription>
              Real-time monitoring of your health metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAlerts.map(alert => (
              <Alert
                key={alert.id}
                variant={alert.type === 'critical' ? 'destructive' : 'default'}
                className="relative"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${alert.type === 'critical' ? 'text-destructive' : 'text-orange-500'}`}>
                    {getAlertIcon(alert.category)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{alert.title}</p>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={alert.type === 'critical' ? 'destructive' : 'outline'}>
                        {alert.value}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-2">
              <Check className="h-12 w-12 text-green-500 mx-auto" />
              <p className="font-semibold">All Clear!</p>
              <p className="text-sm text-muted-foreground">
                No health alerts at this time. Keep tracking your metrics regularly.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
