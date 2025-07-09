
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Store,
  Phone,
  Mail,
  DollarSign,
  Edit,
  Trash2
} from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact_phone?: string;
  contact_email?: string;
  agreed_price?: number;
  payment_status: 'pending' | 'partial' | 'paid';
  booking_notes?: string;
}

export const VendorTracker = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contact_phone: '',
    contact_email: '',
    agreed_price: '',
    payment_status: 'pending' as const,
    booking_notes: ''
  });
  const { toast } = useToast();

  const categories = [
    'Venue', 'Catering', 'Photography', 'Videography', 'Decoration', 
    'Music & Entertainment', 'Transportation', 'Flowers', 'Makeup & Beauty',
    'Priest/Pandit', 'Security', 'Others'
  ];

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive",
      });
    } else {
      setVendors(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const vendorData = {
      name: formData.name,
      category: formData.category,
      contact_phone: formData.contact_phone || null,
      contact_email: formData.contact_email || null,
      agreed_price: formData.agreed_price ? parseFloat(formData.agreed_price) : null,
      payment_status: formData.payment_status,
      booking_notes: formData.booking_notes || null,
    };

    let error;
    if (editingVendor) {
      ({ error } = await supabase
        .from('vendors')
        .update(vendorData)
        .eq('id', editingVendor.id));
    } else {
      ({ error } = await supabase
        .from('vendors')
        .insert(vendorData));
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingVendor ? 'update' : 'create'} vendor`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Vendor ${editingVendor ? 'updated' : 'created'} successfully`,
      });
      resetForm();
      fetchVendors();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
      fetchVendors();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      contact_phone: '',
      contact_email: '',
      agreed_price: '',
      payment_status: 'pending',
      booking_notes: ''
    });
    setEditingVendor(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      contact_phone: vendor.contact_phone || '',
      contact_email: vendor.contact_email || '',
      agreed_price: vendor.agreed_price?.toString() || '',
      payment_status: vendor.payment_status,
      booking_notes: vendor.booking_notes || ''
    });
    setIsDialogOpen(true);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-secondary text-secondary-foreground">Partial</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendor Tracker</h1>
          <p className="text-muted-foreground">Manage all your wedding vendors and services</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="celebration" onClick={() => resetForm()}>
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Vendor Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  placeholder="Phone Number"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
              <div>
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>
              <div>
                <Input
                  placeholder="Agreed Price (₹)"
                  type="number"
                  value={formData.agreed_price}
                  onChange={(e) => setFormData({ ...formData, agreed_price: e.target.value })}
                />
              </div>
              <div>
                <Select value={formData.payment_status} onValueChange={(value: any) => setFormData({ ...formData, payment_status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Textarea
                  placeholder="Booking Notes"
                  value={formData.booking_notes}
                  onChange={(e) => setFormData({ ...formData, booking_notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 celebration">
                  {editingVendor ? 'Update' : 'Add'} Vendor
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vendors Grid */}
      <div className="grid gap-4">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="shadow-card hover:shadow-elegant transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Store className="h-6 w-6 text-primary mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{vendor.name}</h3>
                      <Badge variant="outline" className="bg-muted">
                        {vendor.category}
                      </Badge>
                      {getPaymentStatusBadge(vendor.payment_status)}
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {vendor.contact_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {vendor.contact_phone}
                        </div>
                      )}
                      {vendor.contact_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {vendor.contact_email}
                        </div>
                      )}
                      {vendor.agreed_price && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          ₹{vendor.agreed_price.toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    {vendor.booking_notes && (
                      <p className="mt-3 text-sm bg-muted p-3 rounded-lg">
                        {vendor.booking_notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vendor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(vendor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vendors.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No vendors added yet. Click "Add Vendor" to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
