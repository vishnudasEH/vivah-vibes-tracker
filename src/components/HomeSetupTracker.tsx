
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Camera, 
  Receipt, 
  Calendar, 
  Filter, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  ChevronDown,
  Upload,
  Download,
  Home,
  ShoppingCart
} from "lucide-react";
import { format } from "date-fns";

interface HomeSetupItem {
  id: string;
  category: string;
  item_name: string;
  estimated_price: number;
  actual_price: number;
  status: 'planned' | 'purchased' | 'delivered' | 'pending';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  photo_url?: string;
  receipt_url?: string;
  reminder_date?: string;
  purchase_date?: string;
  delivery_date?: string;
  vendor_info?: string;
  created_at: string;
  updated_at: string;
}

interface HomeSetupCategory {
  id: string;
  name: string;
  icon?: string;
  sort_order: number;
}

interface HomeSetupDocument {
  id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  notes?: string;
}

const defaultItems = {
  'Rental Setup': [
    'Home Advance / Deposit (₹1,00,000)',
    'First Month Rent',
    'Painting / Deep Cleaning'
  ],
  'Bedroom Essentials': [
    'Mattress',
    'Pillows',
    'Bedsheets',
    'Curtains',
    'Wardrobe',
    'Dressing Table',
    'Air Conditioner (AC)'
  ],
  'Kitchen Essentials': [
    'Water Dispenser / Filter',
    'Dish Rack & Cleaning Supplies',
    'Trash Bin',
    'Electric Kettle / Induction Stove',
    'Veg/Food Storage Containers'
  ],
  'Bathroom Essentials': [
    'Bucket, Mug',
    'Towels, Toiletries',
    'Hooks, Mirror, Rack',
    'Skincare Products'
  ],
  'Living Room & Utilities': [
    'Plastic Chairs / Sofa',
    'Center Table',
    'Ceiling Fan / Pedestal Fan',
    'LED Bulbs / Tube Lights',
    'WiFi Router Setup',
    'Wall Mounts (TV, Clock, etc.)',
    'Doormat, Shoe Rack'
  ],
  'Miscellaneous': [
    'Iron Box',
    'Laundry Bag/Basket',
    'First Aid Kit',
    'Insect Killer / Mosquito Bat',
    'Emergency Light',
    'Extension Boards / Multi-Plugs'
  ]
};

export const HomeSetupTracker = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<HomeSetupItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<HomeSetupItem>>({
    category: '',
    item_name: '',
    estimated_price: 0,
    actual_price: 0,
    status: 'planned',
    priority: 'medium'
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['home-setup-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_setup_categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as HomeSetupCategory[];
    }
  });

  // Fetch items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['home-setup-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_setup_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as HomeSetupItem[];
    }
  });

  // Fetch documents
  const { data: documents = [] } = useQuery({
    queryKey: ['home-setup-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_setup_documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as HomeSetupDocument[];
    }
  });

  // Create/Update item mutation
  const itemMutation = useMutation({
    mutationFn: async (item: Partial<HomeSetupItem>) => {
      if (item.id) {
        const { data, error } = await supabase
          .from('home_setup_items')
          .update(item)
          .eq('id', item.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('home_setup_items')
          .insert(item)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-setup-items'] });
      setEditingItem(null);
      setIsAddingItem(false);
      setNewItem({
        category: '',
        item_name: '',
        estimated_price: 0,
        actual_price: 0,
        status: 'planned',
        priority: 'medium'
      });
      toast.success(editingItem ? "Item updated successfully!" : "Item added successfully!");
    },
    onError: (error) => {
      console.error('Error saving item:', error);
      toast.error("Failed to save item");
    }
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('home_setup_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-setup-items'] });
      toast.success("Item deleted successfully!");
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      toast.error("Failed to delete item");
    }
  });

  // Add default items for a category
  const addDefaultItems = async (categoryName: string) => {
    const itemsToAdd = defaultItems[categoryName as keyof typeof defaultItems] || [];
    
    for (const itemName of itemsToAdd) {
      await supabase
        .from('home_setup_items')
        .insert({
          category: categoryName,
          item_name: itemName,
          estimated_price: 0,
          actual_price: 0,
          status: 'planned',
          priority: 'medium'
        });
    }
    
    queryClient.invalidateQueries({ queryKey: ['home-setup-items'] });
    toast.success(`Added default items for ${categoryName}!`);
  };

  // Calculate statistics
  const stats = {
    totalItems: items.length,
    itemsPurchased: items.filter(item => item.status === 'purchased' || item.status === 'delivered').length,
    totalEstimated: items.reduce((sum, item) => sum + (item.estimated_price || 0), 0),
    totalSpent: items.reduce((sum, item) => sum + (item.actual_price || 0), 0),
    overBudgetItems: items.filter(item => (item.actual_price || 0) > (item.estimated_price || 0) && item.estimated_price > 0).length
  };

  const progressPercentage = stats.totalItems > 0 ? (stats.itemsPurchased / stats.totalItems) * 100 : 0;

  // Filter items
  const filteredItems = items.filter(item => {
    const categoryMatch = selectedCategory === "all" || item.category === selectedCategory;
    const statusMatch = statusFilter === "all" || item.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'purchased': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveItem = (item: Partial<HomeSetupItem>) => {
    itemMutation.mutate(item);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Home className="h-8 w-8" />
            Home Setup & Rental Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Track everything for your new 1BHK setup post-marriage
          </p>
        </div>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalItems}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.itemsPurchased}</div>
              <div className="text-sm text-muted-foreground">Items Purchased</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">₹{stats.totalEstimated.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Estimated Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">₹{stats.totalSpent.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.overBudgetItems}</div>
              <div className="text-sm text-muted-foreground">Over Budget</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {stats.totalSpent > stats.totalEstimated && stats.totalEstimated > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-red-700 text-sm">
                You're ₹{(stats.totalSpent - stats.totalEstimated).toLocaleString()} over budget!
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters and Actions */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="purchased">Purchased</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setIsAddingItem(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{item.item_name}</h3>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">{item.category}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Estimated: </span>
                          <span className="font-medium">₹{item.estimated_price?.toLocaleString() || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Actual: </span>
                          <span className={`font-medium ${
                            (item.actual_price || 0) > (item.estimated_price || 0) && item.estimated_price > 0 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            ₹{item.actual_price?.toLocaleString() || 0}
                          </span>
                        </div>
                        {item.vendor_info && (
                          <div>
                            <span className="text-muted-foreground">Vendor: </span>
                            <span className="font-medium">{item.vendor_info}</span>
                          </div>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-4">
            {categories.map(category => {
              const categoryItems = items.filter(item => item.category === category.name);
              const categorySpent = categoryItems.reduce((sum, item) => sum + (item.actual_price || 0), 0);
              const categoryEstimated = categoryItems.reduce((sum, item) => sum + (item.estimated_price || 0), 0);

              return (
                <Collapsible key={category.id}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">{category.icon}</span>
                            {category.name}
                            <Badge variant="outline">{categoryItems.length} items</Badge>
                          </CardTitle>
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <div>₹{categorySpent.toLocaleString()} / ₹{categoryEstimated.toLocaleString()}</div>
                              <div className="text-muted-foreground">Spent / Budget</div>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addDefaultItems(category.name)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Default Items
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {categoryItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">{item.item_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  ₹{item.actual_price?.toLocaleString() || 0} / ₹{item.estimated_price?.toLocaleString() || 0}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(item.status)}>
                                  {item.status}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingItem(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map(category => {
                  const categoryItems = items.filter(item => 
                    item.category === category.name && 
                    (item.status === 'planned' || item.status === 'pending')
                  );
                  
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={category.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-xl">{category.icon}</span>
                        {category.name}
                      </h3>
                      <div className="grid gap-2">
                        {categoryItems.map(item => (
                          <div key={item.id} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              className="rounded"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleSaveItem({ ...item, status: 'purchased' });
                                }
                              }}
                            />
                            <span className="flex-1">{item.item_name}</span>
                            <span className="text-sm text-muted-foreground">
                              ₹{item.estimated_price?.toLocaleString() || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Documents
                </span>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload rental agreements, ID proofs, and bills here</p>
                <p className="text-sm">Support for PDF, images, and documents</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Item Dialog */}
      <Dialog open={isAddingItem || editingItem !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddingItem(false);
          setEditingItem(null);
          setNewItem({
            category: '',
            item_name: '',
            estimated_price: 0,
            actual_price: 0,
            status: 'planned',
            priority: 'medium'
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </DialogTitle>
          </DialogHeader>
          
          <ItemForm
            item={editingItem || newItem}
            categories={categories}
            onSave={handleSaveItem}
            onCancel={() => {
              setIsAddingItem(false);
              setEditingItem(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Item Form Component
interface ItemFormProps {
  item: Partial<HomeSetupItem>;
  categories: HomeSetupCategory[];
  onSave: (item: Partial<HomeSetupItem>) => void;
  onCancel: () => void;
}

const ItemForm = ({ item, categories, onSave, onCancel }: ItemFormProps) => {
  const [formData, setFormData] = useState(item);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            value={formData.category || ''} 
            onValueChange={(value) => setFormData({...formData, category: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="item_name">Item Name</Label>
          <Input
            id="item_name"
            value={formData.item_name || ''}
            onChange={(e) => setFormData({...formData, item_name: e.target.value})}
            placeholder="Enter item name"
            required
          />
        </div>

        <div>
          <Label htmlFor="estimated_price">Estimated Price (₹)</Label>
          <Input
            id="estimated_price"
            type="number"
            value={formData.estimated_price || 0}
            onChange={(e) => setFormData({...formData, estimated_price: Number(e.target.value)})}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="actual_price">Actual Price (₹)</Label>
          <Input
            id="actual_price"
            type="number"
            value={formData.actual_price || 0}
            onChange={(e) => setFormData({...formData, actual_price: Number(e.target.value)})}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status || 'planned'} 
            onValueChange={(value) => setFormData({...formData, status: value as any})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="purchased">Purchased</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={formData.priority || 'medium'} 
            onValueChange={(value) => setFormData({...formData, priority: value as any})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vendor_info">Vendor Info</Label>
          <Input
            id="vendor_info"
            value={formData.vendor_info || ''}
            onChange={(e) => setFormData({...formData, vendor_info: e.target.value})}
            placeholder="Vendor name or details"
          />
        </div>

        <div>
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Input
            id="purchase_date"
            type="date"
            value={formData.purchase_date || ''}
            onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional notes or details"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {item.id ? 'Update' : 'Add'} Item
        </Button>
      </div>
    </form>
  );
};
