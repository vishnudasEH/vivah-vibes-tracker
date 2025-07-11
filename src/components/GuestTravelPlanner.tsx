
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
  Plane,
  Car,
  Train,
  Bed,
  MapPin,
  Phone,
  Calendar,
  Edit,
  Trash2
} from "lucide-react";

interface GuestTravel {
  id: string;
  guest_name: string;
  contact_phone?: string;
  arrival_date?: string;
  arrival_time?: string;
  departure_date?: string;
  departure_time?: string;
  travel_mode: 'flight' | 'train' | 'bus' | 'car';
  travel_details?: string;
  accommodation_needed: boolean;
  accommodation_type?: 'hotel' | 'guest_house' | 'family_home' | 'other';
  accommodation_details?: string;
  pickup_required: boolean;
  pickup_location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const GuestTravelPlanner = () => {
  const [travelPlans, setTravelPlans] = useState<GuestTravel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<GuestTravel | null>(null);
  const [formData, setFormData] = useState({
    guest_name: '',
    contact_phone: '',
    arrival_date: '',
    arrival_time: '',
    departure_date: '',
    departure_time: '',
    travel_mode: 'flight' as GuestTravel['travel_mode'],
    travel_details: '',
    accommodation_needed: false,
    accommodation_type: 'hotel' as GuestTravel['accommodation_type'],
    accommodation_details: '',
    pickup_required: false,
    pickup_location: '',
    notes: ''
  });
  const { toast } = useToast();

  const fetchTravelPlans = async () => {
    // For now, using local state - in production you'd fetch from a real database
    // This is a placeholder implementation
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPlan: GuestTravel = {
      id: Date.now().toString(),
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (editingPlan) {
      setTravelPlans(prev => prev.map(plan => 
        plan.id === editingPlan.id ? { ...newPlan, id: editingPlan.id } : plan
      ));
      toast({
        title: "Success",
        description: "Travel plan updated successfully",
      });
    } else {
      setTravelPlans(prev => [...prev, newPlan]);
      toast({
        title: "Success",
        description: "Travel plan added successfully",
      });
    }
    
    resetForm();
  };

  const handleDelete = (id: string) => {
    setTravelPlans(prev => prev.filter(plan => plan.id !== id));
    toast({
      title: "Success",
      description: "Travel plan deleted successfully",
    });
  };

  const resetForm = () => {
    setFormData({
      guest_name: '',
      contact_phone: '',
      arrival_date: '',
      arrival_time: '',
      departure_date: '',
      departure_time: '',
      travel_mode: 'flight',
      travel_details: '',
      accommodation_needed: false,
      accommodation_type: 'hotel',
      accommodation_details: '',
      pickup_required: false,
      pickup_location: '',
      notes: ''
    });
    setEditingPlan(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (plan: GuestTravel) => {
    setEditingPlan(plan);
    setFormData({
      guest_name: plan.guest_name,
      contact_phone: plan.contact_phone || '',
      arrival_date: plan.arrival_date || '',
      arrival_time: plan.arrival_time || '',
      departure_date: plan.departure_date || '',
      departure_time: plan.departure_time || '',
      travel_mode: plan.travel_mode,
      travel_details: plan.travel_details || '',
      accommodation_needed: plan.accommodation_needed,
      accommodation_type: plan.accommodation_type || 'hotel',
      accommodation_details: plan.accommodation_details || '',
      pickup_required: plan.pickup_required,
      pickup_location: plan.pickup_location || '',
      notes: plan.notes || ''
    });
    setIsDialogOpen(true);
  };

  const getTravelIcon = (mode: string) => {
    switch (mode) {
      case 'flight': return <Plane className="h-4 w-4" />;
      case 'train': return <Train className="h-4 w-4" />;
      case 'car': return <Car className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const stats = {
    totalGuests: travelPlans.length,
    needAccommodation: travelPlans.filter(p => p.accommodation_needed).length,
    needPickup: travelPlans.filter(p => p.pickup_required).length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guest Travel & Stay Planner</h1>
          <p className="text-muted-foreground">Manage travel and accommodation for out-of-town guests</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="celebration" onClick={() => resetForm()}>
              <Plus className="h-4 w-4" />
              Add Travel Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Travel Plan' : 'Add New Travel Plan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Guest Name"
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Contact Phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="date"
                  placeholder="Arrival Date"
                  value={formData.arrival_date}
                  onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                />
                <Input
                  type="time"
                  placeholder="Arrival Time"
                  value={formData.arrival_time}
                  onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="date"
                  placeholder="Departure Date"
                  value={formData.departure_date}
                  onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                />
                <Input
                  type="time"
                  placeholder="Departure Time"
                  value={formData.departure_time}
                  onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                />
              </div>
              
              <div>
                <Select value={formData.travel_mode} onValueChange={(value: GuestTravel['travel_mode']) => setFormData({ ...formData, travel_mode: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Travel Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flight">Flight</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Textarea
                  placeholder="Travel Details (flight number, train details, etc.)"
                  value={formData.travel_details}
                  onChange={(e) => setFormData({ ...formData, travel_details: e.target.value })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="accommodation_needed"
                  checked={formData.accommodation_needed}
                  onChange={(e) => setFormData({ ...formData, accommodation_needed: e.target.checked })}
                />
                <label htmlFor="accommodation_needed">Accommodation Needed</label>
              </div>
              
              {formData.accommodation_needed && (
                <>
                  <div>
                    <Select value={formData.accommodation_type} onValueChange={(value: GuestTravel['accommodation_type']) => setFormData({ ...formData, accommodation_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Accommodation Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="guest_house">Guest House</SelectItem>
                        <SelectItem value="family_home">Family Home</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Textarea
                      placeholder="Accommodation Details (hotel name, address, booking info)"
                      value={formData.accommodation_details}
                      onChange={(e) => setFormData({ ...formData, accommodation_details: e.target.value })}
                    />
                  </div>
                </>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pickup_required"
                  checked={formData.pickup_required}
                  onChange={(e) => setFormData({ ...formData, pickup_required: e.target.checked })}
                />
                <label htmlFor="pickup_required">Pickup Required</label>
              </div>
              
              {formData.pickup_required && (
                <div>
                  <Input
                    placeholder="Pickup Location (airport, station, etc.)"
                    value={formData.pickup_location}
                    onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                  />
                </div>
              )}
              
              <div>
                <Textarea
                  placeholder="Additional Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 celebration">
                  {editingPlan ? 'Update' : 'Add'} Travel Plan
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
            <div className="text-2xl font-bold text-primary">{stats.totalGuests}</div>
            <p className="text-sm text-muted-foreground">Total Guests</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{stats.needAccommodation}</div>
            <p className="text-sm text-muted-foreground">Need Accommodation</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{stats.needPickup}</div>
            <p className="text-sm text-muted-foreground">Need Pickup</p>
          </CardContent>
        </Card>
      </div>

      {/* Travel Plans List */}
      <div className="grid gap-4">
        {travelPlans.map((plan) => (
          <Card key={plan.id} className="shadow-card hover:shadow-elegant transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{plan.guest_name}</h3>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getTravelIcon(plan.travel_mode)}
                      {plan.travel_mode}
                    </Badge>
                    {plan.accommodation_needed && (
                      <Badge className="bg-secondary text-secondary-foreground">
                        <Bed className="h-3 w-3 mr-1" />
                        Accommodation
                      </Badge>
                    )}
                    {plan.pickup_required && (
                      <Badge className="bg-accent text-accent-foreground">
                        <Car className="h-3 w-3 mr-1" />
                        Pickup
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    {plan.arrival_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Arrival: {new Date(plan.arrival_date).toLocaleDateString()} {plan.arrival_time}
                      </div>
                    )}
                    
                    {plan.departure_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Departure: {new Date(plan.departure_date).toLocaleDateString()} {plan.departure_time}
                      </div>
                    )}
                    
                    {plan.contact_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {plan.contact_phone}
                      </div>
                    )}
                    
                    {plan.pickup_location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Pickup: {plan.pickup_location}
                      </div>
                    )}
                  </div>
                  
                  {plan.travel_details && (
                    <div className="mb-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Travel Details:</strong> {plan.travel_details}</p>
                    </div>
                  )}
                  
                  {plan.accommodation_details && (
                    <div className="mb-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Accommodation:</strong> {plan.accommodation_details}</p>
                    </div>
                  )}
                  
                  {plan.notes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Notes:</strong> {plan.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {travelPlans.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No travel plans added yet. Click "Add Travel Plan" to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
