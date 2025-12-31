import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Download, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  name: string;
  uniqueId: string;
}

interface Appointment {
  id: string;
  userId: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

interface DoctorReport {
  id: string;
  appointmentId: string;
  diagnosis: string;
  prescription: string;
  recommendations: string;
  nextVisit?: string;
  createdAt: string;
}

interface DoctorAppointmentsProps {
  user: User;
}

export function DoctorAppointments({ user }: DoctorAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<DoctorReport[]>([]);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });

  useEffect(() => {
    loadAppointments();
    loadReports();
  }, []);

  const loadAppointments = () => {
    // Load from localStorage for now
    const saved = localStorage.getItem(`appointments_${user.id}`);
    if (saved) {
      setAppointments(JSON.parse(saved));
    } else {
      // Sample data for demo
      const sampleAppointments: Appointment[] = [
        {
          id: 'apt_1',
          userId: user.id,
          doctorName: 'Dr. Sarah Johnson',
          specialty: 'Cardiology',
          appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          appointmentTime: '10:00',
          reason: 'Regular checkup and blood pressure monitoring',
          status: 'scheduled',
          createdAt: new Date().toISOString()
        }
      ];
      setAppointments(sampleAppointments);
      localStorage.setItem(`appointments_${user.id}`, JSON.stringify(sampleAppointments));
    }
  };

  const loadReports = () => {
    // Load from localStorage for now
    const saved = localStorage.getItem(`doctor_reports_${user.id}`);
    if (saved) {
      setReports(JSON.parse(saved));
    } else {
      // Sample report for demo
      const sampleReports: DoctorReport[] = [
        {
          id: 'report_1',
          appointmentId: 'apt_previous',
          diagnosis: 'Mild Hypertension (Stage 1)',
          prescription: 'Lisinopril 10mg once daily, Lifestyle modifications',
          recommendations: 'Reduce sodium intake, increase physical activity, monitor BP daily, lose 5-10 lbs',
          nextVisit: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setReports(sampleReports);
      localStorage.setItem(`doctor_reports_${user.id}`, JSON.stringify(sampleReports));
    }
  };

  const handleBookAppointment = async () => {
    if (!formData.doctorName || !formData.specialty || !formData.appointmentDate || !formData.appointmentTime || !formData.reason) {
      setMessage('Please fill in all required fields');
      return;
    }

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      userId: user.id,
      doctorName: formData.doctorName,
      specialty: formData.specialty,
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      reason: formData.reason,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    try {
      // For now, save to localStorage. In real app, save to backend
      const updatedAppointments = [...appointments, newAppointment];
      setAppointments(updatedAppointments);
      localStorage.setItem(`appointments_${user.id}`, JSON.stringify(updatedAppointments));

      setMessage('Appointment booked successfully!');
      setShowBookingDialog(false);
      setFormData({
        doctorName: '',
        specialty: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: ''
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      setMessage('Failed to book appointment');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const downloadReport = (report: DoctorReport) => {
    const reportData = {
      patientName: user.name,
      patientId: user.uniqueId,
      reportDate: new Date(report.createdAt).toLocaleDateString(),
      diagnosis: report.diagnosis,
      prescription: report.prescription,
      recommendations: report.recommendations,
      nextVisit: report.nextVisit ? new Date(report.nextVisit).toLocaleDateString() : 'Not scheduled',
      generatedAt: new Date().toISOString()
    };

    const reportText = `
MEDICAL REPORT
==============

Patient Name: ${reportData.patientName}
Patient ID: ${reportData.patientId}
Report Date: ${reportData.reportDate}

DIAGNOSIS:
${reportData.diagnosis}

PRESCRIPTION:
${reportData.prescription}

RECOMMENDATIONS:
${reportData.recommendations}

NEXT VISIT:
${reportData.nextVisit}

---
Report generated on ${new Date(reportData.generatedAt).toLocaleString()}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical-report-${user.uniqueId}-${report.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage('Report downloaded successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= today && apt.status === 'scheduled';
    }).sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  };

  const getPastAppointments = () => {
    const today = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate < today || apt.status !== 'scheduled';
    }).sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
  };

  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = getPastAppointments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Doctor Appointments</h2>
          <p className="text-muted-foreground">Manage your medical appointments and access reports</p>
        </div>
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>Schedule a new appointment with your doctor</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="doctor-name">Doctor Name</Label>
                <Input
                  id="doctor-name"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  placeholder="Dr. John Smith"
                />
              </div>

              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Select value={formData.specialty} onValueChange={(value) => setFormData({ ...formData, specialty: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="endocrinology">Endocrinology</SelectItem>
                    <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                    <SelectItem value="family-medicine">Family Medicine</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="dermatology">Dermatology</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointment-date">Date</Label>
                  <Input
                    id="appointment-date"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="appointment-time">Time</Label>
                  <Input
                    id="appointment-time"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe the reason for your appointment..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookAppointment}>
                Book Appointment
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

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="reports">Medical Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-chart-1" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Your scheduled medical appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming appointments</p>
                  <p className="text-sm">Book an appointment to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{appointment.doctorName}</h4>
                            <Badge variant="outline">{appointment.specialty}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(appointment.appointmentDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {appointment.appointmentTime}
                            </span>
                          </div>
                          <p className="text-sm">{appointment.reason}</p>
                        </div>
                        <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
              <CardDescription>Your past medical appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {pastAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointment history</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{appointment.doctorName}</h4>
                            <Badge variant="outline">{appointment.specialty}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(appointment.appointmentDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {appointment.appointmentTime}
                            </span>
                          </div>
                          <p className="text-sm">{appointment.reason}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            appointment.status === 'completed' ? 'default' : 
                            appointment.status === 'cancelled' ? 'destructive' : 'secondary'
                          }>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-chart-3" />
                Medical Reports
              </CardTitle>
              <CardDescription>Download and view your medical reports</CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No medical reports available</p>
                  <p className="text-sm">Reports will appear here after your doctor visits</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">Medical Report</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Diagnosis:</span>
                              <p className="text-muted-foreground">{report.diagnosis}</p>
                            </div>
                            <div>
                              <span className="font-medium">Prescription:</span>
                              <p className="text-muted-foreground">{report.prescription}</p>
                            </div>
                            <div>
                              <span className="font-medium">Recommendations:</span>
                              <p className="text-muted-foreground">{report.recommendations}</p>
                            </div>
                            {report.nextVisit && (
                              <div>
                                <span className="font-medium">Next Visit:</span>
                                <p className="text-muted-foreground">
                                  {new Date(report.nextVisit).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Report Date: {new Date(report.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadReport(report)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}