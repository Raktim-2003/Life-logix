import React, { useState, useEffect } from 'react';
import { Pill, Plus, Clock, Calendar, Trash2, Edit, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'client' | 'admin';
  uniqueId: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
  lastTaken?: string;
  reminders: boolean;
}

interface MedicationLog {
  id: string;
  medicationId: string;
  takenAt: string;
  scheduled: string;
  status: 'taken' | 'missed' | 'skipped';
  notes?: string;
}

interface MedicationReminderProps {
  user: User;
}

export function MedicationReminder({ user }: MedicationReminderProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: [''],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    reminders: true
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const savedMeds = localStorage.getItem('lifelogix_medications');
    const savedLogs = localStorage.getItem('lifelogix_medication_logs');

    if (savedMeds) {
      try {
        const parsedMeds = JSON.parse(savedMeds);
        // Validate that it's an array and each medication has required properties
        if (Array.isArray(parsedMeds)) {
          const validMeds = parsedMeds.filter(med => 
            med && 
            med.id && 
            med.name && 
            Array.isArray(med.times)
          );
          setMedications(validMeds);
        }
      } catch (error) {
        console.error('Error parsing saved medications:', error);
        // Clear corrupted data
        localStorage.removeItem('lifelogix_medications');
      }
    }

    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);
        // Validate that it's an array
        if (Array.isArray(parsedLogs)) {
          const validLogs = parsedLogs.filter(log => 
            log && 
            log.id && 
            log.medicationId
          );
          setMedicationLogs(validLogs);
        }
      } catch (error) {
        console.error('Error parsing saved medication logs:', error);
        // Clear corrupted data
        localStorage.removeItem('lifelogix_medication_logs');
      }
    }
  }, []);

  const saveMedications = (newMeds: Medication[]) => {
    setMedications(newMeds);
    localStorage.setItem('lifelogix_medications', JSON.stringify(newMeds));
  };

  const saveLogs = (newLogs: MedicationLog[]) => {
    setMedicationLogs(newLogs);
    localStorage.setItem('lifelogix_medication_logs', JSON.stringify(newLogs));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'daily',
      times: [''],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      reminders: true
    });
    setEditingMed(null);
  };

  const handleAddTime = () => {
    setFormData({
      ...formData,
      times: [...formData.times, '']
    });
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const handleRemoveTime = (index: number) => {
    if (formData.times.length > 1) {
      const newTimes = formData.times.filter((_, i) => i !== index);
      setFormData({ ...formData, times: newTimes });
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.dosage || formData.times.some(time => !time)) {
      setMessage('Please fill in all required fields');
      return;
    }

    const medication: Medication = {
      id: editingMed ? editingMed.id : `med_${Date.now()}`,
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      times: formData.times.sort(),
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      notes: formData.notes || undefined,
      reminders: formData.reminders
    };

    let updatedMeds;
    if (editingMed) {
      updatedMeds = medications.map(med => med.id === editingMed.id ? medication : med);
      setMessage('Medication updated successfully!');
    } else {
      updatedMeds = [...medications, medication];
      setMessage('Medication added successfully!');
    }

    saveMedications(updatedMeds);
    setShowAddDialog(false);
    resetForm();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (medication: Medication) => {
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      times: medication.times,
      startDate: medication.startDate,
      endDate: medication.endDate || '',
      notes: medication.notes || '',
      reminders: medication.reminders
    });
    setEditingMed(medication);
    setShowAddDialog(true);
  };

  const handleDelete = (id: string) => {
    const updatedMeds = medications.filter(med => med.id !== id);
    saveMedications(updatedMeds);
    
    // Also remove related logs
    const updatedLogs = medicationLogs.filter(log => log.medicationId !== id);
    saveLogs(updatedLogs);
    
    setMessage('Medication deleted successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const markAsTaken = (medication: Medication, scheduledTime: string) => {
    const log: MedicationLog = {
      id: `log_${Date.now()}`,
      medicationId: medication.id,
      takenAt: new Date().toISOString(),
      scheduled: scheduledTime,
      status: 'taken'
    };

    const updatedLogs = [...medicationLogs, log];
    saveLogs(updatedLogs);

    // Update last taken time
    const updatedMeds = medications.map(med => 
      med.id === medication.id 
        ? { ...med, lastTaken: new Date().toISOString() }
        : med
    );
    saveMedications(updatedMeds);

    setMessage('Medication marked as taken!');
    setTimeout(() => setMessage(''), 3000);
  };

  const getTodaysDoses = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysDoses: Array<{
      medication: Medication;
      time: string;
      status: 'pending' | 'taken' | 'overdue';
    }> = [];

    // Ensure medications is an array and filter out invalid entries
    if (!Array.isArray(medications)) {
      return todaysDoses;
    }

    medications.forEach(medication => {
      // Ensure medication has valid times array
      if (!medication || !Array.isArray(medication.times)) {
        return;
      }

      medication.times.forEach(time => {
        // Ensure time is a valid string
        if (!time || typeof time !== 'string') {
          return;
        }

        const scheduledDateTime = new Date(`${today}T${time}`);
        const now = new Date();
        
        // Check if already taken today
        const takenToday = Array.isArray(medicationLogs) && medicationLogs.some(log => 
          log &&
          log.medicationId === medication.id &&
          log.scheduled === time &&
          log.takenAt &&
          log.takenAt.startsWith(today) &&
          log.status === 'taken'
        );

        let status: 'pending' | 'taken' | 'overdue' = 'pending';
        if (takenToday) {
          status = 'taken';
        } else if (now > scheduledDateTime) {
          status = 'overdue';
        }

        todaysDoses.push({
          medication,
          time,
          status
        });
      });
    });

    return todaysDoses.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getUpcomingDoses = () => {
    try {
      const now = new Date();
      const todaysDoses = getTodaysDoses();
      
      if (!Array.isArray(todaysDoses)) {
        return [];
      }
      
      return todaysDoses.filter(dose => {
        if (!dose || !dose.time) {
          return false;
        }
        
        const scheduledDateTime = new Date(`${now.toISOString().split('T')[0]}T${dose.time}`);
        return scheduledDateTime > now && dose.status === 'pending';
      }).slice(0, 3);
    } catch (error) {
      console.error('Error getting upcoming doses:', error);
      return [];
    }
  };

  const todaysDoses = getTodaysDoses() || [];
  const upcomingDoses = getUpcomingDoses() || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Medication Reminders</h2>
          <p className="text-muted-foreground">Manage your medications and track adherence</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingMed ? 'Edit Medication' : 'Add New Medication'}</DialogTitle>
              <DialogDescription>
                Add details about your medication schedule
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="med-name">Medication Name</Label>
                <Input
                  id="med-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Lisinopril"
                />
              </div>

              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g., 10mg"
                />
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice-daily">Twice Daily</SelectItem>
                    <SelectItem value="three-times">Three Times Daily</SelectItem>
                    <SelectItem value="as-needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Times</Label>
                {formData.times.map((time, index) => (
                  <div key={index} className="flex items-center gap-2 mt-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                    />
                    {formData.times.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveTime(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTime}
                  className="mt-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Time
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date (optional)</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingMed ? 'Update' : 'Add'} Medication
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-chart-1" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Your medication schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            {todaysDoses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No medications scheduled for today
              </p>
            ) : (
              <div className="space-y-3">
                {todaysDoses.map((dose, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        dose.status === 'taken' ? 'bg-green-100 text-green-600' :
                        dose.status === 'overdue' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {dose.status === 'taken' ? <CheckCircle className="h-4 w-4" /> :
                         dose.status === 'overdue' ? <AlertCircle className="h-4 w-4" /> :
                         <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-medium">{dose.medication.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {dose.medication.dosage} at {dose.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        dose.status === 'taken' ? 'default' :
                        dose.status === 'overdue' ? 'destructive' :
                        'secondary'
                      }>
                        {dose.status}
                      </Badge>
                      {dose.status !== 'taken' && (
                        <Button
                          size="sm"
                          onClick={() => markAsTaken(dose.medication, dose.time)}
                        >
                          Mark Taken
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medication List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-chart-2" />
              Your Medications
            </CardTitle>
            <CardDescription>Manage your medication list</CardDescription>
          </CardHeader>
          <CardContent>
            {medications.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No medications added yet. Click "Add Medication" to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {medications.map((medication) => (
                  <div key={medication.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{medication.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {medication.dosage} - {medication.frequency}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Times: {medication.times.join(', ')}
                        </div>
                        {medication.notes && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {medication.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(medication)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(medication.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reminders */}
      {upcomingDoses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-chart-3" />
              Upcoming Reminders
            </CardTitle>
            <CardDescription>Next medications due today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingDoses.map((dose, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="font-medium">{dose.medication.name}</div>
                  <div className="text-sm text-muted-foreground">{dose.medication.dosage}</div>
                  <div className="text-sm text-chart-3 mt-1">Due at {dose.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}