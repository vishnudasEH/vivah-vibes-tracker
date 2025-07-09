import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  category: string;
  assignedTo: string;
  status: 'not-started' | 'in-progress' | 'completed';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

export const TaskTracker = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Book wedding venue',
      category: 'venue',
      assignedTo: 'Self',
      status: 'completed',
      dueDate: '2024-01-15',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Finalize catering menu',
      category: 'catering',
      assignedTo: 'Parents',
      status: 'in-progress',
      dueDate: '2024-02-01',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Order wedding invitations',
      category: 'decoration',
      assignedTo: 'Self',
      status: 'completed',
      dueDate: '2024-01-20',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Book photographer',
      category: 'photography',
      assignedTo: 'Partner',
      status: 'in-progress',
      dueDate: '2024-02-05',
      priority: 'high'
    },
    {
      id: '5',
      title: 'Shop for bridal outfit',
      category: 'clothing',
      assignedTo: 'Self',
      status: 'not-started',
      dueDate: '2024-02-15',
      priority: 'high'
    },
    {
      id: '6',
      title: 'Plan mehendi ceremony',
      category: 'rituals',
      assignedTo: 'Family',
      status: 'not-started',
      dueDate: '2024-03-01',
      priority: 'medium'
    }
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const categories = ['venue', 'catering', 'decoration', 'photography', 'clothing', 'rituals', 'music', 'transport'];
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-secondary" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-secondary text-secondary-foreground">In Progress</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-primary text-primary-foreground">High</Badge>;
      case 'medium':
        return <Badge className="bg-accent text-accent-foreground">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const categoryMatch = filterCategory === 'all' || task.category === filterCategory;
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const statusOrder = ['not-started', 'in-progress', 'completed'];
        const currentIndex = statusOrder.indexOf(task.status);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        return { ...task, status: statusOrder[nextIndex] as Task['status'] };
      }
      return task;
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Tracker</h1>
          <p className="text-muted-foreground">Manage and track all your wedding tasks</p>
        </div>
        <Button className="celebration">
          <Plus className="h-4 w-4" />
          Add New Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <Card 
            key={task.id} 
            className="shadow-card hover:shadow-elegant transition-all cursor-pointer"
            onClick={() => toggleTaskStatus(task.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(task.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                      <Badge variant="outline" className="bg-muted">
                        {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {task.assignedTo}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No tasks found matching your filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};