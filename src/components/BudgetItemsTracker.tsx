
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Plus,
  Edit,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieChartIcon,
  AlertTriangle
} from "lucide-react";

interface BudgetItem {
  id: string;
  category: string;
  item_name: string;
  budgeted_amount: number;
  actual_amount: number;
  status: string;
  notes?: string;
  vendor_name?: string;
  payment_mode?: string;
}

export const BudgetItemsTracker = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [itemForm, setItemForm] = useState({
    category: '',
    item_name: '',
    budgeted_amount: '',
    actual_amount: '',
    status: 'planned',
    notes: '',
    vendor_name: '',
    payment_mode: ''
  });
  const { toast } = useToast();

  const categories = ['Marriage at Mahal', 'Reception at Mahal', 'Engagement', 'Home Setup'];
  const statusOptions = ['planned', 'pending', 'paid'];

  useEffect(() => {
    fetchBudgetItems();
  }, []);

  const fetchBudgetItems = async () => {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .order('category')
      .order('item_name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch budget items",
        variant: "destructive",
      });
    } else {
      setBudgetItems(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      category: itemForm.category,
      item_name: itemForm.item_name,
      budgeted_amount: parseFloat(itemForm.budgeted_amount) || 0,
      actual_amount: parseFloat(itemForm.actual_amount) || 0,
      status: itemForm.status,
      notes: itemForm.notes || null,
      vendor_name: itemForm.vendor_name || null,
      payment_mode: itemForm.payment_mode || null
    };

    let error;
    if (editingItem) {
      const { error: updateError } = await supabase
        .from('budget_items')
        .update(itemData)
        .eq('id', editingItem.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('budget_items')
        .insert(itemData);
      error = insertError;
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? 'update' : 'add'} budget item`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Budget item ${editingItem ? 'updated' : 'added'} successfully`,
      });
      
      setItemForm({
        category: '',
        item_name: '',
        budgeted_amount: '',
        actual_amount: '',
        status: 'planned',
        notes: '',
        vendor_name: '',
        payment_mode: ''
      });
      setEditingItem(null);
      setIsDialogOpen(false);
      fetchBudgetItems();
    }
  };

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setItemForm({
      category: item.category,
      item_name: item.item_name,
      budgeted_amount: item.budgeted_amount.toString(),
      actual_amount: item.actual_amount.toString(),
      status: item.status,
      notes: item.notes || '',
      vendor_name: item.vendor_name || '',
      payment_mode: item.payment_mode || ''
    });
    setIsDialogOpen(true);
  };

  const getCategoryTotals = (category: string) => {
    const categoryItems = budgetItems.filter(item => item.category === category);
    const budgeted = categoryItems.reduce((sum, item) => sum + item.budgeted_amount, 0);
    const actual = categoryItems.reduce((sum, item) => sum + item.actual_amount, 0);
    return { budgeted, actual, remaining: budgeted - actual };
  };

  const getGrandTotals = () => {
    const budgeted = budgetItems.reduce((sum, item) => sum + item.budgeted_amount, 0);
    const actual = budgetItems.reduce((sum, item) => sum + item.actual_amount, 0);
    return { budgeted, actual, remaining: budgeted - actual };
  };

  const getPieChartData = () => {
    const categoryData = categories.map(category => {
      const items = budgetItems.filter(item => item.category === category);
      const total = items.reduce((sum, item) => sum + item.actual_amount, 0);
      return {
        name: category.replace(' at Mahal', ''),
        value: total,
        fullName: category
      };
    }).filter(item => item.value > 0);

    return categoryData;
  };

  const getBarChartData = () => {
    return categories.map(category => {
      const totals = getCategoryTotals(category);
      return {
        name: category.replace(' at Mahal', ''),
        budgeted: totals.budgeted,
        actual: totals.actual,
        fullName: category
      };
    });
  };

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

  const grandTotals = getGrandTotals();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budget & Expenses Tracker</h1>
          <p className="text-muted-foreground">Track your Tamil wedding budget and expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="celebration" onClick={() => {
              setEditingItem(null);
              setItemForm({
                category: '',
                item_name: '',
                budgeted_amount: '',
                actual_amount: '',
                status: 'planned',
                notes: '',
                vendor_name: '',
                payment_mode: ''
              });
            }}>
              <Plus className="h-4 w-4" />
              Add Budget Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit' : 'Add'} Budget Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select value={itemForm.category} onValueChange={(value) => setItemForm({ ...itemForm, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Item Name"
                value={itemForm.item_name}
                onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })}
                required
              />
              
              <Input
                placeholder="Budgeted Amount (₹)"
                type="number"
                value={itemForm.budgeted_amount}
                onChange={(e) => setItemForm({ ...itemForm, budgeted_amount: e.target.value })}
                required
              />
              
              <Input
                placeholder="Actual Amount (₹)"
                type="number"
                value={itemForm.actual_amount}
                onChange={(e) => setItemForm({ ...itemForm, actual_amount: e.target.value })}
              />
              
              <Select value={itemForm.status} onValueChange={(value) => setItemForm({ ...itemForm, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Vendor Name (Optional)"
                value={itemForm.vendor_name}
                onChange={(e) => setItemForm({ ...itemForm, vendor_name: e.target.value })}
              />
              
              <Input
                placeholder="Payment Mode (Optional)"
                value={itemForm.payment_mode}
                onChange={(e) => setItemForm({ ...itemForm, payment_mode: e.target.value })}
              />
              
              <Input
                placeholder="Notes (Optional)"
                value={itemForm.notes}
                onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
              />
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 celebration">
                  {editingItem ? 'Update' : 'Add'} Item
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{grandTotals.budgeted.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">₹{grandTotals.actual.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${grandTotals.remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
              ₹{grandTotals.remaining.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {grandTotals.budgeted > 0 ? Math.round((grandTotals.actual / grandTotals.budgeted) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Category-wise Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getPieChartData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getPieChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Budget vs Actual by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getBarChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Bar dataKey="budgeted" fill="#8884d8" name="Budgeted" />
                <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category-wise Breakdown */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Category-wise Budget Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category.replace(' at Mahal', '')}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map(category => {
              const categoryItems = budgetItems.filter(item => item.category === category);
              const totals = getCategoryTotals(category);
              
              return (
                <TabsContent key={category} value={category} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{category}</h3>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Budget: ₹{totals.budgeted.toLocaleString()} | 
                        Spent: ₹{totals.actual.toLocaleString()}
                      </p>
                      <p className={`text-sm font-medium ${totals.remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {totals.remaining >= 0 ? 'Remaining' : 'Over budget'}: ₹{Math.abs(totals.remaining).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {categoryItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{item.item_name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === 'paid' ? 'bg-success/20 text-success' :
                              item.status === 'pending' ? 'bg-warning/20 text-warning' :
                              'bg-muted-foreground/20 text-muted-foreground'
                            }`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                            {item.actual_amount > item.budgeted_amount && (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                          
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span>Budget: ₹{item.budgeted_amount.toLocaleString()}</span>
                            <span>Actual: ₹{item.actual_amount.toLocaleString()}</span>
                            {item.vendor_name && <span>Vendor: {item.vendor_name}</span>}
                          </div>
                          
                          {item.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                          )}
                        </div>
                        
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
