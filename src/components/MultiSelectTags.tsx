import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandGroup } from "@/components/ui/command";
import { ChevronDown, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Tag = { id: string; name: string };

interface MultiSelectTagsProps {
  selectedTags: Tag[];
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
    (async () => {
      try {
        const { data, error } = await supabase.from("tags").select("*").order("name", { ascending: true });
        if (!error && Array.isArray(data)) {
          setTags(data.filter(tag => tag && tag.id && tag.name));
        } else {
          setTags([]);
          console.error("Error loading tags", error);
        }
      } catch (err) {
        console.error("Supabase fetch error:", err);
        setTags([]);
      }
    })();
  }, []);

  const toggleTag = (tag: Tag) => {
    if (!tag || !tag.id) return;

    const isSelected = selectedTags.some((t) => t.id === tag.id);
    const newTags = isSelected
      ? selectedTags.filter((t) => t.id !== tag.id)
      : [...selectedTags, tag];
    onTagsChange(newTags);
  };

  const renderTags = () => {
    if (!Array.isArray(tags) || tags.length === 0) return null;

    return (
      <CommandGroup>
        {tags.map((tag) => {
          const isSelected = selectedTags.some((t) => t.id === tag.id);
          return (
            <CommandItem key={tag.id} onSelect={() => toggleTag(tag)} className="cursor-pointer">
              <Check className={`mr-2 h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"}`} />
              {tag.name}
            </CommandItem>
          );
        })}
      </CommandGroup>
    );
  };

  return (
    <div className="w-full space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between" role="combobox">
            {selectedTags.length > 0
              ? `${selectedTags.length} selected`
              : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search tags..." />
            {renderTags()}
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="flex items-center gap-1 pr-1">
              {tag.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onTagsChange(selectedTags.filter((t) => t.id !== tag.id))
                }
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
