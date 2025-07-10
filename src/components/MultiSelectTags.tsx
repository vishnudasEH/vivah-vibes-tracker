import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandGroup } from "@/components/ui/command";
import { ChevronDown, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Tag = { id: string; name: string };

interface MultiSelectTagsProps {
  selectedTags?: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
}

export const MultiSelectTags = ({
  selectedTags = [],
  onTagsChange,
  placeholder = "Select tags...",
}: MultiSelectTagsProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await supabase.from("tags").select("*").order("name", { ascending: true });
        if (error || !Array.isArray(data)) {
          console.error("Error fetching tags:", error);
          setTags([]);
        } else {
          const safeTags = data.filter(tag => tag && tag.id && tag.name);
          setTags(safeTags);
        }
      } catch (err) {
        console.error("Unexpected error fetching tags", err);
        setTags([]);
      }
    };
    fetchTags();
  }, []);

  const handleToggleTag = (tag: Tag) => {
    if (!tag || !tag.id) return;

    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="w-full space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selectedTags.length > 0 ? `${selectedTags.length} selected` : placeholder}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search tags..." />
            {tags.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No tags found.</p>
            ) : (
              <CommandGroup heading="Tags">
                {tags.map((tag) => {
                  const isSelected = selectedTags.some(t => t.id === tag.id);
                  return (
                    <CommandItem key={tag.id} onSelect={() => handleToggleTag(tag)}>
                      <Check className={`mr-2 h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"}`} />
                      {tag.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map(tag => (
            <Badge key={tag.id} variant="secondary" className="flex items-center gap-1 pr-1">
              <span>{tag.name}</span>
              <button onClick={() => onTagsChange(selectedTags.filter(t => t.id !== tag.id))}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
