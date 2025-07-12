
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle,
  Send,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface MessageLog {
  id: string;
  guest_name: string;
  phone_number: string;
  message: string;
  message_type: 'whatsapp' | 'sms';
  event_name: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'failed';
}

interface Guest {
  id: string;
  name: string;
  phone?: string;
}

interface Event {
  id: string;
  name: string;
  event_date: string;
  event_time?: string;
}

export const MessagingService = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [messageType, setMessageType] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGuests();
    fetchEvents();
    loadMessageLogs();
    
    // Set default message template
    setMessageTemplate("Dear {guest_name}, this is a reminder for the {event_name} ceremony scheduled on {event_date} at {event_time}. Please be present on time. Thank you!");
  }, []);

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from('guests')
      .select('id, name, phone')
      .not('phone', 'is', null)
      .order('name', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch guests",
        variant: "destructive",
      });
    } else {
      setGuests(data || []);
    }
  };

  const fetchEvents = async () => {
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('id, name, event_date, event_time')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true });

    const { data: ceremoniesData, error: ceremoniesError } = await supabase
      .from('tamil_ceremonies')
      .select('id, ceremony_name, ceremony_date, ceremony_time')
      .gte('ceremony_date', new Date().toISOString().split('T')[0])
      .order('ceremony_date', { ascending: true });

    if (eventsError || ceremoniesError) {
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } else {
      // Transform ceremonies data to match Event interface
      const transformedCeremonies = (ceremoniesData || []).map(ceremony => ({
        id: ceremony.id,
        name: ceremony.ceremony_name,
        event_date: ceremony.ceremony_date || '',
        event_time: ceremony.ceremony_time || undefined
      }));

      const allEvents = [
        ...(eventsData || []),
        ...transformedCeremonies
      ];
      setEvents(allEvents);
    }
  };

  const loadMessageLogs = () => {
    const stored = localStorage.getItem('wedding-message-logs');
    if (stored) {
      setMessageLogs(JSON.parse(stored));
    }
  };

  const saveMessageLogs = (logs: MessageLog[]) => {
    localStorage.setItem('wedding-message-logs', JSON.stringify(logs));
    setMessageLogs(logs);
  };

  const formatMessage = (template: string, guest: Guest, event: Event) => {
    return template
      .replace('{guest_name}', guest.name)
      .replace('{event_name}', event.name)
      .replace('{event_date}', new Date(event.event_date).toLocaleDateString())
      .replace('{event_time}', event.event_time || 'TBD');
  };

  const sendWhatsAppMessage = (guest: Guest, message: string, event: Event) => {
    const whatsappUrl = `https://wa.me/${guest.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Log the message
    const newLog: MessageLog = {
      id: Date.now().toString(),
      guest_name: guest.name,
      phone_number: guest.phone || '',
      message: message,
      message_type: 'whatsapp',
      event_name: event.name,
      sent_at: new Date().toISOString(),
      status: 'sent'
    };
    
    const updatedLogs = [...messageLogs, newLog];
    saveMessageLogs(updatedLogs);
  };

  const sendBulkMessages = async () => {
    if (!selectedEvent || !messageTemplate) {
      toast({
        title: "Missing Information",
        description: "Please select an event and enter a message template",
        variant: "destructive",
      });
      return;
    }

    const event = events.find(e => e.id === selectedEvent);
    if (!event) return;

    const guestsWithPhone = guests.filter(g => g.phone);
    
    if (guestsWithPhone.length === 0) {
      toast({
        title: "No Phone Numbers",
        description: "No guests have phone numbers available",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      for (let i = 0; i < guestsWithPhone.length; i++) {
        const guest = guestsWithPhone[i];
        const personalizedMessage = formatMessage(messageTemplate, guest, event);
        
        if (messageType === 'whatsapp') {
          // Delay between messages to avoid overwhelming
          setTimeout(() => {
            sendWhatsAppMessage(guest, personalizedMessage, event);
          }, i * 2000);
        }
      }

      toast({
        title: "Messages Initiated",
        description: `Sending ${guestsWithPhone.length} ${messageType} messages`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send messages",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const sendTestMessage = () => {
    if (!selectedEvent || !messageTemplate) {
      toast({
        title: "Missing Information",
        description: "Please select an event and enter a message template",
        variant: "destructive",
      });
      return;
    }

    const event = events.find(e => e.id === selectedEvent);
    const testGuest = guests[0];
    
    if (!event || !testGuest) return;

    const personalizedMessage = formatMessage(messageTemplate, testGuest, event);
    
    if (messageType === 'whatsapp') {
      sendWhatsAppMessage(testGuest, personalizedMessage, event);
    }

    toast({
      title: "Test Message Sent",
      description: `Test message sent to ${testGuest.name}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4 text-blue-600" />;
      case 'delivered': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent': return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'delivered': return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Messaging Service</h1>
        <p className="text-muted-foreground">Send WhatsApp messages and SMS to guests for event reminders</p>
      </div>

      {/* Message Composer */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Compose Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Select Event</label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {event.name} - {new Date(event.event_date).toLocaleDateString()}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Message Type</label>
              <Select value={messageType} onValueChange={(value: 'whatsapp' | 'sms') => setMessageType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS (Local Gateway)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Message Template</label>
            <Textarea
              placeholder="Enter your message template. Use {guest_name}, {event_name}, {event_date}, {event_time} as placeholders"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available placeholders: {'{guest_name}'}, {'{event_name}'}, {'{event_date}'}, {'{event_time}'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={sendTestMessage}
              variant="outline"
              disabled={sending || !selectedEvent || !messageTemplate}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Test Message
            </Button>
            <Button 
              onClick={sendBulkMessages}
              disabled={sending || !selectedEvent || !messageTemplate}
              className="celebration"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : `Send to All Guests (${guests.filter(g => g.phone).length})`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{guests.filter(g => g.phone).length}</div>
            <p className="text-sm text-muted-foreground">Guests with Phone</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{events.length}</div>
            <p className="text-sm text-muted-foreground">Upcoming Events</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{messageLogs.filter(l => l.status === 'sent').length}</div>
            <p className="text-sm text-muted-foreground">Messages Sent</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">{messageLogs.length}</div>
            <p className="text-sm text-muted-foreground">Total Logs</p>
          </CardContent>
        </Card>
      </div>

      {/* Message Logs */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Message History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messageLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No messages sent yet</p>
            ) : (
              messageLogs.slice(-10).reverse().map((log) => (
                <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{log.guest_name}</h4>
                      <Badge variant="outline">{log.phone_number}</Badge>
                      {getStatusBadge(log.status)}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {log.message_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Event:</strong> {log.event_name}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Sent:</strong> {new Date(log.sent_at).toLocaleString()}
                    </p>
                    <div className="p-2 bg-muted rounded text-sm">
                      {log.message}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
