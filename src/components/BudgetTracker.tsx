import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  FileText,
  Download,
  Upload,
  Filter,
  Search
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { 
  Plus,
  DollarSign,
  Wallet,
  PieChart as PieChartIcon,
  Calculator
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

interface Expense {
  id: string;
  description: string;
  amount: number;
  expense_date: string;
  category_id?: string;
  vendor_id?: string;
}

interface BudgetGoal {
  id: string;
  category: string;
  target_amount: number;
  target_date: string;
  priority: 'low' | 'medium' | 'high';
}

export const BudgetTracker = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'analytics'>('overview');
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    expense_date: new Date().toISOString().split('T')[0]
  });
  const [goalForm, setGoalForm] = useState({
    category: '',
    target_amount: '',
    target_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const { toast } = useToast();

  const categories = ['Marriage at Mahal', 'Reception at Mahal', 'Engagement', 'Home Setup'];

  useEffect(() => {
    fetchBudgetData();
    fetchExpenses();
  }, []);

  const fetchBudgetData = async () => {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .order('category')
      .order('item_name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch budget data",
        variant: "destructive",
      });
    } else {
      setBudgetItems(data || []);
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
        expense_date: expenseForm.expense_date
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
      
      setExpenseForm({
        description: '',
        amount: '',
        category: '',
        expense_date: new Date().toISOString().split('T')[0]
      });
      setIsExpenseDialogOpen(false);
      fetchExpenses();
    }
  };

  const addBudgetGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGoal = {
      id: Date.now().toString(),
      category: goalForm.category,
      target_amount: parseFloat(goalForm.target_amount),
      target_date: goalForm.target_date,
      priority: goalForm.priority
    };
    
    setBudgetGoals([...budgetGoals, newGoal]);
    
    toast({
      title: "Success",
      description: "Budget goal added successfully",
    });
    
    setGoalForm({
      category: '',
      target_amount: '',
      target_date: '',
      priority: 'medium'
    });
    setIsGoalDialogOpen(false);
  };

  const getCategoryTotals = (category: string) => {
    const categoryItems = budgetItems.filter(item => item.category === category);
    const budgeted = categoryItems.reduce((sum, item) => sum + item.budgeted_amount, 0);
    const actual = categoryItems.reduce((sum, item) => sum + item.actual_amount, 0);
    return { budgeted, actual };
  };

  const totalEstimated = budgetItems.reduce((sum, item) => sum + item.budgeted_amount, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.actual_amount, 0);
  const remaining = totalEstimated - totalSpent;
  const budgetUtilization = totalEstimated > 0 ? (totalSpent / totalEstimated) * 100 : 0;

  const filteredExpenses = expenses.filter(expense => {
    if (searchTerm && !expense.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (dateFilter !== 'all') {
      const expenseDate = new Date(expense.expense_date);
      const now = new Date();
      if (dateFilter === 'week' && expenseDate < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        return false;
      }
      if (dateFilter === 'month' && expenseDate < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        return false;
      }
    }
    return true;
  });

  const pieData = categories.map(category => {
    const totals = getCategoryTotals(category);
    return {
      name: category.replace(' at Mahal', ''),
      value: totals.actual,
      estimated: totals.budgeted,
      percentage: totalSpent > 0 ? ((totals.actual / totalSpent) * 100).toFixed(1) : 0
    };
  }).filter(item => item.value > 0);

  const trendData = expenses.slice(0, 10).reverse().map((expense, index) => ({
    date: new Date(expense.expense_date).toLocaleDateString(),
    amount: expense.amount,
    cumulative: expenses.slice(0, index + 1).reduce((sum, e) => sum + e.amount, 0)
  }));

  const monthlySpendingData = categories.map(category => {
    const totals = getCategoryTotals(category);
    return {
      name: category.length > 8 ? category.replace(' at Mahal', '') : category,
      estimated: totals.budgeted,
      actual: totals.actual,
      variance: totals.actual - totals.budgeted,
      efficiency: totals.budgeted > 0 ? ((totals.budgeted - totals.actual) / totals.budgeted * 100).toFixed(1) : 0
    };
  });

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

  const exportToCSV = () => {
    const csvContent = [
      ['Category', 'Item', 'Budgeted', 'Actual', 'Status', 'Vendor', 'Notes'].join(','),
      ...budgetItems.map(item => [
        item.category,
        item.item_name,
        item.budgeted_amount,
        item.actual_amount,
        item.status,
        item.vendor_name || '',
        item.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget-tracker.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-8 w-8 text-primary" />
            Smart Budget Tracker
          </h1>
          <p className="text-muted-foreground">AI-powered wedding budget management</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
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

          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Target className="h-4 w-4" />
                Set Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Budget Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={addBudgetGoal} className="space-y-4">
                <Select value={goalForm.category} onValueChange={(value) => setGoalForm({ ...goalForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Target Amount (₹)"
                  type="number"
                  value={goalForm.target_amount}
                  onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
                  required
                />
                
                <Input
                  type="date"
                  value={goalForm.target_date}
                  onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                  required
                />
                
                <Select value={goalForm.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setGoalForm({ ...goalForm, priority: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Set Goal</Button>
                  <Button type="button" variant="outline" onClick={() => setIsGoalDialogOpen(false)}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {budgetUtilization > 90 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">Budget Alert!</h3>
                <p className="text-sm text-muted-foreground">
                  You've used {budgetUtilization.toFixed(1)}% of your total budget. Consider reviewing your spending.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{totalEstimated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Allocated funds</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">₹{totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{budgetUtilization.toFixed(1)}% utilized</p>
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
            <p className="text-xs text-muted-foreground">
              {remaining >= 0 ? 'Within budget' : 'Over budget'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Category</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              ₹{categories.length > 0 ? Math.round(totalSpent / categories.length).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per category spend</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalEstimated > 0 ? Math.round(((totalEstimated - totalSpent) / totalEstimated) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Budget efficiency</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Budget Distribution</CardTitle>
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
                      label={({ name, percentage }) => `${name} ${percentage}%`}
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
                <CardTitle>Spending Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                    <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="cumulative" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Category Wise Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {categories.map((category) => {
                  const totals = getCategoryTotals(category);
                  const progress = totals.budgeted > 0 ? (totals.actual / totals.budgeted) * 100 : 0;
                  const isOverBudget = progress > 100;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2">
                          {category}
                          {isOverBudget && <Badge variant="destructive">Over Budget</Badge>}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          ₹{totals.actual.toLocaleString()} / ₹{totals.budgeted.toLocaleString()}
                        </div>
                      </div>
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className={`h-3 ${isOverBudget ? 'bg-destructive/20' : ''}`}
                      />
                      <div className="flex justify-between items-center text-sm">
                        <span className={isOverBudget ? 'text-destructive' : 'text-muted-foreground'}>
                          {progress.toFixed(1)}% utilized
                        </span>
                        {isOverBudget && (
                          <span className="text-destructive font-medium">
                            Excess: ₹{(totals.actual - totals.budgeted).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 min-w-[200px]">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Date Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Expenses ({filteredExpenses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(expense.expense_date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">₹{expense.amount.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">
                        {expense.amount > 5000 ? 'High' : expense.amount > 1000 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredExpenses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    No expenses found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Budget vs Actual Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlySpendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `₹${Number(value).toLocaleString()}`,
                        name === 'estimated' ? 'Budgeted' : name === 'actual' ? 'Actual' : 'Variance'
                      ]} 
                    />
                    <Bar dataKey="estimated" fill="#8884d8" name="estimated" />
                    <Bar dataKey="actual" fill="#82ca9d" name="actual" />
                    <Bar dataKey="variance" fill="#ffc658" name="variance" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Spending Efficiency Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlySpendingData.map((category, index) => (
                    <div key={category.name} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {category.efficiency}% efficiency
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={parseFloat(category.efficiency) > 0 ? "default" : "destructive"}
                          className="mb-1"
                        >
                          {parseFloat(category.efficiency) > 0 ? 'Saved' : 'Over'}
                        </Badge>
                        <p className="text-sm">₹{Math.abs(category.variance).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {remaining < 0 && (
                  <div className="p-4 border-l-4 border-destructive bg-destructive/5 rounded-r-lg">
                    <h4 className="font-semibold text-destructive">Budget Exceeded</h4>
                    <p className="text-sm text-muted-foreground">
                      Consider reallocating funds from lower priority categories or increasing your budget by ₹{Math.abs(remaining).toLocaleString()}.
                    </p>
                  </div>
                )}
                
                {budgetUtilization < 50 && (
                  <div className="p-4 border-l-4 border-success bg-success/5 rounded-r-lg">
                    <h4 className="font-semibold text-success">Great Budget Management</h4>
                    <p className="text-sm text-muted-foreground">
                      You're well within budget! Consider allocating some remaining funds to enhance your wedding experience.
                    </p>
                  </div>
                )}
                
                {categories.some(cat => {
                  const totals = getCategoryTotals(cat);
                  return totals.budgeted > 0 && (totals.actual / totals.budgeted) > 1.2;
                }) && (
                  <div className="p-4 border-l-4 border-warning bg-warning/5 rounded-r-lg">
                    <h4 className="font-semibold text-warning">Category Alert</h4>
                    <p className="text-sm text-muted-foreground">
                      Some categories are significantly over budget. Consider reviewing these expenses or adjusting category allocations.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
