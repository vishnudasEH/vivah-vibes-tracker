
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
  Store,
  Loader2
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
  const [loading, setLoading] = useState(true);

  // Mock data for the wedding date - you can make this dynamic later
  const weddingDate = new Date('2024-12-15');
  const today = new Date();
  const daysLeft = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        { data: budgetData },
        { data: vendorData },  
        { data: eventsData },
        { data: tasksData },
        { data: guestsData }
      ] = await Promise.all([
        supabase.from('budget_categories').select('estimated_amount, actual_amount'),
        supabase.from('vendors').select('payment_status'),
        supabase.from('events').select('event_date').gte('event_date', new Date().toISOString().split('T')[0]),
        supabase.from('tasks').select('status'),
        supabase.from('guests').select('rsvp_status')
      ]);

      const totalBudget = budgetData?.reduce((sum, cat) => sum + (cat.estimated_amount || 0), 0) || 0;
      const spentBudget = budgetData?.reduce((sum, cat) => sum + (cat.actual_amount || 0), 0) || 0;
      const totalVendors = vendorData?.length || 0;
      const paidVendors = vendorData?.filter(v => v.payment_status === 'paid').length || 0;
      const upcomingEvents = eventsData?.length || 0;
      const totalTasks = tasksData?.length || 0;
      const completedTasks = tasksData?.filter(t => t.status === 'completed').length || 0;
      const totalGuests = guestsData?.length || 0;
      const confirmedGuests = guestsData?.filter(g => g.rsvp_status === 'confirmed').length || 0;

      setStats({
        totalTasks,
        completedTasks,
        totalGuests,
        confirmedGuests,
        totalBudget,
        spentBudget,
        totalVendors,
        paidVendors,
        upcomingEvents,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

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
      {(stats.totalTasks > 0 || stats.totalGuests > 0 || stats.totalVendors > 0 || stats.totalBudget > 0) && (
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
      )}

      {/* Getting Started Message */}
      {stats.totalTasks === 0 && stats.totalGuests === 0 && stats.totalVendors === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">Welcome to Vivah Vibes Tracker!</h3>
            <p className="text-muted-foreground mb-6">
              Start planning your perfect wedding by adding your first task, guest, or vendor.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <CheckSquare className="h-6 w-6" />
                Add Your First Task
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="h-6 w-6" />
                Add Your First Guest
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Store className="h-6 w-6" />
                Add Your First Vendor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
