import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  CheckSquare, 
  Users, 
  DollarSign, 
  Heart,
  Clock,
  TrendingUp,
  Gift
} from "lucide-react";

export const Dashboard = () => {
  // Mock data for the wedding
  const weddingDate = new Date('2024-12-15');
  const today = new Date();
  const daysLeft = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  const stats = {
    totalTasks: 47,
    completedTasks: 23,
    totalGuests: 200,
    confirmedGuests: 156,
    totalBudget: 500000,
    spentBudget: 275000,
  };

  const taskProgress = (stats.completedTasks / stats.totalTasks) * 100;
  const rsvpProgress = (stats.confirmedGuests / stats.totalGuests) * 100;
  const budgetProgress = (stats.spentBudget / stats.totalBudget) * 100;

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
          <div className="text-6xl font-bold mb-2">{daysLeft}</div>
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
            <CardTitle className="text-sm font-medium">Days Left</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {daysLeft}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Time to celebrate! 🎉
            </p>
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
    </div>
  );
};