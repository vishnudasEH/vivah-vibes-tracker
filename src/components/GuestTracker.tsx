import { useState } from "react";
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
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";

interface Guest {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  invitationSent: boolean;
  category: 'family' | 'friends' | 'colleagues' | 'relatives';
  side: 'bride' | 'groom' | 'both';
}

export const GuestTracker = () => {
  const [guests, setGuests] = useState<Guest[]>([
    {
      id: '1',
      name: 'Priya Sharma',
      relation: 'Sister',
      phone: '+91 98765 43210',
      email: 'priya.sharma@email.com',
      rsvpStatus: 'confirmed',
      invitationSent: true,
      category: 'family',
      side: 'bride'
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      relation: 'Uncle',
      phone: '+91 87654 32109',
      email: 'rajesh.kumar@email.com',
      rsvpStatus: 'confirmed',
      invitationSent: true,
      category: 'family',
      side: 'groom'
    },
    {
      id: '3',
      name: 'Anil Verma',
      relation: 'College Friend',
      phone: '+91 76543 21098',
      email: 'anil.verma@email.com',
      rsvpStatus: 'pending',
      invitationSent: true,
      category: 'friends',
      side: 'bride'
    },
    {
      id: '4',
      name: 'Sita Devi',
      relation: 'Grandmother',
      phone: '+91 65432 10987',
      email: '',
      rsvpStatus: 'confirmed',
      invitationSent: true,
      category: 'family',
      side: 'groom'
    },
    {
      id: '5',
      name: 'Amit Singh',
      relation: 'Colleague',
      phone: '+91 54321 09876',
      email: 'amit.singh@office.com',
      rsvpStatus: 'pending',
      invitationSent: false,
      category: 'colleagues',
      side: 'both'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRsvp, setFilterRsvp] = useState<string>('all');

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
    const categoryMatch = filterCategory === 'all' || guest.category === filterCategory;
    const rsvpMatch = filterRsvp === 'all' || guest.rsvpStatus === filterRsvp;
    return nameMatch && categoryMatch && rsvpMatch;
  });

  const toggleRsvpStatus = (guestId: string) => {
    setGuests(guests.map(guest => {
      if (guest.id === guestId) {
        const statusOrder = ['pending', 'confirmed', 'declined'];
        const currentIndex = statusOrder.indexOf(guest.rsvpStatus);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        return { ...guest, rsvpStatus: statusOrder[nextIndex] as Guest['rsvpStatus'] };
      }
      return guest;
    }));
  };

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    invitationsSent: guests.filter(g => g.invitationSent).length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guest Tracker</h1>
          <p className="text-muted-foreground">Manage your wedding guest list and RSVPs</p>
        </div>
        <Button variant="celebration">
          <Plus className="h-4 w-4" />
          Add Guest
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Guests</p>
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
            <div className="text-2xl font-bold text-secondary">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
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
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="colleagues">Colleagues</SelectItem>
                  <SelectItem value="relatives">Relatives</SelectItem>
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
                      <h3 className="font-semibold text-lg mb-2">{guest.name}</h3>
                      <p className="text-muted-foreground mb-3">{guest.relation}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {getRsvpBadge(guest.rsvpStatus)}
                        {getSideBadge(guest.side)}
                        <Badge variant="outline" className="bg-muted">
                          {guest.category.charAt(0).toUpperCase() + guest.category.slice(1)}
                        </Badge>
                        {guest.invitationSent && (
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
                        onClick={() => toggleRsvpStatus(guest.id)}
                        className="flex items-center gap-2"
                      >
                        {getRsvpIcon(guest.rsvpStatus)}
                        Update RSVP
                      </Button>
                      {!guest.invitationSent && (
                        <Button size="sm" variant="warm">
                          Send Invite
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGuests.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No guests found matching your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};