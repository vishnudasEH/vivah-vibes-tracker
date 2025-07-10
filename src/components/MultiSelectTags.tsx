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
  Loader2,
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type TagType = Tables<"tags">;

interface MultiSelectTagsProps {
  selectedTags: TagType[];
  onTagsChange: (tags: TagType[]) => void;
  placeholder?: string;
}

const AddNewTagForm = ({
  newTagName,
  setNewTagName,
  handleAddNewTag,
  setShowAddNew,
  isLoading = false,
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
        if (e.key === "Enter") {
          e.preventDefault();
          handleAddNewTag();
        }
        if (e.key === "Escape") {
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
  placeholder = "Select tags...",
}: MultiSelectTagsProps) => {
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const { toast } = useToast();

  const safeSelectedTags = Array.isArray(selectedTags) ? selectedTags : [];

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching tags:", error);
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
      console.error("Error fetching tags:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tags",
        variant: "destructive",
      });
      setAvailableTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagSelect = (tag: TagType) => {
    if (!tag?.id) return;

    const isSelected = safeSelectedTags.some((t) => t?.id === tag.id);
    const newSelection = isSelected
      ? safeSelectedTags.filter((t) => t?.id !== tag.id)
      : [...safeSelectedTags, tag];

    onTagsChange?.(newSelection);
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim() || isAddingTag) return;

    setIsAddingTag(true);
    try {
      const { data, error } = await supabase
        .from("tags")
        .insert({ name: newTagName.trim() })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: error.message.includes("duplicate")
            ? "A tag with this name already exists"
            : "Failed to create tag",
          variant: "destructive",
        });
      } else if (data) {
        toast({ title: "Success", description: "Tag created successfully" });
        const updatedTags = [...availableTags, data];
        setAvailableTags(updatedTags);
        onTagsChange?.([...safeSelectedTags, data]);
        setNewTagName("");
        setShowAddNew(false);
      }
    } catch (error) {
      console.error("Error creating tag:", error);
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
    onTagsChange?.(safeSelectedTags.filter((t) => t?.id !== tagId));
  };

  const renderTagItems = () => {
    try {
      return availableTags
        .filter((tag) => tag && typeof tag.id === "string" && typeof tag.name === "string")
        .map((tag) => {
          const isSelected = safeSelectedTags.some((t) => t?.id === tag.id);
          return (
            <CommandItem key={tag.id} onSelect={() => handleTagSelect(tag)}>
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              />
              {tag.name}
            </CommandItem>
          );
        });
    } catch (e) {
      console.error("Render error in tag list:", e);
      return (
        <div className="p-2 text-sm text-red-500">Error rendering tags</div>
      );
    }
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
            ) : safeSelectedTags.length > 0 ? (
              `${safeSelectedTags.length} tag${safeSelectedTags.length > 1 ? "s" : ""} selected`
            ) : (
              placeholder
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
                renderTagItems()
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

      {safeSelectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {safeSelectedTags
            .filter((tag) => tag && typeof tag.id === "string" && typeof tag.name === "string")
            .map((tag) => (
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
            ))}
        </div>
      )}
    </div>
  );
};
