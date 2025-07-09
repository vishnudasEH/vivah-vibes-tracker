
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Calendar, 
  CheckSquare, 
  Users, 
  DollarSign, 
  Heart,
  Clock,
  TrendingUp,
  Gift,
  Store
} from "lucide-react";

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  totalGuests: number;
  confirmedGuests: number;
  totalBudget: number;
  spentBudget: number;
  totalVendors: number;
  paidVendors: number;
  upcomingEvents: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    totalBudget: 0,
    spentBudget: 0,
    totalVendors: 0,
    paidVendors: 0,
    upcomingEvents: 0,
  });

  // Mock data for the wedding date - you can make this dynamic later
  const weddingDate = new Date('2024-12-15');
  const today = new Date();
  const daysLeft = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch budget data
      const { data: budgetData } = await supabase
        .from('budget_categories')
        .select('estimated_amount, actual_amount');

      // Fetch vendor data  
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('payment_status');

      // Fetch events data
      const { data: eventsData } = await supabase
        .from('events')
        .select('event_date')
        .gte('event_date', new Date().toISOString().split('T')[0]);

      const totalBudget = budgetData?.reduce((sum, cat) => sum + cat.estimated_amount, 0) || 0;
      const spentBudget = budgetData?.reduce((sum, cat) => sum + cat.actual_amount, 0) || 0;
      const totalVendors = vendorData?.length || 0;
      const paidVendors = vendorData?.filter(v => v.payment_status === 'paid').length || 0;
      const upcomingEvents = eventsData?.length || 0;

      setStats({
        totalTasks: 47, // Mock data - replace when tasks table is created
        completedTasks: 23, // Mock data
        totalGuests: 200, // Mock data - from existing GuestTracker
        confirmedGuests: 156, // Mock data
        totalBudget,
        spentBudget,
        totalVendors,
        paidVendors,
        upcomingEvents,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const taskProgress = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
  const rsvpProgress = stats.totalGuests > 0 ? (stats.confirmedGuests / stats.totalGuests) * 100 : 0;
  const budgetProgress = stats.totalBudget > 0 ? (stats.spentBudget / stats.totalBudget) * 100 : 0;
  const vendorProgress = stats.totalVendors > 0 ? (stats.paidVendors / stats.totalVendors) * 100 : 0;

  // Chart data
  const progressData = [
    { name: 'Tasks', completed: stats.completedTasks, total: stats.totalTasks, color: '#8884d8' },
    { name: 'RSVPs', completed: stats.confirmedGuests, total: stats.totalGuests, color: '#82ca9d' },
    { name: 'Vendors', completed: stats.paidVendors, total: stats.totalVendors, color: '#ffc658' },
  ];

  const budgetData = [
    { name: 'Spent', value: stats.spentBudget, color: '#ff7c7c' },
    { name: 'Remaining', value: Math.max(0, stats.totalBudget - stats.spentBudget), color: '#8dd1e1' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Wedding Countdown */}
      <Card className="bg-gradient-celebration text-white shadow-warm">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-8 w-8" />
            <h2 className="text-3xl font-bold">Wedding Countdown</h2>
            <Heart className="h-8 w-8" />
          </div>
          <div className="text-6xl font-bold mb-2">{daysLeft > 0 ? daysLeft : 0}</div>
          <p className="text-xl opacity-90">Days to go!</p>
          <p className="text-lg opacity-80 mt-2">December 15, 2024</p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-elegant transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Progress</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.completedTasks}/{stats.totalTasks}
            </div>
            <Progress value={taskProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(taskProgress)}% completed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guest RSVPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {stats.confirmedGuests}/{stats.totalGuests}
            </div>
            <Progress value={rsvpProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(rsvpProgress)}% confirmed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              ₹{(stats.spentBudget / 1000).toFixed(0)}k
            </div>
            <Progress value={budgetProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              of ₹{(stats.totalBudget / 1000).toFixed(0)}k budget
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors Paid</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.paidVendors}/{stats.totalVendors}
            </div>
            <Progress value={vendorProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(vendorProgress)}% paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#8884d8" name="Completed" />
                <Bar dataKey="total" fill="#e0e0e0" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Venue booking confirmed</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Photographer contract signed</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Invitation cards ordered</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border border-primary/20 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Final menu tasting</p>
                  <p className="text-xs text-muted-foreground">Due in 3 days</p>
                </div>
                <Button size="sm" variant="outline">Mark Done</Button>
              </div>
              <div className="flex items-center gap-3 p-3 border border-secondary/20 rounded-lg">
                <Users className="h-4 w-4 text-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Send final guest list to caterer</p>
                  <p className="text-xs text-muted-foreground">Due in 5 days</p>
                </div>
                <Button size="sm" variant="outline">Mark Done</Button>
              </div>
              <div className="flex items-center gap-3 p-3 border border-accent/20 rounded-lg">
                <Gift className="h-4 w-4 text-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Pick up bridal outfits</p>
                  <p className="text-xs text-muted-foreground">Due in 1 week</p>
                </div>
                <Button size="sm" variant="outline">Mark Done</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <CheckSquare className="h-6 w-6" />
              Add Task
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              Add Guest
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Store className="h-6 w-6" />
              Add Vendor
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              Add Expense
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
