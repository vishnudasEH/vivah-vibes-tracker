
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  ShoppingCart,
  MapPin,
  Edit,
  Trash2
} from "lucide-react";

interface PoojaItem {
  id: string;
  item_name: string;
  ritual_name: string;
  quantity_needed: number;
  status: 'needed' | 'bought' | 'pending';
  source_info?: string;
  notes?: string;
  created_at: string;
}

const RITUAL_TEMPLATES = [
  'Ganapathi Homam',
  'Navagraha Homam',
  'Kalyana Mandapam Setup',
  'Mangalya Dharanam',
  'Saptapadi',
  'Kanyadanam',
  'Jeelakarra Bellam',
  'Talambralu',
  'Grihapravesh'
];

const POOJA_ITEM_SUGGESTIONS = [
  'Turmeric Powder',
  'Kumkum',
  'Sandalwood Paste',
  'Camphor',
  'Incense Sticks',
  'Oil Lamps',
  'Coconut',
  'Betel Leaves',
  'Banana',
  'Mango Leaves',
  'Flowers (Rose)',
  'Flowers (Jasmine)',
  'Sacred Thread',
  'Rice',
  'Ghee',
  'Honey',
  'Milk',
  'Curd',
  'Sugar',
  'Dry Fruits'
];

export const PoojaItemsTracker = () => {
  const [poojaItems, setPoojaItems] = useState<PoojaItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PoojaItem | null>(null);
  const [formData, setFormData] = useState({
    item_name: '',
    ritual_name: '',
    quantity_needed: 1,
    status: 'needed' as const,
    source_info: '',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPoojaItems();
  }, []);

  const fetchPoojaItems = async () => {
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
      setPoojaItems(data || []);
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
        description: `Failed to ${editingItem ? 'update' : 'add'} pooja item`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Pooja item ${editingItem ? 'updated' : 'added'} successfully`,
      });
      resetForm();
      fetchPoojaItems();
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
      fetchPoojaItems();
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'bought': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const groupedItems = poojaItems.reduce((acc, item) => {
    if (!acc[item.ritual_name]) {
      acc[item.ritual_name] = [];
    }
    acc[item.ritual_name].push(item);
    return acc;
  }, {} as Record<string, PoojaItem[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pooja Items Tracker</h1>
          <p className="text-muted-foreground">Manage ritual items for each ceremony</p>
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
              <select
                value={formData.ritual_name}
                onChange={(e) => setFormData({ ...formData, ritual_name: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select a ritual...</option>
                {RITUAL_TEMPLATES.map((ritual) => (
                  <option key={ritual} value={ritual}>{ritual}</option>
                ))}
              </select>
              <select
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select an item...</option>
                {POOJA_ITEM_SUGGESTIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  min="1"
                  placeholder="Quantity Needed"
                  value={formData.quantity_needed}
                  onChange={(e) => setFormData({ ...formData, quantity_needed: parseInt(e.target.value) || 1 })}
                  required
                />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'needed' | 'bought' | 'pending' })}
                  className="p-2 border rounded-md"
                >
                  <option value="needed">Needed</option>
                  <option value="pending">Pending</option>
                  <option value="bought">Bought</option>
                </select>
              </div>
              <Input
                placeholder="Source Information (Shop, Contact, etc.)"
                value={formData.source_info}
                onChange={(e) => setFormData({ ...formData, source_info: e.target.value })}
              />
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
            <div className="text-2xl font-bold text-primary">{poojaItems.length}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {poojaItems.filter(item => item.status === 'needed').length}
            </div>
            <div className="text-sm text-muted-foreground">Needed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {poojaItems.filter(item => item.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {poojaItems.filter(item => item.status === 'bought').length}
            </div>
            <div className="text-sm text-muted-foreground">Bought</div>
          </CardContent>
        </Card>
      </div>

      {/* Items by Ritual */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([ritualName, items]) => (
          <Card key={ritualName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flower2 className="h-5 w-5 text-primary" />
                {ritualName} ({items.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{item.item_name}</span>
                        <Badge className={`${getStatusBadgeColor(item.status)} text-white text-xs`}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Quantity: {item.quantity_needed}
                      </div>
                      {item.source_info && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {item.source_info}
                        </div>
                      )}
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {poojaItems.length === 0 && (
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
