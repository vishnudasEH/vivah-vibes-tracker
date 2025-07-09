
import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { TaskTracker } from "@/components/TaskTracker";
import { GuestTracker } from "@/components/GuestTracker";
import { VendorTracker } from "@/components/VendorTracker";
import { BudgetTracker } from "@/components/BudgetTracker";
import { EventSchedule } from "@/components/EventSchedule";
import { MediaUpload } from "@/components/MediaUpload";
import { Navigation } from "@/components/Navigation";

type ActiveView = 'dashboard' | 'tasks' | 'guests' | 'vendors' | 'budget' | 'events' | 'media';

const Index = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  const renderContent = () => {
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
      case 'events':
        return <EventSchedule />;
      case 'media':
        return <MediaUpload />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-celebration p-6 shadow-elegant">
        <div className="container mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              Vivah Vibes Tracker ✨
            </h1>
            <p className="text-white/90 text-lg">
              Your personalized Indian wedding planner & tracker
            </p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
