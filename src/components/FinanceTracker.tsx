
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Wallet, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Calculator,
  Calendar,
  Plus,
  Edit,
  Save,
  X
} from "lucide-react";
import { toast } from "sonner";
import { format, addMonths, differenceInMonths } from "date-fns";

interface FinanceRecord {
  id: string;
  month_year: string;
  monthly_salary: number;
  loan_amount: number;
  loan_interest_rate: number;
  loan_tenure_months: number;
  monthly_emi: number;
  cash_hdfc: number;
  cash_boi: number;
  credit_card_spent_idfc: number;
  bonus_income: number;
  available_funds_month: number;
  cumulative_available: number;
}

export const FinanceTracker = () => {
  const queryClient = useQueryClient();
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<FinanceRecord>>({
    month_year: format(new Date(), 'yyyy-MM-01'),
    monthly_salary: 80000,
    loan_amount: 300000,
    loan_interest_rate: 10,
    loan_tenure_months: 12,
    cash_hdfc: 0,
    cash_boi: 0,
    credit_card_spent_idfc: 0,
    bonus_income: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch finance records
  const { data: financeRecords = [], isLoading } = useQuery({
    queryKey: ['finance-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_tracker')
        .select('*')
        .order('month_year', { ascending: true });
      
      if (error) throw error;
      return data as FinanceRecord[];
    }
  });

  // Fetch total budget from budget_items
  const { data: totalBudget = 0 } = useQuery({
    queryKey: ['total-budget'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_items')
        .select('budgeted_amount');
      
      if (error) throw error;
      return data.reduce((sum, item) => sum + Number(item.budgeted_amount), 0);
    }
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (record: Partial<FinanceRecord>) => {
      if (record.id) {
        const { data, error } = await supabase
          .from('finance_tracker')
          .update(record)
          .eq('id', record.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('finance_tracker')
          .insert([record])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-records'] });
      setEditingRecord(null);
      setShowAddForm(false);
      setNewRecord({
        month_year: format(addMonths(new Date(), 1), 'yyyy-MM-01'),
        monthly_salary: 80000,
        loan_amount: 300000,
        loan_interest_rate: 10,
        loan_tenure_months: 12,
        cash_hdfc: 0,
        cash_boi: 0,
        credit_card_spent_idfc: 0,
        bonus_income: 0
      });
      toast.success("Finance record updated successfully!");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Calculate totals and insights
  const latestRecord = financeRecords[financeRecords.length - 1];
  const currentAvailable = latestRecord?.cumulative_available || 0;
  const remainingNeeded = Math.max(0, totalBudget - currentAvailable);
  const progressPercentage = totalBudget > 0 ? (currentAvailable / totalBudget) * 100 : 0;
  
  // Calculate months until wedding (January 2026)
  const weddingDate = new Date(2026, 0, 31); // January 31, 2026
  const monthsRemaining = differenceInMonths(weddingDate, new Date());
  const monthlyTargetSaving = monthsRemaining > 0 ? remainingNeeded / monthsRemaining : 0;

  // Determine status
  const getFinancialStatus = () => {
    if (progressPercentage >= 90) return { status: 'On Track', color: 'bg-green-500', textColor: 'text-green-700' };
    if (progressPercentage >= 60) return { status: 'Good Progress', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { status: 'Needs Attention', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const financialStatus = getFinancialStatus();

  // Prepare chart data
  const chartData = financeRecords.map(record => ({
    month: format(new Date(record.month_year), 'MMM yyyy'),
    cumulative: record.cumulative_available,
    monthly: record.available_funds_month,
    target: totalBudget
  }));

  const handleSave = (record: Partial<FinanceRecord>) => {
    mutation.mutate(record);
  };

  const EditableCell = ({ 
    record, 
    field, 
    type = "number" 
  }: { 
    record: FinanceRecord; 
    field: keyof FinanceRecord; 
    type?: string;
  }) => {
    const [value, setValue] = useState(record[field]);
    const isEditing = editingRecord === record.id;

    if (!isEditing) {
      return (
        <span>
          {type === "currency" ? `₹${Number(record[field]).toLocaleString()}` : String(record[field])}
        </span>
      );
    }

    return (
      <Input
        type={type === "currency" ? "number" : type}
        value={value}
        onChange={(e) => setValue(type === "number" || type === "currency" ? Number(e.target.value) : e.target.value)}
        onBlur={() => {
          if (value !== record[field]) {
            handleSave({ ...record, [field]: value });
          }
        }}
        className="w-full"
      />
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading finance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Finance Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Track your wedding budget progress and monthly finances
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="h-4 w-4 mr-2" />
          Add Month
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wedding Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funds Arranged</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{currentAvailable.toLocaleString()}</div>
            <Badge className={financialStatus.textColor}>
              {financialStatus.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Still Needed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{remainingNeeded.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {monthsRemaining} months remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(monthlyTargetSaving).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              To meet wedding goal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Wedding Budget Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress to Goal</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            
            {/* Intelligent Insights */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                {remainingNeeded > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                Financial Insights
              </h4>
              {remainingNeeded > 0 ? (
                <div className="space-y-2 text-sm">
                  <p>🔴 <strong>You still need ₹{remainingNeeded.toLocaleString()} to cover your budget</strong></p>
                  <p>💡 You need to save <strong>₹{Math.round(monthlyTargetSaving).toLocaleString()}/month</strong> for the next {monthsRemaining} months to meet your goal.</p>
                  {monthlyTargetSaving > 50000 && (
                    <p className="text-amber-700">⚠️ This requires significant monthly savings. Consider reviewing your budget or extending your timeline.</p>
                  )}
                </div>
              ) : (
                <p className="text-green-700">🎉 Congratulations! You've already arranged enough funds for your wedding budget!</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Savings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              cumulative: { label: "Cumulative", color: "hsl(var(--primary))" },
              target: { label: "Target", color: "hsl(var(--destructive))" }
            }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="hsl(var(--destructive))" 
                    strokeDasharray="5,5" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              arranged: { label: "Arranged", color: "hsl(var(--primary))" },
              remaining: { label: "Remaining", color: "hsl(var(--muted))" }
            }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Arranged', value: currentAvailable, fill: 'hsl(var(--primary))' },
                      { name: 'Remaining', value: remainingNeeded, fill: 'hsl(var(--muted))' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { fill: 'hsl(var(--primary))' },
                      { fill: 'hsl(var(--muted))' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Financial Records
          </CardTitle>
          <CardDescription>
            Click on any cell to edit values. EMI and calculations will update automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add New Record Form */}
          {showAddForm && (
            <Card className="mb-6 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Add New Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Month</Label>
                    <Input
                      type="month"
                      value={newRecord.month_year?.substring(0, 7)}
                      onChange={(e) => setNewRecord({...newRecord, month_year: e.target.value + '-01'})}
                    />
                  </div>
                  <div>
                    <Label>Monthly Salary</Label>
                    <Input
                      type="number"
                      value={newRecord.monthly_salary}
                      onChange={(e) => setNewRecord({...newRecord, monthly_salary: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Loan Amount</Label>
                    <Input
                      type="number"
                      value={newRecord.loan_amount}
                      onChange={(e) => setNewRecord({...newRecord, loan_amount: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Interest Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newRecord.loan_interest_rate}
                      onChange={(e) => setNewRecord({...newRecord, loan_interest_rate: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Cash HDFC</Label>
                    <Input
                      type="number"
                      value={newRecord.cash_hdfc}
                      onChange={(e) => setNewRecord({...newRecord, cash_hdfc: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Cash BOI</Label>
                    <Input
                      type="number"
                      value={newRecord.cash_boi}
                      onChange={(e) => setNewRecord({...newRecord, cash_boi: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Credit Card Spent</Label>
                    <Input
                      type="number"
                      value={newRecord.credit_card_spent_idfc}
                      onChange={(e) => setNewRecord({...newRecord, credit_card_spent_idfc: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Bonus Income</Label>
                    <Input
                      type="number"
                      value={newRecord.bonus_income}
                      onChange={(e) => setNewRecord({...newRecord, bonus_income: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleSave(newRecord)} disabled={mutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>EMI</TableHead>
                  <TableHead>Cash HDFC</TableHead>
                  <TableHead>Cash BOI</TableHead>
                  <TableHead>Credit Spent</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Monthly Available</TableHead>
                  <TableHead>Cumulative</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financeRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {format(new Date(record.month_year), 'MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      <EditableCell record={record} field="monthly_salary" type="currency" />
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        ₹{Number(record.monthly_emi).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <EditableCell record={record} field="cash_hdfc" type="currency" />
                    </TableCell>
                    <TableCell>
                      <EditableCell record={record} field="cash_boi" type="currency" />
                    </TableCell>
                    <TableCell>
                      <EditableCell record={record} field="credit_card_spent_idfc" type="currency" />
                    </TableCell>
                    <TableCell>
                      <EditableCell record={record} field="bonus_income" type="currency" />
                    </TableCell>
                    <TableCell>
                      <span className={record.available_funds_month >= 0 ? "text-green-600" : "text-red-600"}>
                        ₹{Number(record.available_funds_month).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ₹{Number(record.cumulative_available).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRecord(editingRecord === record.id ? null : record.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
