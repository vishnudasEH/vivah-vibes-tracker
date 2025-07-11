import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus,
  Bell,
  Clock,
  Mail,
  MessageSquare,
  Calendar,
  Edit,
  Trash2,
  AlertCircle
} from "lucide-react";

interface EventReminder {
  id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  reminder_type: 'push' | 'email' | 'sms';
  reminder_time: number; // minutes before event
  recipient_type: 'all_guests' | 'family_only' | 'specific_list';
  recipients?: string;
  message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const EventReminders = () => {
  const [reminders, setReminders] = useState<EventReminder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<EventReminder | null>(null);
  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    event_time: '',
    reminder_type: 'push' as EventReminder['reminder_type'],
    reminder_time: 60, // 1 hour before by default
    recipient_type: 'all_guests' as EventReminder['recipient_type'],
    recipients: '',
    message: '',
    is_active: true
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReminder: EventReminder = {
      id: Date.now().toString(),
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (editingReminder) {
      setReminders(prev => prev.map(reminder => 
        reminder.id === editingReminder.id ? { ...newReminder, id: editingReminder.id } : reminder
      ));
      toast({
        title: "Success",
        description: "Reminder updated successfully",
      });
    } else {
      setReminders(prev => [...prev, newReminder]);
      toast({
        title: "Success",
        description: "Reminder created successfully",
      });
    }
    
    resetForm();
  };

  const handleDelete = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
    toast({
      title: "Success",
      description: "Reminder deleted successfully",
    });
  };

  const toggleActive = (id: string) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id 
        ? { ...reminder, is_active: !reminder.is_active, updated_at: new Date().toISOString() }
        : reminder
    ));
    toast({
      title: "Success",
      description: "Reminder status updated",
    });
  };

  const resetForm = () => {
    setFormData({
      event_name: '',
      event_date: '',
      event_time: '',
      reminder_type: 'push',
      reminder_time: 60,
      recipient_type: 'all_guests',
      recipients: '',
      message: '',
      is_active: true
    });
    setEditingReminder(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (reminder: EventReminder) => {
    setEditingReminder(reminder);
    setFormData({
      event_name: reminder.event_name,
      event_date: reminder.event_date,
      event_time: reminder.event_time,
      reminder_type: reminder.reminder_type,
      reminder_time: reminder.reminder_time,
      recipient_type: reminder.recipient_type,
      recipients: reminder.recipients || '',
      message: reminder.message,
      is_active: reminder.is_active
    });
    setIsDialogOpen(true);
  };

  const getReminderTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-blue-600" />;
      case 'sms': return <MessageSquare className="h-4 w-4 text-green-600" />;
      default: return <Bell className="h-4 w-4 text-purple-600" />;
    }
  };

  const getReminderTypeBadge = (type: string) => {
    const typeLabels = {
      push: 'Push Notification',
      email: 'Email',
      sms: 'SMS'
    };
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        {getReminderTypeIcon(type)}
        {typeLabels[type as keyof typeof typeLabels]}
      </Badge>
    );
  };

  const getRecipientBadge = (type: string) => {
    const recipientLabels = {
      all_guests: 'All Guests',
      family_only: 'Family Only',
      specific_list: 'Specific List'
    };
    
    return <Badge variant="outline">{recipientLabels[type as keyof typeof recipientLabels]}</Badge>;
  };

  const formatReminderTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes before`;
    } else if (minutes === 60) {
      return '1 hour before';
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} before`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} before`;
    }
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    return reminders.filter(reminder => {
      if (!reminder.is_active) return false;
      
      const eventDateTime = new Date(`${reminder.event_date}T${reminder.event_time}`);
      const reminderDateTime = new Date(eventDateTime.getTime() - (reminder.reminder_time * 60 * 1000));
      
      return reminderDateTime > now;
    }).sort((a, b) => {
      const aDateTime = new Date(`${a.event_date}T${a.event_time}`);
      const bDateTime = new Date(`${b.event_date}T${b.event_time}`);
      return aDateTime.getTime() - bDateTime.getTime();
    });
  };

  const upcomingReminders = getUpcomingReminders();

  const stats = {
    totalReminders: reminders.length,
    activeReminders: reminders.filter(r => r.is_active).length,
    upcomingReminders: upcomingReminders.length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Reminders</h1>
          <p className="text-muted-foreground">Set up automated reminders for wedding events</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="celebration" onClick={() => resetForm()}>
              <Plus className="h-4 w-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Create New Reminder'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Event Name"
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="date"
                  placeholder="Event Date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                />
                <Input
                  type="time"
                  placeholder="Event Time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select value={formData.reminder_type} onValueChange={(value: EventReminder['reminder_type']) => setFormData({ ...formData, reminder_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Reminder Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={formData.reminder_time.toString()} onValueChange={(value) => setFormData({ ...formData, reminder_time: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Reminder Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="120">2 hours before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                    <SelectItem value="2880">2 days before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={formData.recipient_type} onValueChange={(value: EventReminder['recipient_type']) => setFormData({ ...formData, recipient_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_guests">All Guests</SelectItem>
                    <SelectItem value="family_only">Family Only</SelectItem>
                    <SelectItem value="specific_list">Specific List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.recipient_type === 'specific_list' && (
                <div>
                  <Textarea
                    placeholder="Recipient List (comma-separated phone numbers or emails)"
                    value={formData.recipients}
                    onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  />
                </div>
              )}
              
              <div>
                <Textarea
                  placeholder="Reminder Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active">Active Reminder</label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 celebration">
                  {editingReminder ? 'Update' : 'Create'} Reminder
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalReminders}</div>
            <p className="text-sm text-muted-foreground">Total Reminders</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{stats.activeReminders}</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{stats.upcomingReminders}</div>
            <p className="text-sm text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reminders Alert */}
      {upcomingReminders.length > 0 && (
        <Card className="shadow-card border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <AlertCircle className="h-5 w-5" />
              Upcoming Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingReminders.slice(0, 3).map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{reminder.event_name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(`${reminder.event_date}T${reminder.event_time}`).toLocaleDateString()} at {
                      new Date(`2000-01-01T${reminder.event_time}`).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })
                    }
                  </div>
                </div>
              ))}
              {upcomingReminders.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{upcomingReminders.length - 3} more upcoming reminders
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reminders List */}
      <div className="grid gap-4">
        {reminders.map((reminder) => (
          <Card key={reminder.id} className={`shadow-card hover:shadow-elegant transition-all ${reminder.is_active ? '' : 'opacity-60'}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{reminder.event_name}</h3>
                    {getReminderTypeBadge(reminder.reminder_type)}
                    {getRecipientBadge(reminder.recipient_type)}
                    <Badge variant={reminder.is_active ? "default" : "secondary"}>
                      {reminder.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(`${reminder.event_date}T${reminder.event_time}`).toLocaleDateString()} at {
                        new Date(`2000-01-01T${reminder.event_time}`).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })
                      }
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatReminderTime(reminder.reminder_time)}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg mb-4">
                    <p className="text-sm"><strong>Message:</strong> {reminder.message}</p>
                  </div>
                  
                  {reminder.recipients && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Recipients:</strong> {reminder.recipients}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(reminder.id)}
                  >
                    {reminder.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(reminder)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reminders.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reminders set up yet. Click "Add Reminder" to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
