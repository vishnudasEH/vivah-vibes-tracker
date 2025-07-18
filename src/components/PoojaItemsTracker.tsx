
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
    ritual_name: '',
    item_name: '',
    quantity_needed: 1,
    status: 'needed' as PoojaItem['status'],
    notes: '',
    source_info: ''
  });
  const { toast } = useToast();

  const ceremonies = [
    'Nichayathartham',
    'Panda Kaal Muhurtham',
    'Sumangali Prarthanai',
    'Muhurtham',
    'Nalangu',
    'Other'
  ];

  const commonItems = [
    'Turmeric (Manjal)',
    'Kumkum',
    'Banana Leaf',
    'Betel Leaf (Vetrilai)',
    'Coconut',
    'Rice',
    'Flowers (Marigold)',
    'Sandal Paste',
    'Camphor',
    'Oil Lamp (Vilakku)',
    'Incense Sticks',
    'Sacred Thread (Kalava)',
    'Fruits',
    'Milk',
    'Honey',
    'Ghee',
    'Sugar',
    'Betel Nuts (Pakku)',
    'Gold Coins',
    'New Clothes'
  ];

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
      ritual_name: formData.ritual_name,
      item_name: formData.item_name,
      quantity_needed: formData.quantity_needed,
      status: formData.status,
      notes: formData.notes || null,
      source_info: formData.source_info || null,
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
      ritual_name: '',
      item_name: '',
      quantity_needed: 1,
      status: 'needed',
      notes: '',
      source_info: ''
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: PoojaItem) => {
    setEditingItem(item);
    setFormData({
      ritual_name: item.ritual_name,
      item_name: item.item_name,
      quantity_needed: item.quantity_needed,
      status: item.status,
      notes: item.notes || '',
      source_info: item.source_info || ''
    });
    setIsDialogOpen(true);
  };

  const toggleStatus = async (itemId: string, currentStatus: PoojaItem['status']) => {
    const newStatus = currentStatus === 'needed' ? 'purchased' : 'needed';

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

  const markCeremonyComplete = async (ritualName: string) => {
    const { error } = await supabase
      .from('pooja_items')
      .update({ status: 'purchased' })
      .eq('ritual_name', ritualName)
      .eq('status', 'needed');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark ceremony as complete",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `All items for ${ritualName} marked as purchased`,
      });
      fetchItems();
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'purchased' 
      ? <CheckCircle2 className="h-4 w-4 text-success" />
      : <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string) => {
    return status === 'purchased'
      ? <Badge className="bg-success text-success-foreground">Purchased</Badge>
      : <Badge variant="outline">Needed</Badge>;
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
    purchased: items.filter(i => i.status === 'purchased').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pooja Items Tracker</h1>
          <p className="text-muted-foreground">Track ritual items needed for each Tamil ceremony</p>
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
                <Select value={formData.ritual_name} onValueChange={(value) => setFormData({ ...formData, ritual_name: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Ceremony" />
                  </SelectTrigger>
                  <SelectContent>
                    {ceremonies.map((ceremony) => (
                      <SelectItem key={ceremony} value={ceremony}>{ceremony}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={formData.item_name} onValueChange={(value) => setFormData({ ...formData, item_name: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Item" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonItems.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.item_name === 'custom' && (
                <div>
                  <Input
                    placeholder="Enter custom item name"
                    value={formData.item_name === 'custom' ? '' : formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    required
                  />
                </div>
              )}
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
                    <SelectItem value="purchased">Purchased</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  placeholder="Source Info (optional)"
                  value={formData.source_info}
                  onChange={(e) => setFormData({ ...formData, source_info: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Notes (optional)"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="text-2xl font-bold text-success">{stats.purchased}</div>
            <p className="text-sm text-muted-foreground">Purchased</p>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Items by Ceremony */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([ritualName, ritualItems]) => (
          <Card key={ritualName} className="shadow-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Flower2 className="h-5 w-5 text-primary" />
                  {ritualName}
                  <Badge variant="outline">{ritualItems.length} items</Badge>
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markCeremonyComplete(ritualName)}
                  disabled={ritualItems.every(item => item.status === 'purchased')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark All Complete
                </Button>
              </div>
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
                          <span className="font-medium">Source:</span> {item.source_info}
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
                        Toggle Status
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
