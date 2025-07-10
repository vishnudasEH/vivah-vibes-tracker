import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { ChevronDown, Check, X } from "lucide-react";

type Tag = { id: string; name: string };

interface Props {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export const MultiSelectTags = ({ selectedTags = [], onTagsChange }: Props) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("tags")
      .select("*")
      .then(({ data }) => setTags(data ?? []))
      .catch(console.error);
  }, []);

  const toggleTag = (tag: Tag) => {
    const exists = selectedTags.some((t) => t.id === tag.id);
    const updated = exists
      ? selectedTags.filter((t) => t.id !== tag.id)
      : [...selectedTags, tag];
    onTagsChange(updated);
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selectedTags.length
              ? `${selectedTags.length} selected`
              : "Select tags"}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full">
          <Command>
            <CommandGroup>
              {tags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  onSelect={() => toggleTag(tag)}
                  className="cursor-pointer"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedTags.some((t) => t.id === tag.id)
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                  {tag.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex gap-1 mt-2 flex-wrap">
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="flex items-center">
            {tag.name}
            <X
              className="h-3 w-3 ml-1 cursor-pointer"
              onClick={() =>
                onTagsChange(selectedTags.filter((t) => t.id !== tag.id))
              }
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};
