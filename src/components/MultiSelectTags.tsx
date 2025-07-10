
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Check,
  ChevronDown,
  Plus,
  X
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type TagType = Tables<'tags'>;

interface MultiSelectTagsProps {
  selectedTags: TagType[];
  onTagsChange: (tags: TagType[]) => void;
  placeholder?: string;
}

export const MultiSelectTags = ({ 
  selectedTags = [], 
  onTagsChange, 
  placeholder = "Select tags..." 
}: MultiSelectTagsProps) => {
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching tags:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tags",
          variant: "destructive",
        });
      } else {
        setAvailableTags(data || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      setAvailableTags([]);
    }
  };

  const handleTagSelect = (tag: TagType) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({ name: newTagName.trim() })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: error.message.includes('duplicate') 
            ? "A tag with this name already exists" 
            : "Failed to create tag",
          variant: "destructive",
        });
      } else if (data) {
        toast({
          title: "Success",
          description: "Tag created successfully",
        });
        setAvailableTags([...availableTags, data]);
        onTagsChange([...selectedTags, data]);
        setNewTagName('');
        setShowAddNew(false);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
    }
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId));
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedTags.length > 0
              ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
              : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandEmpty>
              <div className="p-2">
                <p className="text-sm text-muted-foreground mb-2">No tags found.</p>
                {!showAddNew ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddNew(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Tag
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNewTag()}
                    />
                    <Button size="sm" onClick={handleAddNewTag}>
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {Array.isArray(availableTags) && availableTags.map((tag) => {
                const isSelected = selectedTags.some(t => t.id === tag.id);
                return (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => handleTagSelect(tag)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {tag.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {availableTags.length > 0 && (
              <div className="p-2 border-t">
                {!showAddNew ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddNew(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Tag
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNewTag()}
                    />
                    <Button size="sm" onClick={handleAddNewTag}>
                      Add
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
              {tag.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeTag(tag.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
