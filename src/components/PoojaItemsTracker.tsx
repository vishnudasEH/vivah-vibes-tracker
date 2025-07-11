
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
  Flower2,
  CheckCircle2,
  Clock,
  ShoppingCart,
  Edit,
  Trash2
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type PoojaItem = Tables<'pooja_items'>;

export const PoojaItemsTracker = () => {
  const [items, setItems] = useState<PoojaItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PoojaItem | null>(null);
  const [formData, setFormData] = useState({
    item_name: '',
    ritual_name: '',
    quantity_needed: 1,
    status: 'needed' as PoojaItem['status'],
    source_info: '',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('pooja_items')
      .select('*')
      .order('ritual_name', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pooja items",
        variant: "destructive",
      });
    } else {
      setItems(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      item_name: formData.item_name,
      ritual_name: formData.ritual_name,
      quantity_needed: formData.quantity_needed,
      status: formData.status,
      source_info: formData.source_info || null,
      notes: formData.notes || null,
    };

    let error;
    if (editingItem) {
      ({ error } = await supabase
        .from('pooja_items')
        .update(itemData)
        .eq('id', editingItem.id));
    } else {
      ({ error } = await supabase
        .from('pooja_items')
        .insert(itemData));
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? 'update' : 'create'} pooja item`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Pooja item ${editingItem ? 'updated' : 'added'} successfully`,
      });
      resetForm();
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('pooja_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete pooja item",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Pooja item deleted successfully",
      });
      fetchItems();
    }
  };

  const resetForm = () => {
    setFormData({
      item_name: '',
      ritual_name: '',
      quantity_needed: 1,
      status: 'needed',
      source_info: '',
      notes: ''
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: PoojaItem) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      ritual_name: item.ritual_name,
      quantity_needed: item.quantity_needed,
      status: item.status,
      source_info: item.source_info || '',
      notes: item.notes || ''
    });
    setIsDialogOpen(true);
  };

  const toggleStatus = async (itemId: string, currentStatus: PoojaItem['status']) => {
    const statusOrder: PoojaItem['status'][] = ['needed', 'pending', 'bought'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIndex];

    const { error } = await supabase
      .from('pooja_items')
      .update({ status: newStatus })
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      fetchItems();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'bought':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'pending':
        return <ShoppingCart className="h-4 w-4 text-secondary" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'bought':
        return <Badge className="bg-success text-success-foreground">Bought</Badge>;
      case 'pending':
        return <Badge className="bg-secondary text-secondary-foreground">Pending</Badge>;
      default:
        return <Badge variant="outline">Needed</Badge>;
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.ritual_name]) {
      acc[item.ritual_name] = [];
    }
    acc[item.ritual_name].push(item);
    return acc;
  }, {} as Record<string, PoojaItem[]>);

  const stats = {
    totalItems: items.length,
    needed: items.filter(i => i.status === 'needed').length,
    pending: items.filter(i => i.status === 'pending').length,
    bought: items.filter(i => i.status === 'bought').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pooja Items Tracker</h1>
          <p className="text-muted-foreground">Track ritual items needed for each ceremony</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="celebration" onClick={() => resetForm()}>
              <Plus className="h-4 w-4" />
              Add Pooja Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Pooja Item' : 'Add New Pooja Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Item Name (e.g., Kumkum, Turmeric, Rice)"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Ritual Name (e.g., Ganapathi Homam, Kalyanam)"
                  value={formData.ritual_name}
                  onChange={(e) => setFormData({ ...formData, ritual_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Quantity Needed"
                  type="number"
                  min="1"
                  value={formData.quantity_needed}
                  onChange={(e) => setFormData({ ...formData, quantity_needed: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div>
                <Select value={formData.status} onValueChange={(value: PoojaItem['status']) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="needed">Needed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="bought">Bought</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  placeholder="Source Info (where to buy from)"
                  value={formData.source_info}
                  onChange={(e) => setFormData({ ...formData, source_info: e.target.value })}
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
            <div className="text-2xl font-bold text-muted-foreground">{stats.needed}</div>
            <p className="text-sm text-muted-foreground">Needed</p>
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
            <div className="text-2xl font-bold text-success">{stats.bought}</div>
            <p className="text-sm text-muted-foreground">Bought</p>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Items by Ritual */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([ritualName, ritualItems]) => (
          <Card key={ritualName} className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flower2 className="h-5 w-5 text-primary" />
                {ritualName}
                <Badge variant="outline">{ritualItems.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {ritualItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{item.item_name}</h4>
                        <Badge variant="outline">Qty: {item.quantity_needed}</Badge>
                        {getStatusBadge(item.status)}
                      </div>
                      {item.source_info && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Source:</strong> {item.source_info}
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
                        onClick={() => toggleStatus(item.id, item.status)}
                        className="flex items-center gap-2"
                      >
                        {getStatusIcon(item.status)}
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
        ))}
      </div>

      {items.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Flower2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No pooja items added yet. Click "Add Pooja Item" to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
