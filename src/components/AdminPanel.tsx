import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Key,
  Download,
  Eye,
  FileText,
  Calendar,
  Activity,
  Database,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Server,
  Heart,
  Pill,
  Stethoscope,
  BarChart3,
  AlertCircle,
  Clock,
  UserPlus,
  RefreshCw,
  Settings,
  Bell,
  Monitor,
  Globe,
  Wifi,
  HardDrive,
  Cpu,
  Timer,
  LogIn,
  LogOut,
  UserCheck,
  Filter,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Lock,
  Unlock,
  EyeOff,
  Copy,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { AuthManager } from "../utils/authSecurity";
import { NotificationManager } from "../utils/notificationSystem";
import { UserStorageManager } from "../utils/userStorage";

interface User {
  id: string;
  email: string;
  name: string;
  userType: string;
  uniqueId: string;
  healthRecords: number;
  medications: number;
  lastLogin: string;
  createdAt?: string;
  age?: number;
  weight?: number;
  height?: number;
  conditions?: string[];
  lastHealthEntry?: string;
  averageBloodPressure?: string;
  averageHeartRate?: number;
  criticalAlerts?: number;
  status?: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  userType: "admin";
  uniqueId: string;
}

interface AdminPanelProps {
  user: AdminUser;
  onUpdateCredentials: (newCredentials: {
    email: string;
    name: string;
  }) => void;
}

export function AdminPanel({
  user,
  onUpdateCredentials,
}: AdminPanelProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sessionStats, setSessionStats] = useState(
    AuthManager.getSessionStats(),
  );
  const [selectedUser, setSelectedUser] = useState<User | null>(
    null,
  );
  const [notificationStats, setNotificationStats] = useState(
    NotificationManager.getNotificationStats(),
  );
  const [notifications, setNotifications] = useState(
    NotificationManager.getRecentNotifications(20),
  );
  const [greetingData, setGreetingData] = useState(
    NotificationManager.getGreetingBasedOnTime(),
  );
  const [userStats, setUserStats] = useState(
    UserStorageManager.getUserStats(),
  );

  // Get real registered users
  const [allUsers, setAllUsers] = useState(
    UserStorageManager.getAllUsers(),
  );

  // Convert stored users to display format
  const [users, setUsers] = useState<User[]>(
    allUsers.map((storedUser) => ({
      id: storedUser.id,
      email: storedUser.email,
      name: storedUser.name,
      userType: storedUser.userType,
      uniqueId: storedUser.uniqueId,
      healthRecords: storedUser.healthRecords,
      medications: Array.isArray(storedUser.medications) ? storedUser.medications.length : 0,
      lastLogin: storedUser.lastLogin,
      createdAt: storedUser.registrationDate,
      age: storedUser.age,
      weight: storedUser.weight,
      height: storedUser.height,
      conditions: Array.isArray(storedUser.conditions) ? storedUser.conditions : [],
      lastHealthEntry: storedUser.lastHealthEntry,
      averageBloodPressure: storedUser.averageBloodPressure,
      averageHeartRate: storedUser.averageHeartRate,
      criticalAlerts: storedUser.criticalAlerts,
      status: storedUser.status,
    })),
  );

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Refresh all data
    const updatedUsers = UserStorageManager.getAllUsers();
    const updatedUserDisplay = updatedUsers.map(
      (storedUser) => ({
        id: storedUser.id,
        email: storedUser.email,
        name: storedUser.name,
        userType: storedUser.userType,
        uniqueId: storedUser.uniqueId,
        healthRecords: storedUser.healthRecords,
        medications: Array.isArray(storedUser.medications) ? storedUser.medications.length : 0,
        lastLogin: storedUser.lastLogin,
        createdAt: storedUser.registrationDate,
        age: storedUser.age,
        weight: storedUser.weight,
        height: storedUser.height,
        conditions: Array.isArray(storedUser.conditions) ? storedUser.conditions : [],
        lastHealthEntry: storedUser.lastHealthEntry,
        averageBloodPressure: storedUser.averageBloodPressure,
        averageHeartRate: storedUser.averageHeartRate,
        criticalAlerts: storedUser.criticalAlerts,
        status: storedUser.status,
      }),
    );

    setAllUsers(updatedUsers);
    setUsers(updatedUserDisplay);
    setUserStats(UserStorageManager.getUserStats());
    setSessionStats(AuthManager.getSessionStats());
    setNotificationStats(
      NotificationManager.getNotificationStats(),
    );
    setNotifications(
      NotificationManager.getRecentNotifications(20),
    );
    setGreetingData(
      NotificationManager.getGreetingBasedOnTime(),
    );
    setRefreshing(false);
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      const updatedUsers = UserStorageManager.getAllUsers();
      setAllUsers(updatedUsers);
      setUserStats(UserStorageManager.getUserStats());
      setSessionStats(AuthManager.getSessionStats());
      setNotificationStats(
        NotificationManager.getNotificationStats(),
      );
      setGreetingData(
        NotificationManager.getGreetingBasedOnTime(),
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getHealthScore = (user: User) => {
    let score = 100;
    if (user.criticalAlerts && user.criticalAlerts > 0)
      score -= user.criticalAlerts * 10;
    if (!user.lastHealthEntry) score -= 20;
    const daysSinceEntry = user.lastHealthEntry
      ? Math.floor(
          (Date.now() -
            new Date(user.lastHealthEntry).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 30;
    if (daysSinceEntry > 7)
      score -= Math.min(daysSinceEntry * 2, 30);
    return Math.max(score, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-yellow-500";
      case "suspended":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-red-500 bg-red-50 dark:bg-red-950/20";
      case "high":
        return "border-orange-500 bg-orange-50 dark:bg-orange-950/20";
      case "medium":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
      default:
        return "border-blue-500 bg-blue-50 dark:bg-blue-950/20";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "health":
        return Heart;
      case "medication":
        return Pill;
      case "system":
        return Server;
      case "security":
        return ShieldAlert;
      case "appointment":
        return Calendar;
      default:
        return Bell;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.uniqueId
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Time-based Greeting */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-chart-1" />
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
                {greetingData.greeting},{" "}
                {user.name.split(" ")[0]} {greetingData.icon}
              </h2>
              <p className="text-muted-foreground">
                Administrator Dashboard - {greetingData.period}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="flex items-center gap-2"
          >
            <Bell className="h-3 w-3" />
            {notificationStats.unread} Unread
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Badge
            variant="outline"
            className="flex items-center gap-1"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Online
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 h-auto">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger
            value="credentials"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <Key className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">
              Credentials
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="sessions"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <Monitor className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Sessions</span>
          </TabsTrigger>
          <TabsTrigger
            value="medications"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <Pill className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">
              Medications
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">
              Notifications
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="health"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Health</span>
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <Server className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userStats.totalClients} clients,{" "}
                  {userStats.totalAdmins} admins
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Sessions
                </CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sessionStats.totalActiveSessions}
                </div>
                <p className="text-xs text-muted-foreground">
                  {sessionStats.recentLogins} recent logins
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Notifications
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {notificationStats.unread}
                </div>
                <p className="text-xs text-muted-foreground">
                  {notificationStats.actionRequired} need action
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Critical Alerts
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {userStats.criticalAlerts}
                </div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
                <CardDescription>
                  Latest user logins and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessionStats.sessions
                    .slice(0, 5)
                    .map((session, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {session.maskedInfo.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {session.maskedInfo.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.maskedInfo.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium">
                            {new Date(
                              session.loginTime,
                            ).toLocaleDateString()}
                          </p>
                          <Badge
                            variant={
                              session.userType === "admin"
                                ? "destructive"
                                : "default"
                            }
                            className="text-xs"
                          >
                            {session.userType}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>
                  Latest system alerts and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications
                    .slice(0, 5)
                    .map((notification) => {
                      const IconComponent = getNotificationIcon(
                        notification.type,
                      );
                      return (
                        <div
                          key={notification.id}
                          className="flex items-start gap-3 p-2 hover:bg-muted/30 rounded-lg transition-colors"
                        >
                          <IconComponent className="h-4 w-4 mt-1 text-chart-1" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(
                                notification.timestamp,
                              )}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">
                  Inactive
                </SelectItem>
                <SelectItem value="suspended">
                  Suspended
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and monitor health data
                access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Unique ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Health Score</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((userData) => (
                      <TableRow key={userData.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {userData.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {userData.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {userData.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-mono"
                          >
                            {userData.uniqueId}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${getStatusColor(userData.status || "active")}`}
                            />
                            <span className="capitalize">
                              {userData.status || "active"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={getHealthScore(userData)}
                              className="w-16"
                            />
                            <span className="text-sm">
                              {getHealthScore(userData)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {formatDateTime(
                                userData.lastLogin,
                              )}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedUser(userData)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    User Details -{" "}
                                    {userData.name}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Complete user profile and
                                    health information
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="font-medium mb-2">
                                        Personal Information
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span>Name:</span>
                                          <span>
                                            {
                                              userData.name
                                            }
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Email:</span>
                                          <span>
                                            {
                                              userData.email
                                            }
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>
                                            Unique ID:
                                          </span>
                                          <Badge variant="outline">
                                            {
                                              userData.uniqueId
                                            }
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Age:</span>
                                          <span>
                                            {userData.age ||
                                              "N/A"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Weight:</span>
                                          <span>
                                            {userData.weight
                                              ? `${userData.weight} kg`
                                              : "N/A"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Height:</span>
                                          <span>
                                            {userData.height
                                              ? `${userData.height} cm`
                                              : "N/A"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="font-medium mb-2">
                                        Health Data
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span>
                                            Health Records:
                                          </span>
                                          <span>
                                            {
                                              userData.healthRecords
                                            }
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>
                                            Medications:
                                          </span>
                                          <span>
                                            {
                                              userData.medications
                                            }
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>
                                            Avg. Blood
                                            Pressure:
                                          </span>
                                          <span>
                                            {userData.averageBloodPressure ||
                                              "N/A"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>
                                            Avg. Heart Rate:
                                          </span>
                                          <span>
                                            {userData.averageHeartRate
                                              ? `${userData.averageHeartRate} bpm`
                                              : "N/A"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>
                                            Critical Alerts:
                                          </span>
                                          <Badge
                                            variant={
                                              userData.criticalAlerts &&
                                              userData.criticalAlerts >
                                                0
                                                ? "destructive"
                                                : "default"
                                            }
                                          >
                                            {userData.criticalAlerts ||
                                              0}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    {userData.conditions &&
                                      userData.conditions
                                        .length > 0 && (
                                        <div>
                                          <h4 className="font-medium mb-2">
                                            Health Conditions
                                          </h4>
                                          <div className="flex flex-wrap gap-1">
                                            {userData.conditions?.map(
                                              (
                                                condition,
                                                index,
                                              ) => (
                                                <Badge
                                                  key={index}
                                                  variant="outline"
                                                  className="text-xs"
                                                >
                                                  {condition}
                                                </Badge>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credentials Tab - SECURITY WARNING */}
        <TabsContent value="credentials" className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription>
              <strong>🔒 SECURITY NOTICE:</strong> This section
              displays user account information for administrative
              purposes only. Passwords are never displayed or exposed
              in this interface, following industry-standard security
              best practices.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-500" />
                User Account Information (ADMIN ONLY)
              </CardTitle>
              <CardDescription>
                View user account details and health information.
                Passwords are never displayed for security reasons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {allUsers.map((user, index) => (
                    <Card
                      key={user.id}
                      className="border-l-4 border-l-chart-1"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" />#
                            {index + 1} - {user.name}
                          </CardTitle>
                          <Badge
                            variant={
                              user.userType === "admin"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {user.userType}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">
                              Email:
                            </Label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {user.email}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(user.email)
                                }
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">
                              Unique ID:
                            </Label>
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              {user.uniqueId}
                            </Badge>
                          </div>

                          {user.conditions &&
                            user.conditions.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium mb-2 block">
                                  Health Conditions:
                                </Label>
                                <div className="flex flex-wrap gap-1">
                                  {user.conditions?.map(
                                    (condition, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {condition}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {user.medications &&
                            user.medications.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium mb-2 block">
                                  Current Medications:
                                </Label>
                                <div className="space-y-1">
                                  {user.medications.map(
                                    (medication, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-2"
                                      >
                                        <Pill className="h-3 w-3 text-chart-1" />
                                        <span className="text-xs">
                                          {medication}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Sessions
                </CardTitle>
                <LogIn className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {sessionStats.totalActiveSessions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently online
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Client Sessions
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {sessionStats.clientSessions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Regular users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Admin Sessions
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {sessionStats.adminSessions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Administrators
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Live Session Monitor</CardTitle>
              <CardDescription>
                Real-time view of all active user sessions.
                Passwords are never displayed for security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Login Time</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>User Agent</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionStats.sessions.map(
                      (session, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {session.maskedInfo.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {session.maskedInfo.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {session.maskedInfo.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {session.sessionId.substring(
                                0,
                                12,
                              )}
                              ...
                            </code>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">
                                {formatDateTime(
                                  session.loginTime,
                                )}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">
                                {formatDateTime(
                                  session.lastActivity,
                                )}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px]">
                              <p className="text-xs text-muted-foreground truncate">
                                {session.userAgent?.substring(
                                  0,
                                  50,
                                )}
                                ...
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                session.userType === "admin"
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              {session.userType}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab - User Medication Profiles */}
        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Medication Profiles</CardTitle>
              <CardDescription>
                Overview of all users' current medications and
                prescriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {allUsers
                  .filter(
                    (user) =>
                      user.medications &&
                      user.medications.length > 0,
                  )
                  .map((user) => (
                    <Card
                      key={user.id}
                      className="border-l-4 border-l-chart-2"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {user.name}
                          </CardTitle>
                          <Badge variant="outline">
                            {user.medications || 0}{" "}
                            medications
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground mb-3">
                            <span className="font-medium">
                              Email:
                            </span>{" "}
                            {user.email}
                          </div>

                          {user.conditions &&
                            user.conditions.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium mb-2 block">
                                  Health Conditions:
                                </Label>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {user.conditions?.map(
                                    (condition, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        <Heart className="h-3 w-3 mr-1" />
                                        {condition}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          <div>
                            <Label className="text-sm font-medium mb-2 block">
                              Current Medications:
                            </Label>
                            <div className="space-y-2">
                              {user.medications?.map(
                                (medication, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Pill className="h-4 w-4 text-chart-2" />
                                      <span className="text-sm font-medium">
                                        {medication}
                                      </span>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Active
                                    </Badge>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Last Updated:
                              </span>
                              <span>
                                {formatDateTime(
                                  new Date().toISOString(),
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent
          value="notifications"
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Notifications
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {notificationStats.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  All notifications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Unread
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {notificationStats.unread}
                </div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Action Required
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {notificationStats.actionRequired}
                </div>
                <p className="text-xs text-muted-foreground">
                  Urgent items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Health Alerts
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {notificationStats.byCategory.health}
                </div>
                <p className="text-xs text-muted-foreground">
                  Health related
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Latest system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(
                    notification.type,
                  );
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border-l-4 ${getPriorityColor(notification.priority)} transition-all hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <IconComponent className="h-5 w-5 mt-0.5 text-chart-1" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">
                                {notification.title}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {notification.category}
                              </Badge>
                              <Badge
                                variant={
                                  notification.priority ===
                                  "critical"
                                    ? "destructive"
                                    : "outline"
                                }
                                className="text-xs"
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                {formatDateTime(
                                  notification.timestamp,
                                )}
                              </span>
                              {notification.userId && (
                                <span>
                                  User:{" "}
                                  {allUsers.find(
                                    (u) =>
                                      u.id ===
                                      notification.userId,
                                  )?.name || "Unknown"}
                                </span>
                              )}
                              {notification.actionRequired && (
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  Action Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              NotificationManager.markAsRead(
                                notification.id,
                              )
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Health Score
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(
                    users.reduce(
                      (sum, user) => sum + getHealthScore(user),
                      0,
                    ) / users.length,
                  )}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  System average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Medications
                </CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {allUsers.reduce(
                    (sum, user) =>
                      sum + (Array.isArray(user.medications) ? user.medications.length : (user.medications || 0)),
                    0,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total prescriptions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Health Conditions
                </CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {allUsers.reduce(
                    (sum, user) =>
                      sum + (user.conditions?.length || 0),
                    0,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tracked conditions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Entries
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    users.filter(
                      (user) =>
                        user.lastHealthEntry &&
                        Date.now() -
                          new Date(
                            user.lastHealthEntry,
                          ).getTime() <
                          7 * 24 * 60 * 60 * 1000,
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Health Overview</CardTitle>
              <CardDescription>
                Monitor user health metrics and identify trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((userData) => (
                  <div
                    key={userData.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {userData.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {userData.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {userData.conditions?.join(", ") ||
                            "No conditions"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Health Score
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={getHealthScore(userData)}
                            className="w-20"
                          />
                          <span className="text-sm">
                            {getHealthScore(userData)}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Critical Alerts
                        </p>
                        <Badge
                          variant={
                            userData.criticalAlerts &&
                            userData.criticalAlerts > 0
                              ? "destructive"
                              : "default"
                          }
                        >
                          {userData.criticalAlerts || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Server Status
                </CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">
                    Online
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  99.9% uptime
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Storage Used
                </CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3 GB</div>
                <Progress value={23} className="mt-2" />
                <p className="text-xs text-muted-foreground">
                  of 10 GB
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  API Requests
                </CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Response Time
                </CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">120ms</div>
                <p className="text-xs text-muted-foreground">
                  Average
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Overall system performance and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All systems operational. No issues detected.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Account Settings</CardTitle>
              <CardDescription>
                Manage your administrator account preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-name">
                    Display Name
                  </Label>
                  <Input
                    id="admin-name"
                    defaultValue={user.name}
                    placeholder="Enter display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    defaultValue={user.email}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">
                  Account Information (Read-Only)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Unique ID:
                    </span>
                    <Badge
                      variant="outline"
                      className="ml-2 font-mono"
                    >
                      {user.uniqueId}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Account Type:
                    </span>
                    <Badge
                      variant="destructive"
                      className="ml-2"
                    >
                      Administrator
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button>Save Changes</Button>
                <Button variant="outline">
                  Reset Password
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const exportData =
                      UserStorageManager.exportUserData();
                    const blob = new Blob([exportData], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "lifelogix-users-export.json";
                    a.click();
                  }}
                >
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Add demo users for testing
                    const demoUsers = [
                      {
                        email: "john.doe@lifelogix.com",
                        name: "John Doe",
                        password: "Demo@123",
                        userType: "client" as const,
                      },
                      {
                        email: "sarah.wilson@lifelogix.com",
                        name: "Sarah Wilson",
                        password: "Demo@456",
                        userType: "client" as const,
                      },
                    ];

                    demoUsers.forEach((userData) => {
                      if (
                        !UserStorageManager.getUserByEmail(
                          userData.email,
                        )
                      ) {
                        UserStorageManager.registerUser(
                          userData,
                        );
                      }
                    });

                    refreshData();
                  }}
                >
                  Add Demo Users
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}