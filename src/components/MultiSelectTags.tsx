
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
  X,
  Loader2
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type TagType = Tables<'tags'>;

interface MultiSelectTagsProps {
  selectedTags: TagType[];
  onTagsChange: (tags: TagType[]) => void;
  placeholder?: string;
}

// Separate component for add new tag form to avoid duplication
const AddNewTagForm = ({ 
  newTagName, 
  setNewTagName, 
  handleAddNewTag, 
  setShowAddNew,
  isLoading = false 
}: {
  newTagName: string;
  setNewTagName: (name: string) => void;
  handleAddNewTag: () => void;
  setShowAddNew: (show: boolean) => void;
  isLoading?: boolean;
}) => (
  <div className="flex gap-2 p-2">
    <Input
      placeholder="Tag name"
      value={newTagName}
      onChange={(e) => setNewTagName(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddNewTag();
        }
        if (e.key === 'Escape') {
          setShowAddNew(false);
        }
      }}
      disabled={isLoading}
      className="flex-1"
    />
    <Button 
      size="sm" 
      onClick={handleAddNewTag}
      disabled={isLoading || !newTagName.trim()}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
    </Button>
    <Button 
      size="sm" 
      variant="outline" 
      onClick={() => setShowAddNew(false)}
      disabled={isLoading}
    >
      Cancel
    </Button>
  </div>
);

export const MultiSelectTags = ({ 
  selectedTags = [], 
  onTagsChange, 
  placeholder = "Select tags..." 
}: MultiSelectTagsProps) => {
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const { toast } = useToast();

  // Ensure selectedTags is always an array
  const safeSelectedTags = Array.isArray(selectedTags) ? selectedTags : [];

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setIsLoading(true);
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
        setAvailableTags([]);
      } else {
        setAvailableTags(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      setAvailableTags([]);
      toast({
        title: "Error",
        description: "Failed to fetch tags",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagSelect = (tag: TagType) => {
    if (!tag || !tag.id) return;
    
    try {
      const isSelected = safeSelectedTags.some(t => t && t.id === tag.id);
      if (isSelected) {
        onTagsChange(safeSelectedTags.filter(t => t && t.id !== tag.id));
      } else {
        onTagsChange([...safeSelectedTags, tag]);
      }
    } catch (error) {
      console.error('Error selecting tag:', error);
    }
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim() || isAddingTag) return;

    setIsAddingTag(true);
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
        
        // Update available tags and select the new tag
        const newAvailableTags = [...availableTags, data];
        setAvailableTags(newAvailableTags);
        onTagsChange([...safeSelectedTags, data]);
        
        // Reset form
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
    } finally {
      setIsAddingTag(false);
    }
  };

  const removeTag = (tagId: string) => {
    if (!tagId) return;
    
    try {
      onTagsChange(safeSelectedTags.filter(t => t && t.id !== tagId));
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  // Safe rendering helpers
  const renderSelectedCount = () => {
    const count = safeSelectedTags.length;
    if (count === 0) return placeholder;
    return `${count} tag${count > 1 ? 's' : ''} selected`;
  };

  const renderTagItems = () => {
    if (!Array.isArray(availableTags) || availableTags.length === 0) {
      return null;
    }

    return availableTags.map((tag) => {
      if (!tag || !tag.id || !tag.name) return null;
      
      const isSelected = safeSelectedTags.some(t => t && t.id === tag.id);
      return (
        <CommandItem
          key={tag.id}
          onSelect={() => handleTagSelect(tag)}
          className="cursor-pointer"
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
    }).filter(Boolean);
  };

  return (
    <div className="w-full space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading tags...
              </>
            ) : (
              renderSelectedCount()
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-popover border" align="start" side="bottom">
          <Command className="bg-popover">
            <CommandInput placeholder="Search tags..." />
            
            <CommandEmpty>
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">No tags found.</p>
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
                  <AddNewTagForm
                    newTagName={newTagName}
                    setNewTagName={setNewTagName}
                    handleAddNewTag={handleAddNewTag}
                    setShowAddNew={setShowAddNew}
                    isLoading={isAddingTag}
                  />
                )}
              </div>
            </CommandEmpty>
            
            <CommandGroup className="max-h-64 overflow-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading tags...</p>
                </div>
              ) : (
                <>
                  {renderTagItems()}
                  {!Array.isArray(availableTags) || availableTags.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">No tags available</p>
                    </div>
                  ) : null}
                </>
              )}
            </CommandGroup>
            
            {Array.isArray(availableTags) && availableTags.length > 0 && (
              <div className="p-2 border-t bg-muted/10">
                {!showAddNew ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddNew(true)}
                    className="w-full"
                    disabled={isAddingTag}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Tag
                  </Button>
                ) : (
                  <AddNewTagForm
                    newTagName={newTagName}
                    setNewTagName={setNewTagName}
                    handleAddNewTag={handleAddNewTag}
                    setShowAddNew={setShowAddNew}
                    isLoading={isAddingTag}
                  />
                )}
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected Tags Display */}
      {Array.isArray(safeSelectedTags) && safeSelectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {safeSelectedTags.map((tag) => {
            if (!tag || !tag.id || !tag.name) return null;
            
            return (
              <Badge 
                key={tag.id} 
                variant="secondary" 
                className="flex items-center gap-1 pr-1"
              >
                <span>{tag.name}</span>
                <button
                  onClick={() => removeTag(tag.id)}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  aria-label={`Remove ${tag.name} tag`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          }).filter(Boolean)}
        </div>
      )}
    </div>
  );
};
