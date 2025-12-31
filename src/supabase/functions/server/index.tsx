import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3a29cf58/health", (c) => {
  return c.json({ status: "ok" });
});

// Register user endpoint
app.post("/make-server-3a29cf58/auth/register", async (c) => {
  try {
    const { email, password, name, userType = 'client' } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        userType,
        uniqueId: `${userType.toUpperCase()}_${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      },
      email_confirm: true
    });

    if (error) {
      console.log('Registration error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user data
    await kv.set(`user_profile_${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      userType,
      uniqueId: data.user.user_metadata.uniqueId,
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      message: 'User created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
        userType: data.user.user_metadata.userType,
        uniqueId: data.user.user_metadata.uniqueId
      }
    });
  } catch (error) {
    console.log('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Login endpoint
app.post("/make-server-3a29cf58/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Check for admin credentials - Updated to Admin/Admin
    if (email === 'Admin' && password === 'Admin') {
      return c.json({
        success: true,
        user: {
          id: 'admin',
          email: 'admin@lifelogix.com',
          name: 'Administrator',
          userType: 'admin',
          uniqueId: 'ADMIN_001'
        },
        session: { access_token: 'admin_token' }
      });
    }

    // Regular user login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Login error:', error);
      return c.json({ error: error.message }, 401);
    }

    // Get user profile
    const profile = await kv.get(`user_profile_${data.user.id}`);

    return c.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
        userType: data.user.user_metadata.userType || 'client',
        uniqueId: data.user.user_metadata.uniqueId,
        ...profile
      },
      session: data.session
    });
  } catch (error) {
    console.log('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Get all users (admin only)
app.get("/make-server-3a29cf58/admin/users", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || authHeader !== 'Bearer admin_token') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all user profiles
    const userProfiles = await kv.getByPrefix('user_profile_');
    
    // Get all health data
    const healthDataEntries = await kv.getByPrefix('health_data_');
    
    // Get all medications
    const medicationEntries = await kv.getByPrefix('medications_');

    const users = userProfiles.map(profile => {
      const userId = profile.id;
      const healthData = healthDataEntries.filter(entry => 
        entry.key.includes(userId)
      );
      const medications = medicationEntries.filter(entry => 
        entry.key.includes(userId)
      );

      return {
        ...profile,
        healthRecords: healthData.length,
        medications: medications.length,
        lastLogin: profile.lastLogin || 'Never'
      };
    });

    return c.json({ users });
  } catch (error) {
    console.log('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Update admin credentials
app.put("/make-server-3a29cf58/admin/credentials", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || authHeader !== 'Bearer admin_token') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { newEmail, newPassword } = await c.req.json();
    
    // Store new admin credentials
    await kv.set('admin_credentials', {
      email: newEmail,
      password: newPassword,
      updatedAt: new Date().toISOString()
    });

    return c.json({ message: 'Admin credentials updated successfully' });
  } catch (error) {
    console.log('Error updating admin credentials:', error);
    return c.json({ error: 'Failed to update credentials' }, 500);
  }
});

// Save health data
app.post("/make-server-3a29cf58/health/save", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { userId, healthData } = await c.req.json();
    
    await kv.set(`health_data_${userId}`, healthData);
    
    return c.json({ message: 'Health data saved successfully' });
  } catch (error) {
    console.log('Error saving health data:', error);
    return c.json({ error: 'Failed to save health data' }, 500);
  }
});

// Get health data
app.get("/make-server-3a29cf58/health/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const healthData = await kv.get(`health_data_${userId}`);
    
    return c.json({ healthData: healthData || [] });
  } catch (error) {
    console.log('Error fetching health data:', error);
    return c.json({ error: 'Failed to fetch health data' }, 500);
  }
});

// Save doctor appointment
app.post("/make-server-3a29cf58/appointments/save", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const appointment = await c.req.json();
    const appointmentId = `appointment_${Date.now()}`;
    
    await kv.set(appointmentId, {
      ...appointment,
      id: appointmentId,
      createdAt: new Date().toISOString()
    });
    
    return c.json({ message: 'Appointment booked successfully', appointmentId });
  } catch (error) {
    console.log('Error saving appointment:', error);
    return c.json({ error: 'Failed to book appointment' }, 500);
  }
});

// Get user appointments
app.get("/make-server-3a29cf58/appointments/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const appointments = await kv.getByPrefix('appointment_');
    
    const userAppointments = appointments.filter(apt => apt.userId === userId);
    
    return c.json({ appointments: userAppointments });
  } catch (error) {
    console.log('Error fetching appointments:', error);
    return c.json({ error: 'Failed to fetch appointments' }, 500);
  }
});

Deno.serve(app.fetch);