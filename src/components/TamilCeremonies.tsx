
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
  Calendar,
  Clock,
  MapPin,
  Church,
  FileText,
  Edit,
  Trash2
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type TamilCeremony = Tables<'tamil_ceremonies'>;

export const TamilCeremonies = () => {
  const [ceremonies, setCeremonies] = useState<TamilCeremony[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCeremony, setEditingCeremony] = useState<TamilCeremony | null>(null);
  const [formData, setFormData] = useState({
    ceremony_name: '',
    ceremony_date: '',
    ceremony_time: '',
    venue: '',
    temple_info: '',
    items_needed: '',
    family_roles: '',
    notes: ''
  });
  const { toast } = useToast();

  const ceremonyTemplates = [
    {
      name: "Nichayathartham (Engagement)",
      items: "Gold jewelry, Fruits, Sweets, Sarees, Sacred thread",
      roles: "Parents, Close relatives, Purohit"
    },
    {
      name: "Panda Kaal Muhurtham",
      items: "Banana leaves, Turmeric, Kumkum, Rice, Coconuts",
      roles: "Mama (Uncle), Aunts, Family elders"
    },
    {
      name: "Nalangu (Pre-wedding ceremony)",
      items: "Oil, Turmeric paste, New clothes, Bangles",
      roles: "Married women, Sisters, Cousins"
    },
    {
      name: "Temple Marriage (Kalyanam)",
      items: "Mangalsutra, Toe rings, Sacred fire items, Prasadam",
      roles: "Purohit, Parents, Witnesses, Relatives"
    },
    {
      name: "Reception",
      items: "Garlands, Stage decorations, Return gifts",
      roles: "Event coordinator, Family friends, Relatives"
    }
  ];

  useEffect(() => {
    fetchCeremonies();
  }, []);

  const fetchCeremonies = async () => {
    const { data, error } = await supabase
      .from('tamil_ceremonies')
      .select('*')
      .order('ceremony_date', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch ceremonies",
        variant: "destructive",
      });
    } else {
      setCeremonies(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const ceremonyData = {
      ceremony_name: formData.ceremony_name,
      ceremony_date: formData.ceremony_date || null,
      ceremony_time: formData.ceremony_time || null,
      venue: formData.venue || null,
      temple_info: formData.temple_info || null,
      items_needed: formData.items_needed || null,
      family_roles: formData.family_roles || null,
      notes: formData.notes || null,
    };

    let error;
    if (editingCeremony) {
      ({ error } = await supabase
        .from('tamil_ceremonies')
        .update(ceremonyData)
        .eq('id', editingCeremony.id));
    } else {
      ({ error } = await supabase
        .from('tamil_ceremonies')
        .insert(ceremonyData));
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingCeremony ? 'update' : 'create'} ceremony`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Ceremony ${editingCeremony ? 'updated' : 'created'} successfully`,
      });
      resetForm();
      fetchCeremonies();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('tamil_ceremonies')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete ceremony",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Ceremony deleted successfully",
      });
      fetchCeremonies();
    }
  };

  const resetForm = () => {
    setFormData({
      ceremony_name: '',
      ceremony_date: '',
      ceremony_time: '',
      venue: '',
      temple_info: '',
      items_needed: '',
      family_roles: '',
      notes: ''
    });
    setEditingCeremony(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (ceremony: TamilCeremony) => {
    setEditingCeremony(ceremony);
    setFormData({
      ceremony_name: ceremony.ceremony_name,
      ceremony_date: ceremony.ceremony_date || '',
      ceremony_time: ceremony.ceremony_time || '',
      venue: ceremony.venue || '',
      temple_info: ceremony.temple_info || '',
      items_needed: ceremony.items_needed || '',
      family_roles: ceremony.family_roles || '',
      notes: ceremony.notes || ''
    });
    setIsDialogOpen(true);
  };

  const useTemplate = (template: typeof ceremonyTemplates[0]) => {
    setFormData({
      ...formData,
      ceremony_name: template.name,
      items_needed: template.items,
      family_roles: template.roles
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return null;
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tamil Ceremonies</h1>
          <p className="text-muted-foreground">Plan and track traditional Tamil wedding ceremonies</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="celebration" onClick={() => resetForm()}>
              <Plus className="h-4 w-4" />
              Add Ceremony
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCeremony ? 'Edit Ceremony' : 'Add New Ceremony'}</DialogTitle>
            </DialogHeader>
            
            {/* Templates */}
            {!editingCeremony && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Templates:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ceremonyTemplates.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => useTemplate(template)}
                      className="text-left h-auto p-2"
                    >
                      <div>
                        <div className="font-medium text-xs">{template.name}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Ceremony Name"
                  value={formData.ceremony_name}
                  onChange={(e) => setFormData({ ...formData, ceremony_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="date"
                  placeholder="Ceremony Date"
                  value={formData.ceremony_date}
                  onChange={(e) => setFormData({ ...formData, ceremony_date: e.target.value })}
                />
                <Input
                  type="time"
                  placeholder="Ceremony Time"
                  value={formData.ceremony_time}
                  onChange={(e) => setFormData({ ...formData, ceremony_time: e.target.value })}
                />
              </div>
              <div>
                <Input
                  placeholder="Venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Temple Info (priest details, booking info, special instructions)"
                  value={formData.temple_info}
                  onChange={(e) => setFormData({ ...formData, temple_info: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Items Needed (list all required items for this ceremony)"
                  value={formData.items_needed}
                  onChange={(e) => setFormData({ ...formData, items_needed: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Family Roles (who does what, responsibilities)"
                  value={formData.family_roles}
                  onChange={(e) => setFormData({ ...formData, family_roles: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Additional Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 celebration">
                  {editingCeremony ? 'Update' : 'Add'} Ceremony
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ceremonies Timeline */}
      <div className="space-y-4">
        {ceremonies.map((ceremony, index) => (
          <Card key={ceremony.id} className="shadow-card hover:shadow-elegant transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Timeline Indicator */}
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-primary" />
                    {index < ceremonies.length - 1 && (
                      <div className="w-0.5 h-16 bg-muted mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold">{ceremony.ceremony_name}</h3>
                      <Badge className="bg-primary text-primary-foreground">Tamil Ceremony</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      {ceremony.ceremony_date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(ceremony.ceremony_date)}
                        </div>
                      )}
                      
                      {ceremony.ceremony_time && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatTime(ceremony.ceremony_time)}
                        </div>
                      )}
                      
                      {ceremony.venue && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {ceremony.venue}
                        </div>
                      )}
                      
                      {ceremony.temple_info && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Church className="h-4 w-4" />
                          Temple Info Available
                        </div>
                      )}
                    </div>
                    
                    {ceremony.temple_info && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-start gap-2">
                          <Church className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium text-sm mb-1">Temple Information</p>
                            <p className="text-sm">{ceremony.temple_info}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {ceremony.items_needed && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium text-sm mb-1">Items Needed</p>
                            <p className="text-sm">{ceremony.items_needed}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {ceremony.family_roles && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-start gap-2">
                          <div>
                            <p className="font-medium text-sm mb-1">Family Roles & Responsibilities</p>
                            <p className="text-sm">{ceremony.family_roles}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {ceremony.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium text-sm mb-1">Additional Notes</p>
                            <p className="text-sm">{ceremony.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(ceremony)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(ceremony.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ceremonies.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Church className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No ceremonies planned yet. Click "Add Ceremony" to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
