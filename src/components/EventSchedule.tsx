
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus,
  Calendar,
  Clock,
  MapPin,
  Shirt,
  FileText,
  Edit,
  Trash2
} from "lucide-react";

interface Event {
  id: string;
  name: string;
  event_date: string;
  event_time?: string;
  venue?: string;
  dress_code?: string;
  notes?: string;
}

export const EventSchedule = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    event_date: '',
    event_time: '',
    venue: '',
    dress_code: '',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } else {
      setEvents(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      name: formData.name,
      event_date: formData.event_date,
      event_time: formData.event_time || null,
      venue: formData.venue || null,
      dress_code: formData.dress_code || null,
      notes: formData.notes || null,
    };

    let error;
    if (editingEvent) {
      ({ error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent.id));
    } else {
      ({ error } = await supabase
        .from('events')
        .insert(eventData));
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingEvent ? 'update' : 'create'} event`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Event ${editingEvent ? 'updated' : 'created'} successfully`,
      });
      resetForm();
      fetchEvents();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      fetchEvents();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      event_date: '',
      event_time: '',
      venue: '',
      dress_code: '',
      notes: ''
    });
    setEditingEvent(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      event_date: event.event_date,
      event_time: event.event_time || '',
      venue: event.venue || '',
      dress_code: event.dress_code || '',
      notes: event.notes || ''
    });
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return null;
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Schedule</h1>
          <p className="text-muted-foreground">Plan and track all your wedding events</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="celebration" onClick={() => resetForm()}>
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Event Name (e.g., Mehendi, Sangeet, Wedding)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Input
                  type="time"
                  placeholder="Event Time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                />
              </div>
              <div>
                <Input
                  placeholder="Venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                />
              </div>
              <div>
                <Input
                  placeholder="Dress Code"
                  value={formData.dress_code}
                  onChange={(e) => setFormData({ ...formData, dress_code: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Notes & Instructions"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 celebration">
                  {editingEvent ? 'Update' : 'Add'} Event
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timeline View */}
      <div className="space-y-4">
        {events.map((event, index) => (
          <Card key={event.id} className={`shadow-card hover:shadow-elegant transition-all ${
            isUpcoming(event.event_date) ? 'ring-2 ring-primary/20' : 'opacity-75'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Timeline Indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ${
                      isUpcoming(event.event_date) ? 'bg-primary' : 'bg-muted-foreground'
                    }`} />
                    {index < events.length - 1 && (
                      <div className="w-0.5 h-16 bg-muted mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold">{event.name}</h3>
                      {isUpcoming(event.event_date) && (
                        <Badge className="bg-primary text-primary-foreground">Upcoming</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.event_date)}
                      </div>
                      
                      {event.event_time && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatTime(event.event_time)}
                        </div>
                      )}
                      
                      {event.venue && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {event.venue}
                        </div>
                      )}
                      
                      {event.dress_code && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Shirt className="h-4 w-4" />
                          {event.dress_code}
                        </div>
                      )}
                    </div>
                    
                    {event.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{event.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No events scheduled yet. Click "Add Event" to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
