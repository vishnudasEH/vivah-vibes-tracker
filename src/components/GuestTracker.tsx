import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus,
  Search,
  Mail,
  Phone,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Edit,
  Trash2,
  UserPlus
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { TagManager } from "./TagManager";
import { MultiSelectTags } from "./MultiSelectTags";

type Guest = Tables<'guests'>;
type TagType = Tables<'tags'>;

interface GuestWithTags extends Guest {
  guest_tags: Array<{
    tags: TagType;
  }>;
}

export const GuestTracker = () => {
  const [guests, setGuests] = useState<GuestWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestWithTags | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    phone: '',
    email: '',
    members: 1,
    rsvp_status: 'pending' as Guest['rsvp_status'],
    invitation_sent: false,
    side: 'bride' as Guest['side']
  });
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRsvp, setFilterRsvp] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchGuests();
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });
    setAvailableTags(data || []);
  };

  const fetchGuests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('guests')
      .select(`
        *,
        guest_tags (
          tags (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch guests",
        variant: "destructive",
      });
    } else {
      setGuests(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const guestData = {
      name: formData.name,
      relation: formData.relation,
      phone: formData.phone || null,
      email: formData.email || null,
      members: formData.members,
      rsvp_status: formData.rsvp_status,
      invitation_sent: formData.invitation_sent,
      side: formData.side,
    };

    let guestId: string;
    let error;

    if (editingGuest) {
      ({ error } = await supabase
        .from('guests')
        .update(guestData)
        .eq('id', editingGuest.id));
      guestId = editingGuest.id;
      
      // Remove existing tags
      await supabase
        .from('guest_tags')
        .delete()
        .eq('guest_id', editingGuest.id);
    } else {
      const { data, error: insertError } = await supabase
        .from('guests')
        .insert(guestData)
        .select()
        .single();
      error = insertError;
      guestId = data?.id;
    }

    // Add new tags
    if (!error && selectedTags.length > 0) {
      const tagInserts = selectedTags.map(tag => ({
        guest_id: guestId,
        tag_id: tag.id
      }));
      
      await supabase
        .from('guest_tags')
        .insert(tagInserts);
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingGuest ? 'update' : 'create'} guest`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Guest ${editingGuest ? 'updated' : 'added'} successfully`,
      });
      resetForm();
      fetchGuests();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete guest",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Guest deleted successfully",
      });
      fetchGuests();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relation: '',
      phone: '',
      email: '',
      members: 1,
      rsvp_status: 'pending',
      invitation_sent: false,
      side: 'bride'
    });
    setSelectedTags([]);
    setEditingGuest(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (guest: GuestWithTags) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      relation: guest.relation,
      phone: guest.phone || '',
      email: guest.email || '',
      members: guest.members,
      rsvp_status: guest.rsvp_status,
      invitation_sent: guest.invitation_sent,
      side: guest.side
    });
    setSelectedTags(guest.guest_tags.map(gt => gt.tags));
    setIsDialogOpen(true);
  };

  const toggleRsvpStatus = async (guestId: string, currentStatus: Guest['rsvp_status']) => {
    const statusOrder: Guest['rsvp_status'][] = ['pending', 'confirmed', 'declined'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIndex];

    const { error } = await supabase
      .from('guests')
      .update({ rsvp_status: newStatus })
      .eq('id', guestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update RSVP status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "RSVP status updated",
      });
      fetchGuests();
    }
  };

  const toggleInvitationSent = async (guestId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('guests')
      .update({ invitation_sent: !currentStatus })
      .eq('id', guestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update invitation status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Invitation marked as ${!currentStatus ? 'sent' : 'not sent'}`,
      });
      fetchGuests();
    }
  };

  const getRsvpIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-secondary" />;
    }
  };

  const getRsvpBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success text-success-foreground">Confirmed</Badge>;
      case 'declined':
        return <Badge className="bg-destructive text-destructive-foreground">Declined</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getSideBadge = (side: string) => {
    switch (side) {
      case 'bride':
        return <Badge className="bg-primary text-primary-foreground">Bride's Side</Badge>;
      case 'groom':
        return <Badge className="bg-secondary text-secondary-foreground">Groom's Side</Badge>;
      default:
        return <Badge className="bg-accent text-accent-foreground">Both Sides</Badge>;
    }
  };

  const filteredGuests = guests.filter(guest => {
    const nameMatch = guest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const rsvpMatch = filterRsvp === 'all' || guest.rsvp_status === filterRsvp;
    const tagMatch = filterTag === 'all' || guest.guest_tags.some(gt => gt.tags.id === filterTag);
    return nameMatch && rsvpMatch && tagMatch;
  });

  const stats = {
    totalGuests: guests.length,
    totalMembers: guests.reduce((sum, guest) => sum + guest.members, 0),
    confirmed: guests.filter(g => g.rsvp_status === 'confirmed').length,
    confirmedMembers: guests.filter(g => g.rsvp_status === 'confirmed').reduce((sum, guest) => sum + guest.members, 0),
    pending: guests.filter(g => g.rsvp_status === 'pending').length,
    declined: guests.filter(g => g.rsvp_status === 'declined').length,
    invitationsSent: guests.filter(g => g.invitation_sent).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading guests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="guests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guests">Guest List</TabsTrigger>
          <TabsTrigger value="tags">Tag Manager</TabsTrigger>
        </TabsList>

        <TabsContent value="guests" className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Guest Tracker</h1>
              <p className="text-muted-foreground">Manage your wedding guest list and RSVPs</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="celebration" onClick={() => resetForm()}>
                  <Plus className="h-4 w-4" />
                  Add Guest
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingGuest ? 'Edit Guest' : 'Add New Guest'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Guest Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Relation (e.g., Uncle, Friend, Colleague)"
                      value={formData.relation}
                      onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Number of Members"
                      type="number"
                      min="1"
                      value={formData.members}
                      onChange={(e) => setFormData({ ...formData, members: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Select value={formData.side} onValueChange={(value: Guest['side']) => setFormData({ ...formData, side: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Side" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bride">Bride's Side</SelectItem>
                        <SelectItem value="groom">Groom's Side</SelectItem>
                        <SelectItem value="both">Both Sides</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <MultiSelectTags
                      selectedTags={selectedTags}
                      onTagsChange={setSelectedTags}
                      placeholder="Select tags..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 celebration" disabled={submitting}>
                      {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {editingGuest ? 'Update' : 'Add'} Guest
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalGuests}</div>
                <p className="text-sm text-muted-foreground">Total Guests</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                  <UserPlus className="h-5 w-5" />
                  {stats.totalMembers}
                </div>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{stats.confirmed}</div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{stats.confirmedMembers}</div>
                <p className="text-sm text-muted-foreground">Confirmed Members</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary">{stats.pending}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">{stats.invitationsSent}</div>
                <p className="text-sm text-muted-foreground">Invites Sent</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search guests by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {availableTags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:w-48">
                  <Select value={filterRsvp} onValueChange={setFilterRsvp}>
                    <SelectTrigger>
                      <SelectValue placeholder="RSVP Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest List */}
          <div className="grid gap-4">
            {filteredGuests.map((guest) => (
              <Card 
                key={guest.id} 
                className="shadow-card hover:shadow-elegant transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{guest.name}</h3>
                            <Badge variant="outline" className="bg-muted/50">
                              <Users className="h-3 w-3 mr-1" />
                              {guest.members} member{guest.members > 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{guest.relation}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {getRsvpBadge(guest.rsvp_status)}
                            {getSideBadge(guest.side)}
                            {guest.guest_tags.map((gt) => (
                              <Badge key={gt.tags.id} variant="outline" className="bg-primary/10 text-primary border-primary">
                                {gt.tags.name}
                              </Badge>
                            ))}
                            {guest.invitation_sent && (
                              <Badge variant="outline" className="bg-success/10 text-success border-success">
                                Invitation Sent
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-2 text-sm text-muted-foreground">
                            {guest.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {guest.phone}
                              </div>
                            )}
                            {guest.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {guest.email}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleRsvpStatus(guest.id, guest.rsvp_status)}
                            className="flex items-center gap-2"
                          >
                            {getRsvpIcon(guest.rsvp_status)}
                            Update RSVP
                          </Button>
                          <Button 
                            size="sm" 
                            variant={guest.invitation_sent ? "outline" : "warm"}
                            onClick={() => toggleInvitationSent(guest.id, guest.invitation_sent)}
                          >
                            {guest.invitation_sent ? 'Mark Unsent' : 'Send Invite'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(guest)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(guest.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGuests.length === 0 && !loading && (
            <Card className="shadow-card">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {guests.length === 0 
                    ? "No guests added yet. Click 'Add Guest' to start building your guest list!"
                    : "No guests found matching your search criteria."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tags">
          <TagManager onTagsChange={fetchTags} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
