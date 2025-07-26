
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard,
  CheckSquare,
  Users,
  UserCheck,
  Calculator,
  Upload,
  Calendar,
  MessageCircle,
  Sparkles,
  IndianRupee,
  Home,
  Bell,
  Mail
} from "lucide-react";

interface NavigationProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navigation = ({ activeView, setActiveView }: NavigationProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-primary' },
    { id: 'tasks', label: 'Task Tracker', icon: CheckSquare, color: 'text-secondary' },
    { id: 'guests', label: 'Guest Tracker', icon: Users, color: 'text-accent' },
    { id: 'vendors', label: 'Vendor Tracker', icon: UserCheck, color: 'text-success' },
    { id: 'budget', label: 'Budget Tracker', icon: Calculator, color: 'text-primary' },
    { id: 'budget-items', label: 'Budget Items', icon: IndianRupee, color: 'text-secondary' },
    { id: 'finance-tracker', label: 'Finance Tracker', icon: IndianRupee, color: 'text-accent' },
    { id: 'home-setup', label: 'Home Setup', icon: Home, color: 'text-success' },
    { id: 'media', label: 'Media Upload', icon: Upload, color: 'text-primary' },
    { id: 'tamil-ceremonies', label: 'Tamil Ceremonies', icon: Sparkles, color: 'text-secondary' },
    { id: 'pooja-items', label: 'Pooja Items', icon: Sparkles, color: 'text-accent' },
    { id: 'seer-items', label: 'Seer Items', icon: Sparkles, color: 'text-success' },
    { id: 'guest-travel', label: 'Guest Travel', icon: Calendar, color: 'text-primary' },
    { id: 'invitation-tracker', label: 'Invitations', icon: Mail, color: 'text-secondary' },
    { id: 'event-reminders', label: 'Reminders', icon: Bell, color: 'text-accent' },
    { id: 'messaging', label: 'Messaging', icon: MessageCircle, color: 'text-success' }
  ];

  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">Navigation</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? '→' : '←'}
          </Button>
        </div>
        
        <div className={`grid gap-2 ${isCollapsed ? 'grid-cols-8 md:grid-cols-12' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'}`}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                className={`${
                  isCollapsed ? 'p-2 h-10 w-10' : 'h-auto p-3 flex-col gap-1'
                } ${
                  activeView === item.id 
                    ? 'bg-primary text-primary-foreground shadow-glow' 
                    : 'hover:bg-muted'
                } transition-all duration-200`}
                onClick={() => setActiveView(item.id)}
                title={item.label}
              >
                <Icon className={`h-4 w-4 ${activeView === item.id ? 'text-primary-foreground' : item.color}`} />
                {!isCollapsed && (
                  <span className="text-xs font-medium text-center leading-tight">
                    {item.label}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
