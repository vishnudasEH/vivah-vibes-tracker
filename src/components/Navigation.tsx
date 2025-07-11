
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Store, 
  DollarSign, 
  Calendar,
  Upload,
  Church,
  Gift,
  Plane,
  Mail,
  Bell,
  MessageSquare
} from "lucide-react";

type ActiveView = 'dashboard' | 'tasks' | 'guests' | 'vendors' | 'budget' | 'media' | 'tamil-ceremonies' | 'seer-items' | 'guest-travel' | 'invitation-tracker' | 'event-reminders' | 'messaging';

interface NavigationProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

export const Navigation = ({ activeView, setActiveView }: NavigationProps) => {
  const navItems = [
    { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as ActiveView, label: 'Tasks', icon: CheckSquare },
    { id: 'guests' as ActiveView, label: 'Guests', icon: Users },
    { id: 'vendors' as ActiveView, label: 'Vendors', icon: Store },
    { id: 'budget' as ActiveView, label: 'Budget', icon: DollarSign },
    { id: 'media' as ActiveView, label: 'Media', icon: Upload },
    { id: 'tamil-ceremonies' as ActiveView, label: 'Tamil Ceremonies', icon: Church },
    { id: 'seer-items' as ActiveView, label: 'Seer Items', icon: Gift },
    { id: 'guest-travel' as ActiveView, label: 'Guest Travel', icon: Plane },
    { id: 'invitation-tracker' as ActiveView, label: 'Invitations', icon: Mail },
    { id: 'event-reminders' as ActiveView, label: 'Reminders', icon: Bell },
    { id: 'messaging' as ActiveView, label: 'Messaging', icon: MessageSquare },
  ];

  return (
    <nav className="bg-card border-b shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-2 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "celebration" : "ghost"}
                size="sm"
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 ${
                  isActive ? 'animate-scale-in' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
