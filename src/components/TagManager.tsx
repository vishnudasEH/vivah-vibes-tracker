
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Edit,
  Trash2,
  Tag,
  Loader2
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type TagType = Tables<'tags'>;

interface TagManagerProps {
  onTagsChange?: () => void;
}

export const TagManager = ({ onTagsChange }: TagManagerProps) => {
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [tagName, setTagName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tags",
        variant: "destructive",
      });
    } else {
      setTags(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    setSubmitting(true);
    
    let error;
    if (editingTag) {
      ({ error } = await supabase
        .from('tags')
        .update({ name: tagName.trim() })
        .eq('id', editingTag.id));
    } else {
      ({ error } = await supabase
        .from('tags')
        .insert({ name: tagName.trim() }));
    }

    if (error) {
      toast({
        title: "Error",
        description: error.message.includes('duplicate') 
          ? "A tag with this name already exists" 
          : `Failed to ${editingTag ? 'update' : 'create'} tag`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Tag ${editingTag ? 'updated' : 'created'} successfully`,
      });
      resetForm();
      fetchTags();
      onTagsChange?.();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
      fetchTags();
      onTagsChange?.();
    }
  };

  const resetForm = () => {
    setTagName('');
    setEditingTag(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (tag: TagType) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading tags...</span>
      </div>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tag Manager
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="celebration" size="sm" onClick={() => resetForm()}>
                <Plus className="h-4 w-4" />
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTag ? 'Edit Tag' : 'Add New Tag'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Tag name"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {editingTag ? 'Update' : 'Create'} Tag
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-1">
              <Badge variant="outline" className="bg-muted">
                {tag.name}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => handleEdit(tag)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => handleDelete(tag.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        {tags.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No tags created yet. Click "Add Tag" to create your first tag.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
