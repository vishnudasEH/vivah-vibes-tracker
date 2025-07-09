
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieChartIcon
} from "lucide-react";

interface BudgetCategory {
  id: string;
  name: string;
  estimated_amount: number;
  actual_amount: number;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  expense_date: string;
  category_id?: string;
  vendor_id?: string;
}

export const BudgetTracker = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category_id: '',
    expense_date: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBudgetData();
    fetchExpenses();
  }, []);

  const fetchBudgetData = async () => {
    const { data, error } = await supabase
      .from('budget_categories')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch budget data",
        variant: "destructive",
      });
    } else {
      setCategories(data || []);
    }
  };

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive",
      });
    } else {
      setExpenses(data || []);
    }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('expenses')
      .insert({
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        category_id: expenseForm.category_id || null,
        expense_date: expenseForm.expense_date
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    } else {
      // Update actual amount in budget category
      if (expenseForm.category_id) {
        const category = categories.find(c => c.id === expenseForm.category_id);
        if (category) {
          await supabase
            .from('budget_categories')
            .update({ 
              actual_amount: category.actual_amount + parseFloat(expenseForm.amount) 
            })
            .eq('id', expenseForm.category_id);
        }
      }

      toast({
        title: "Success",
        description: "Expense added successfully",
      });
      
      setExpenseForm({
        description: '',
        amount: '',
        category_id: '',
        expense_date: new Date().toISOString().split('T')[0]
      });
      setIsExpenseDialogOpen(false);
      fetchBudgetData();
      fetchExpenses();
    }
  };

  const updateBudget = async (categoryId: string, newEstimate: number) => {
    const { error } = await supabase
      .from('budget_categories')
      .update({ estimated_amount: newEstimate })
      .eq('id', categoryId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
      fetchBudgetData();
    }
  };

  const totalEstimated = categories.reduce((sum, cat) => sum + cat.estimated_amount, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.actual_amount, 0);
  const remaining = totalEstimated - totalSpent;

  const pieData = categories.map(cat => ({
    name: cat.name,
    value: cat.actual_amount,
    estimated: cat.estimated_amount
  })).filter(item => item.value > 0);

  const chartData = categories.map(cat => ({
    name: cat.name.length > 8 ? cat.name.substring(0, 8) + '...' : cat.name,
    estimated: cat.estimated_amount,
    actual: cat.actual_amount,
    remaining: Math.max(0, cat.estimated_amount - cat.actual_amount)
  }));

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budget Tracker</h1>
          <p className="text-muted-foreground">Track your wedding expenses and budget</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="celebration">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={addExpense} className="space-y-4">
                <Input
                  placeholder="Expense Description"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  required
                />
                <Input
                  placeholder="Amount (₹)"
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  required
                />
                <Select value={expenseForm.category_id} onValueChange={(value) => setExpenseForm({ ...expenseForm, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={expenseForm.expense_date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 celebration">Add Expense</Button>
                  <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{totalEstimated.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">₹{totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
              ₹{remaining.toLocaleString()}
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
              {totalEstimated > 0 ? Math.round((totalSpent / totalEstimated) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
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
            <CardTitle>Budget vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Bar dataKey="estimated" fill="#8884d8" name="Estimated" />
                <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => {
              const progress = category.estimated_amount > 0 
                ? (category.actual_amount / category.estimated_amount) * 100 
                : 0;
              
              return (
                <div key={category.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{category.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      ₹{category.actual_amount.toLocaleString()} / ₹{category.estimated_amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${progress > 100 ? 'bg-destructive' : 'bg-primary'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className={progress > 100 ? 'text-destructive' : 'text-muted-foreground'}>
                      {progress.toFixed(1)}% used
                    </span>
                    {progress > 100 && (
                      <span className="text-destructive font-medium">
                        Over budget by ₹{(category.actual_amount - category.estimated_amount).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.slice(0, 10).map((expense) => {
              const category = categories.find(c => c.id === expense.category_id);
              return (
                <div key={expense.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {category?.name} • {new Date(expense.expense_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{expense.amount.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
