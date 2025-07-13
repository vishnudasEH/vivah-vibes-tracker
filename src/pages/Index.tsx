import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { TaskTracker } from "@/components/TaskTracker";
import { GuestTracker } from "@/components/GuestTracker";
import { VendorTracker } from "@/components/VendorTracker";
import { BudgetTracker } from "@/components/BudgetTracker";
import { BudgetItemsTracker } from "@/components/BudgetItemsTracker";
import { MediaUpload } from "@/components/MediaUpload";
import { TamilCeremonies } from "@/components/TamilCeremonies";
import { PoojaItemsTracker } from "@/components/PoojaItemsTracker";
import { SeerItemsTracker } from "@/components/SeerItemsTracker";
import { GuestTravelPlanner } from "@/components/GuestTravelPlanner";
import { InvitationTracker } from "@/components/InvitationTracker";
import { EventReminders } from "@/components/EventReminders";
import { MessagingService } from "@/components/MessagingService";
import { Login } from "@/components/Login";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

type ActiveView = 'dashboard' | 'tasks' | 'guests' | 'vendors' | 'budget' | 'budget-items' | 'media' | 'tamil-ceremonies' | 'pooja-items' | 'seer-items' | 'guest-travel' | 'invitation-tracker' | 'event-reminders' | 'messaging';

const Index = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('wedding-app-authenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('wedding-app-authenticated');
    setIsAuthenticated(false);
  };

  const handleViewChange = (view: string) => {
    setActiveView(view as ActiveView);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskTracker />;
      case 'guests':
        return <GuestTracker />;
      case 'vendors':
        return <VendorTracker />;
      case 'budget':
        return <BudgetTracker />;
      case 'budget-items':
        return <BudgetItemsTracker />;
      case 'media':
        return <MediaUpload />;
      case 'tamil-ceremonies':
        return <TamilCeremonies />;
      case 'pooja-items':
        return <PoojaItemsTracker />;
      case 'seer-items':
        return <SeerItemsTracker />;
      case 'guest-travel':
        return <GuestTravelPlanner />;
      case 'invitation-tracker':
        return <InvitationTracker />;
      case 'event-reminders':
        return <EventReminders />;
      case 'messaging':
        return <MessagingService />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="bg-card border-b shadow-card">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Tamil Wedding Planner</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      <Navigation activeView={activeView} setActiveView={handleViewChange} />
      
      <main className="container mx-auto px-4 py-6">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default Index;
