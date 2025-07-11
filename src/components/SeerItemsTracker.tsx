
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
  Gift,
  Truck,
  DollarSign,
  Package,
  Edit,
  Trash2,
  Calendar
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type SeerItem = Tables<'seer_items'>;

export const SeerItemsTracker = () => {
  const [items, setItems] = useState<SeerItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeerItem | null>(null);
  const [formData, setFormData] = useState({
    item_name: '',
    category: 'bride' as SeerItem['category'],
    quantity_needed: 1,
    quantity_bought: 0,
    price_per_item: 0,
    delivery_status: 'pending' as SeerItem['delivery_status'],
    delivery_date: '',
    notes: '',
    image_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('seer_items')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch seer items",
        variant: "destructive",
      });
    } else {
      setItems(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalCost = formData.price_per_item * formData.quantity_bought;
    
    const itemData = {
      item_name: formData.item_name,
      category: formData.category,
      quantity_needed: formData.quantity_needed,
      quantity_bought: formData.quantity_bought,
      price_per_item: formData.price_per_item || null,
      total_cost: totalCost || null,
      delivery_status: formData.delivery_status,
      delivery_date: formData.delivery_date || null,
      notes: formData.notes || null,
      image_url: formData.image_url || null,
    };

    let error;
    if (editingItem) {
      ({ error } = await supabase
        .from('seer_items')
        .update(itemData)
        .eq('id', editingItem.id));
    } else {
      ({ error } = await supabase
        .from('seer_items')
        .insert(itemData));
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? 'update' : 'create'} seer item`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Seer item ${editingItem ? 'updated' : 'added'} successfully`,
      });
      resetForm();
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('seer_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete seer item",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Seer item deleted successfully",
      });
      fetchItems();
    }
  };

  const resetForm = () => {
    setFormData({
      item_name: '',
      category: 'bride',
      quantity_needed: 1,
      quantity_bought: 0,
      price_per_item: 0,
      delivery_status: 'pending',
      delivery_date: '',
      notes: '',
      image_url: ''
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: SeerItem) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      category: item.category,
      quantity_needed: item.quantity_needed,
      quantity_bought: item.quantity_bought,
      price_per_item: item.price_per_item || 0,
      delivery_status: item.delivery_status,
      delivery_date: item.delivery_date || '',
      notes: item.notes || '',
      image_url: item.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const toggleDeliveryStatus = async (itemId: string, currentStatus: SeerItem['delivery_status']) => {
    const statusOrder: SeerItem['delivery_status'][] = ['pending', 'ordered', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIndex];

    const { error } = await supabase
      .from('seer_items')
      .update({ delivery_status: newStatus })
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      });
    } else {
      fetchItems();
    }
  };

  const getDeliveryBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-success text-success-foreground">Delivered</Badge>;
      case 'ordered':
        return <Badge className="bg-secondary text-secondary-foreground">Ordered</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    return category === 'bride' 
      ? <Badge className="bg-primary text-primary-foreground">Bride</Badge>
      : <Badge className="bg-accent text-accent-foreground">Groom</Badge>;
  };

  const brideItems = items.filter(item => item.category === 'bride');
  const groomItems = items.filter(item => item.category === 'groom');
  
  const stats = {
    totalItems: items.length,
    totalCost: items.reduce((sum, item) => sum + (item.total_cost || 0), 0),
    delivered: items.filter(i => i.delivery_status === 'delivered').length,
    pending: items.filter(i => i.delivery_status === 'pending').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Seer Items Tracker</h1>
          <p className="text-muted-foreground">Track traditional gift items for bride and groom</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="celebration" onClick={() => resetForm()}>
              <Plus className="h-4 w-4" />
              Add Seer Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Seer Item' : 'Add New Seer Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Item Name (e.g., Sarees, Jewelry, Watch)"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Select value={formData.category} onValueChange={(value: SeerItem['category']) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bride">Bride</SelectItem>
                    <SelectItem value="groom">Groom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Qty Needed"
                  type="number"
                  min="1"
                  value={formData.quantity_needed}
                  onChange={(e) => setFormData({ ...formData, quantity_needed: parseInt(e.target.value) || 1 })}
                  required
                />
                <Input
                  placeholder="Qty Bought"
                  type="number"
                  min="0"
                  value={formData.quantity_bought}
                  onChange={(e) => setFormData({ ...formData, quantity_bought: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Input
                  placeholder="Price per Item"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_per_item}
                  onChange={(e) => setFormData({ ...formData, price_per_item: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Select value={formData.delivery_status} onValueChange={(value: SeerItem['delivery_status']) => setFormData({ ...formData, delivery_status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Delivery Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="Delivery Date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
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
                  {editingItem ? 'Update' : 'Add'} Item
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalItems}</div>
            <p className="text-sm text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">₹{stats.totalCost.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{stats.delivered}</div>
            <p className="text-sm text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Bride Items */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Bride Items
            <Badge variant="outline">{brideItems.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {brideItems.map((item) => (
              <div 
                key={item.id} 
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{item.item_name}</h4>
                    <Badge variant="outline">{item.quantity_bought}/{item.quantity_needed}</Badge>
                    {getDeliveryBadge(item.delivery_status)}
                    {item.total_cost && (
                      <Badge variant="outline" className="text-success">
                        <DollarSign className="h-3 w-3 mr-1" />
                        ₹{item.total_cost.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  {item.delivery_date && (
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Delivery: {new Date(item.delivery_date).toLocaleDateString()}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleDeliveryStatus(item.id, item.delivery_status)}
                    className="flex items-center gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    Update Status
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Groom Items */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-accent" />
            Groom Items
            <Badge variant="outline">{groomItems.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {groomItems.map((item) => (
              <div 
                key={item.id} 
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{item.item_name}</h4>
                    <Badge variant="outline">{item.quantity_bought}/{item.quantity_needed}</Badge>
                    {getDeliveryBadge(item.delivery_status)}
                    {item.total_cost && (
                      <Badge variant="outline" className="text-success">
                        <DollarSign className="h-3 w-3 mr-1" />
                        ₹{item.total_cost.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  {item.delivery_date && (
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Delivery: {new Date(item.delivery_date).toLocaleDateString()}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleDeliveryStatus(item.id, item.delivery_status)}
                    className="flex items-center gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    Update Status
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {items.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No seer items added yet. Click "Add Seer Item" to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
