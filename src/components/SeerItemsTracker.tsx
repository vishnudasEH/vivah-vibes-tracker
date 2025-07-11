
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
  Gift,
  Upload,
  Edit,
  Trash2,
  Check,
  X
} from "lucide-react";

interface SeerItem {
  id: string;
  item_name: string;
  category: 'bride' | 'groom';
  quantity_needed: number;
  quantity_bought: number;
  price_per_item: number | null;
  total_cost: number | null;
  delivery_status: 'pending' | 'ordered' | 'delivered';
  delivery_date: string | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

const SEER_ITEM_SUGGESTIONS = [
  'Silk Saree',
  'Gold Jewelry Set',
  'Silver Items',
  'Fruits & Sweets',
  'Coconut & Betel Leaves',
  'Turmeric & Kumkum',
  'Sacred Thread',
  'Dhoti & Veshti',
  'Flowers Garland',
  'Bangles Set'
];

export const SeerItemsTracker = () => {
  const [seerItems, setSeerItems] = useState<SeerItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeerItem | null>(null);
  const [formData, setFormData] = useState({
    item_name: '',
    category: 'bride' as const,
    quantity_needed: 1,
    quantity_bought: 0,
    price_per_item: '',
    delivery_status: 'pending' as const,
    delivery_date: '',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSeerItems();
  }, []);

  const fetchSeerItems = async () => {
    const { data, error } = await supabase
      .from('seer_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch seer items",
        variant: "destructive",
      });
    } else {
      setSeerItems(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = formData.price_per_item ? parseFloat(formData.price_per_item) : null;
    const total = price && formData.quantity_bought ? price * formData.quantity_bought : null;
    
    const itemData = {
      item_name: formData.item_name,
      category: formData.category,
      quantity_needed: formData.quantity_needed,
      quantity_bought: formData.quantity_bought,
      price_per_item: price,
      total_cost: total,
      delivery_status: formData.delivery_status,
      delivery_date: formData.delivery_date || null,
      notes: formData.notes || null,
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
        description: `Failed to ${editingItem ? 'update' : 'add'} seer item`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Seer item ${editingItem ? 'updated' : 'added'} successfully`,
      });
      resetForm();
      fetchSeerItems();
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
      fetchSeerItems();
    }
  };

  const resetForm = () => {
    setFormData({
      item_name: '',
      category: 'bride',
      quantity_needed: 1,
      quantity_bought: 0,
      price_per_item: '',
      delivery_status: 'pending',
      delivery_date: '',
      notes: ''
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
      price_per_item: item.price_per_item?.toString() || '',
      delivery_status: item.delivery_status,
      delivery_date: item.delivery_date || '',
      notes: item.notes || ''
    });
    setIsDialogOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'ordered': return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <Check className="h-4 w-4" />;
      case 'ordered': return <Upload className="h-4 w-4" />;
      default: return null;
    }
  };

  const brideItems = seerItems.filter(item => item.category === 'bride');
  const groomItems = seerItems.filter(item => item.category === 'groom');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Seer Items Tracker</h1>
          <p className="text-muted-foreground">Manage traditional gift items for bride and groom</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="celebration" onClick={() => resetForm()}>
              <Plus className="h-4 w-4" />
              Add Seer Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Seer Item' : 'Add New Seer Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <select
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select an item...</option>
                  {SEER_ITEM_SUGGESTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'bride' | 'groom' })}
                  className="p-2 border rounded-md"
                >
                  <option value="bride">For Bride</option>
                  <option value="groom">For Groom</option>
                </select>
                <Input
                  type="number"
                  min="1"
                  placeholder="Quantity Needed"
                  value={formData.quantity_needed}
                  onChange={(e) => setFormData({ ...formData, quantity_needed: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  min="0"
                  placeholder="Quantity Bought"
                  value={formData.quantity_bought}
                  onChange={(e) => setFormData({ ...formData, quantity_bought: parseInt(e.target.value) || 0 })}
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price per item"
                  value={formData.price_per_item}
                  onChange={(e) => setFormData({ ...formData, price_per_item: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.delivery_status}
                  onChange={(e) => setFormData({ ...formData, delivery_status: e.target.value as 'pending' | 'ordered' | 'delivered' })}
                  className="p-2 border rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="ordered">Ordered</option>
                  <option value="delivered">Delivered</option>
                </select>
                <Input
                  type="date"
                  placeholder="Delivery Date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="Notes & Special Instructions"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{brideItems.length}</div>
            <div className="text-sm text-muted-foreground">Bride Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{groomItems.length}</div>
            <div className="text-sm text-muted-foreground">Groom Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {seerItems.filter(item => item.delivery_status === 'delivered').length}
            </div>
            <div className="text-sm text-muted-foreground">Delivered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {seerItems.filter(item => item.delivery_status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Items by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bride Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-pink-500" />
              Bride Items ({brideItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {brideItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{item.item_name}</span>
                    <Badge className={`${getStatusBadgeColor(item.delivery_status)} text-white text-xs`}>
                      {getStatusIcon(item.delivery_status)}
                      {item.delivery_status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.quantity_bought}/{item.quantity_needed} items
                    {item.total_cost && <span> • ₹{item.total_cost}</span>}
                  </div>
                  {item.notes && (
                    <div className="text-xs text-muted-foreground mt-1">{item.notes}</div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {brideItems.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No bride items added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Groom Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-blue-500" />
              Groom Items ({groomItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groomItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{item.item_name}</span>
                    <Badge className={`${getStatusBadgeColor(item.delivery_status)} text-white text-xs`}>
                      {getStatusIcon(item.delivery_status)}
                      {item.delivery_status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.quantity_bought}/{item.quantity_needed} items
                    {item.total_cost && <span> • ₹{item.total_cost}</span>}
                  </div>
                  {item.notes && (
                    <div className="text-xs text-muted-foreground mt-1">{item.notes}</div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {groomItems.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No groom items added yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
