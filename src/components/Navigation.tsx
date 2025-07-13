
import { Card } from "@/components/ui/card";
import { 
  Calendar,
  Users,
  Building2,
  Wallet,
  Calculator,
  Camera,
  Heart,
  Flower2,
  Gift,
  Plane,
  Mail,
  Bell,
  MessageSquare,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navigation = ({ activeView, setActiveView }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar, color: 'text-primary' },
    { id: 'tasks', label: 'Tasks', icon: Calendar, color: 'text-secondary' },
    { id: 'guests', label: 'Guests', icon: Users, color: 'text-accent' },
    { id: 'vendors', label: 'Vendors', icon: Building2, color: 'text-muted-foreground' },
    { id: 'budget', label: 'Budget Overview', icon: Wallet, color: 'text-primary' },
    { id: 'budget-items', label: 'Budget Tracker', icon: Calculator, color: 'text-secondary' },
    { id: 'media', label: 'Media', icon: Camera, color: 'text-accent' },
    { id: 'tamil-ceremonies', label: 'Tamil Ceremonies', icon: Heart, color: 'text-destructive' },
    { id: 'pooja-items', label: 'Pooja Items', icon: Flower2, color: 'text-success' },
    { id: 'seer-items', label: 'Seer Items', icon: Gift, color: 'text-warning' },
    { id: 'guest-travel', label: 'Guest Travel', icon: Plane, color: 'text-info' },
    { id: 'invitation-tracker', label: 'Invitations', icon: Mail, color: 'text-purple-600' },
    { id: 'event-reminders', label: 'Reminders', icon: Bell, color: 'text-orange-600' },
    { id: 'messaging', label: 'Messaging', icon: MessageSquare, color: 'text-pink-600' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-card border-b px-4 py-3">
        <button
          onClick={toggleMobileMenu}
          className="flex items-center gap-2 text-foreground"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="font-medium">Menu</span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-0 top-0 h-full w-80 bg-card border-r shadow-lg overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Navigation</h2>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 hover:bg-muted rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeView === item.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <IconComponent className={`h-4 w-4 ${item.color}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden lg:block bg-card border-b shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeView === item.id
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm scale-105'
                      : 'hover:bg-muted text-foreground hover:scale-102'
                  }`}
                >
                  <IconComponent className={`h-4 w-4 ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
