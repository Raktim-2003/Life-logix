import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Heart, Activity, Droplets, Weight, Pill } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
}

interface MedicationLog {
  id: string;
  medicationId: string;
  takenAt: string;
  scheduled: string;
  status: 'taken' | 'missed' | 'skipped';
}

interface CalendarViewProps {
  user: User;
}

export function CalendarView({ user }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [healthData, setHealthData] = useState<HealthEntry[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);

  useEffect(() => {
    const savedHealthData = localStorage.getItem('lifelogix_health_data');
    const savedMedications = localStorage.getItem('lifelogix_medications');
    const savedLogs = localStorage.getItem('lifelogix_medication_logs');

    if (savedHealthData) setHealthData(JSON.parse(savedHealthData));
    if (savedMedications) setMedications(JSON.parse(savedMedications));
    if (savedLogs) setMedicationLogs(JSON.parse(savedLogs));
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      hasHealthData: boolean;
      hasMedications: boolean;
      healthEntries: HealthEntry[];
      medicationCount: number;
    }> = [];

    // Add days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        hasHealthData: false,
        hasMedications: false,
        healthEntries: [],
        medicationCount: 0
      });
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayHealthEntries = healthData.filter(entry => entry.date === dateStr);
      const dayMedications = getMedicationsForDate(dateStr);
      
      days.push({
        date,
        isCurrentMonth: true,
        hasHealthData: dayHealthEntries.length > 0,
        hasMedications: dayMedications > 0,
        healthEntries: dayHealthEntries,
        medicationCount: dayMedications
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        hasHealthData: false,
        hasMedications: false,
        healthEntries: [],
        medicationCount: 0
      });
    }

    return days;
  };

  const getMedicationsForDate = (dateStr: string) => {
    return medications.filter(med => {
      const startDate = new Date(med.startDate);
      const endDate = med.endDate ? new Date(med.endDate) : null;
      const checkDate = new Date(dateStr);
      
      if (checkDate < startDate) return false;
      if (endDate && checkDate > endDate) return false;
      
      return true;
    }).length;
  };

  const getSelectedDateData = () => {
    if (!selectedDate) return null;
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayHealthEntries = healthData.filter(entry => entry.date === dateStr);
    const dayMedications = medications.filter(med => {
      const startDate = new Date(med.startDate);
      const endDate = med.endDate ? new Date(med.endDate) : null;
      
      if (selectedDate < startDate) return false;
      if (endDate && selectedDate > endDate) return false;
      
      return true;
    });

    const dayMedicationLogs = medicationLogs.filter(log => 
      log.takenAt.startsWith(dateStr)
    );

    return {
      healthEntries: dayHealthEntries,
      medications: dayMedications,
      medicationLogs: dayMedicationLogs
    };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const formatValue = (entry: HealthEntry) => {
    if (entry.type === 'blood_pressure') {
      return `${entry.systolic}/${entry.diastolic}`;
    }
    return `${entry.value}${entry.unit ? ` ${entry.unit}` : ''}`;
  };

  const getHealthIcon = (type: string) => {
    switch (type) {
      case 'blood_pressure': return <Heart className="h-3 w-3" />;
      case 'heart_rate': return <Activity className="h-3 w-3" />;
      case 'blood_sugar': return <Droplets className="h-3 w-3" />;
      case 'weight': return <Weight className="h-3 w-3" />;
      default: return null;
    }
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateData = getSelectedDateData();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div>
        <h2>Health Calendar</h2>
        <p className="text-muted-foreground">View your health data and medication schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {days.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`
                      p-2 text-sm border rounded-lg transition-colors relative min-h-[60px] flex flex-col items-center justify-start
                      ${!day.isCurrentMonth ? 'text-muted-foreground bg-muted/30' : ''}
                      ${isToday(day.date) ? 'border-chart-1 bg-chart-1/10' : ''}
                      ${isSelected(day.date) ? 'border-primary bg-primary/10' : ''}
                      ${day.isCurrentMonth ? 'hover:bg-muted/50' : ''}
                    `}
                  >
                    <span className={isToday(day.date) ? 'font-bold' : ''}>{day.date.getDate()}</span>
                    
                    {/* Indicators */}
                    <div className="flex flex-col items-center gap-1 mt-1">
                      {day.hasHealthData && (
                        <div className="w-1.5 h-1.5 bg-chart-2 rounded-full"></div>
                      )}
                      {day.hasMedications && (
                        <div className="w-1.5 h-1.5 bg-chart-3 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  <span>Health Data</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                  <span>Medications</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Select a date'}
              </CardTitle>
              <CardDescription>
                {selectedDate ? 'Health data and medications for this day' : 'Click on a date to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateData ? (
                <div className="space-y-4">
                  {/* Health Entries */}
                  {selectedDateData.healthEntries.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Health Readings</h4>
                      <div className="space-y-2">
                        {selectedDateData.healthEntries.map(entry => (
                          <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              {getHealthIcon(entry.type)}
                              <span className="text-sm capitalize">{entry.type.replace('_', ' ')}</span>
                            </div>
                            <Badge variant="outline">{formatValue(entry)}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  {selectedDateData.medications.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Medications</h4>
                      <div className="space-y-2">
                        {selectedDateData.medications.map(med => {
                          const takenLogs = selectedDateData.medicationLogs.filter(log => 
                            log.medicationId === med.id && log.status === 'taken'
                          );
                          
                          return (
                            <div key={med.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2">
                                <Pill className="h-3 w-3" />
                                <div>
                                  <div className="text-sm font-medium">{med.name}</div>
                                  <div className="text-xs text-muted-foreground">{med.dosage}</div>
                                </div>
                              </div>
                              <Badge variant={takenLogs.length > 0 ? 'default' : 'secondary'}>
                                {takenLogs.length > 0 ? 'Taken' : 'Scheduled'}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedDateData.healthEntries.length === 0 && selectedDateData.medications.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No health data or medications for this date
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Select a date from the calendar to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}