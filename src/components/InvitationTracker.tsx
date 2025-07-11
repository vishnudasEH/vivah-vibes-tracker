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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus,
  MessageCircle,
  Mail,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Phone,
  Users,
  Send
} from "lucide-react";

interface Invitation {
  id: string;
  guest_id: string;
  guest_name: string;
  contact_info: string;
  invitation_method: 'whatsapp' | 'email' | 'printed_card' | 'phone_call';
  status: 'sent' | 'delivered' | 'accepted' | 'declined' | 'no_response';
  sent_date?: string;
  response_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Guest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  rsvp_status: string;
}

export const InvitationTracker = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvitation, setEditingInvitation] = useState<Invitation | null>(null);
  const [formData, setFormData] = useState({
    guest_id: '',
    invitation_method: 'whatsapp' as Invitation['invitation_method'],
    status: 'sent' as Invitation['status'],
    sent_date: '',
    response_date: '',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInvitations();
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from('guests')
      .select('id, name, phone, email, rsvp_status')
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

  const fetchInvitations = async () => {
    // Since invitations are stored locally for now
    const stored = localStorage.getItem('wedding-invitations');
    if (stored) {
      setInvitations(JSON.parse(stored));
    }
  };

  const saveInvitations = (invites: Invitation[]) => {
    localStorage.setItem('wedding-invitations', JSON.stringify(invites));
    setInvitations(invites);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedGuest = guests.find(g => g.id === formData.guest_id);
    if (!selectedGuest) return;

    const newInvitation: Invitation = {
      id: Date.now().toString(),
      guest_id: selectedGuest.id,
      guest_name: selectedGuest.name,
      contact_info: formData.invitation_method === 'email' ? selectedGuest.email || '' : selectedGuest.phone || '',
      invitation_method: formData.invitation_method,
      status: formData.status,
      sent_date: formData.sent_date,
      response_date: formData.response_date,
      notes: formData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (editingInvitation) {
      const updated = invitations.map(inv => 
        inv.id === editingInvitation.id ? { ...newInvitation, id: editingInvitation.id } : inv
      );
      saveInvitations(updated);
      toast({
        title: "Success",
        description: "Invitation updated successfully",
      });
    } else {
      saveInvitations([...invitations, newInvitation]);
      toast({
        title: "Success",
        description: "Invitation added successfully",
      });
    }
    
    resetForm();
  };

  const handleDelete = (id: string) => {
    const filtered = invitations.filter(inv => inv.id !== id);
    saveInvitations(filtered);
    toast({
      title: "Success",
      description: "Invitation deleted successfully",
    });
  };

  const resetForm = () => {
    setFormData({
      guest_id: '',
      invitation_method: 'whatsapp',
      status: 'sent',
      sent_date: '',
      response_date: '',
      notes: ''
    });
    setEditingInvitation(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (invitation: Invitation) => {
    setEditingInvitation(invitation);
    setFormData({
      guest_id: invitation.guest_id,
      invitation_method: invitation.invitation_method,
      status: invitation.status,
      sent_date: invitation.sent_date || '',
      response_date: invitation.response_date || '',
      notes: invitation.notes || ''
    });
    setIsDialogOpen(true);
  };

  const updateStatus = (id: string, newStatus: Invitation['status']) => {
    const updated = invitations.map(inv => 
      inv.id === id 
        ? { 
            ...inv, 
            status: newStatus, 
            response_date: newStatus === 'accepted' || newStatus === 'declined' ? new Date().toISOString().split('T')[0] : inv.response_date,
            updated_at: new Date().toISOString()
          } 
        : inv
    );
    saveInvitations(updated);
    toast({
      title: "Success",
      description: "Invitation status updated",
    });
  };

  const sendWhatsAppMessage = (phoneNumber: string, guestName: string) => {
    const message = `Dear ${guestName}, you are cordially invited to our Tamil wedding ceremony. We would be honored by your presence on this special day. Please confirm your attendance. With warm regards.`;
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Opened",
      description: "WhatsApp message opened in new tab",
    });
  };

  const sendBulkWhatsAppMessages = () => {
    const pendingInvites = invitations.filter(inv => 
      inv.invitation_method === 'whatsapp' && 
      inv.status === 'sent' && 
      inv.contact_info
    );

    if (pendingInvites.length === 0) {
      toast({
        title: "No Messages to Send",
        description: "No pending WhatsApp invitations found",
        variant: "destructive",
      });
      return;
    }

    pendingInvites.forEach((invite, index) => {
      setTimeout(() => {
        sendWhatsAppMessage(invite.contact_info, invite.guest_name);
      }, index * 2000); // 2 second delay between messages
    });

    toast({
      title: "Bulk Messages Initiated",
      description: `Sending ${pendingInvites.length} WhatsApp messages`,
    });
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'whatsapp': return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'email': return <Mail className="h-4 w-4 text-blue-600" />;
      case 'printed_card': return <CreditCard className="h-4 w-4 text-purple-600" />;
      case 'phone_call': return <Phone className="h-4 w-4 text-orange-600" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'declined': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'sent':
      case 'delivered': return <Clock className="h-4 w-4 text-secondary" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-success text-success-foreground">Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-destructive text-destructive-foreground">Declined</Badge>;
      case 'delivered':
        return <Badge className="bg-secondary text-secondary-foreground">Delivered</Badge>;
      case 'sent':
        return <Badge className="bg-primary text-primary-foreground">Sent</Badge>;
      default:
        return <Badge variant="outline">No Response</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    const methodLabels = {
      whatsapp: 'WhatsApp',
      email: 'Email',
      printed_card: 'Printed Card',
      phone_call: 'Phone Call'
    };
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        {getMethodIcon(method)}
        {methodLabels[method as keyof typeof methodLabels]}
      </Badge>
    );
  };

  const stats = {
    totalInvitations: invitations.length,
    sent: invitations.filter(i => i.status === 'sent' || i.status === 'delivered').length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    declined: invitations.filter(i => i.status === 'declined').length,
    noResponse: invitations.filter(i => i.status === 'no_response').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invitation Tracker</h1>
          <p className="text-muted-foreground">Track invitation methods and responses from guests</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={sendBulkWhatsAppMessages} className="bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4 mr-2" />
            Send WhatsApp Bulk
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="celebration" onClick={() => resetForm()}>
                <Plus className="h-4 w-4" />
                Add Invitation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingInvitation ? 'Edit Invitation' : 'Add New Invitation'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Select value={formData.guest_id} onValueChange={(value) => setFormData({ ...formData, guest_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Guest" />
                    </SelectTrigger>
                    <SelectContent>
                      {guests.map((guest) => (
                        <SelectItem key={guest.id} value={guest.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {guest.name}
                            {guest.phone && ` (${guest.phone})`}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={formData.invitation_method} onValueChange={(value: Invitation['invitation_method']) => setFormData({ ...formData, invitation_method: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Invitation Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="printed_card">Printed Card</SelectItem>
                      <SelectItem value="phone_call">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={formData.status} onValueChange={(value: Invitation['status']) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="no_response">No Response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    placeholder="Sent Date"
                    value={formData.sent_date}
                    onChange={(e) => setFormData({ ...formData, sent_date: e.target.value })}
                  />
                  <Input
                    type="date"
                    placeholder="Response Date"
                    value={formData.response_date}
                    onChange={(e) => setFormData({ ...formData, response_date: e.target.value })}
                  />
                </div>
                
                <div>
                  <Textarea
                    placeholder="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 celebration">
                    {editingInvitation ? 'Update' : 'Add'} Invitation
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalInvitations}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{stats.sent}</div>
            <p className="text-sm text-muted-foreground">Sent</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{stats.accepted}</div>
            <p className="text-sm text-muted-foreground">Accepted</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{stats.declined}</div>
            <p className="text-sm text-muted-foreground">Declined</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">{stats.noResponse}</div>
            <p className="text-sm text-muted-foreground">No Response</p>
          </CardContent>
        </Card>
      </div>

      {/* Invitations List */}
      <div className="grid gap-4">
        {invitations.map((invitation) => (
          <Card key={invitation.id} className="shadow-card hover:shadow-elegant transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{invitation.guest_name}</h3>
                    {getMethodBadge(invitation.invitation_method)}
                    {getStatusBadge(invitation.status)}
                    {invitation.invitation_method === 'whatsapp' && invitation.contact_info && (
                      <Button 
                        size="sm" 
                        onClick={() => sendWhatsAppMessage(invitation.contact_info, invitation.guest_name)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-3">
                    <p><strong>Contact:</strong> {invitation.contact_info}</p>
                    {invitation.sent_date && (
                      <p><strong>Sent:</strong> {new Date(invitation.sent_date).toLocaleDateString()}</p>
                    )}
                    {invitation.response_date && (
                      <p><strong>Response:</strong> {new Date(invitation.response_date).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  {invitation.notes && (
                    <div className="p-3 bg-muted rounded-lg mb-3">
                      <p className="text-sm">{invitation.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(invitation.id, 'accepted')}
                      disabled={invitation.status === 'accepted'}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(invitation.id, 'declined')}
                      disabled={invitation.status === 'declined'}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(invitation.id, 'no_response')}
                      disabled={invitation.status === 'no_response'}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      No Response
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(invitation)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(invitation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {invitations.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No invitations tracked yet. Click "Add Invitation" to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
