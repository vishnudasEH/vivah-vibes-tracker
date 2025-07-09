
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload,
  FileText,
  Image,
  Trash2,
  Download,
  Folder,
  Camera,
  FileImage
} from "lucide-react";

interface MediaFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: any;
}

export const MediaUpload = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  const categories = [
    'contracts',
    'inspiration',
    'venue-photos',
    'vendor-docs',
    'id-proofs',
    'receipts',
    'invitations',
    'others'
  ];

  const categoryLabels = {
    contracts: 'Contracts',
    inspiration: 'Inspiration Photos',
    'venue-photos': 'Venue Photos',
    'vendor-docs': 'Vendor Documents',
    'id-proofs': 'ID Proofs',
    receipts: 'Receipts',
    invitations: 'Invitations',
    others: 'Others'
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const { data, error } = await supabase.storage
      .from('wedding-media')
      .list('', { limit: 100 });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch files",
        variant: "destructive",
      });
    } else {
      setFiles(data || []);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${category}/${Date.now()}-${file.name}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('wedding-media')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      
      fetchFiles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDelete = async (fileName: string) => {
    const { error } = await supabase.storage
      .from('wedding-media')
      .remove([fileName]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      fetchFiles();
    }
  };

  const getFileUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('wedding-media')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="h-6 w-6" />;
    }
    return <FileText className="h-6 w-6" />;
  };

  const getFileCategory = (fileName: string) => {
    const category = fileName.split('/')[0];
    return categories.includes(category) ? category : 'others';
  };

  const filteredFiles = selectedCategory === 'all' 
    ? files 
    : files.filter(file => getFileCategory(file.name) === selectedCategory);

  const getFileSizeString = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Media & Documents</h1>
          <p className="text-muted-foreground">Upload and organize your wedding documents and photos</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div key={category} className="space-y-2">
                <label className="text-sm font-medium">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, category)}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
          {uploading && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Filter Files</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <div className="grid gap-4">
        {filteredFiles.map((file) => {
          const category = getFileCategory(file.name);
          const fileName = file.name.split('/').pop() || file.name;
          const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
            fileName.split('.').pop()?.toLowerCase() || ''
          );

          return (
            <Card key={file.id} className="shadow-card hover:shadow-elegant transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {isImage ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        <img 
                          src={getFileUrl(file.name)} 
                          alt={fileName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <FileImage className="h-8 w-8 text-muted-foreground hidden" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                        {getFileIcon(file.name)}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{fileName}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-muted">
                          {categoryLabels[category as keyof typeof categoryLabels]}
                        </Badge>
                        {file.metadata?.size && (
                          <span className="text-sm text-muted-foreground">
                            {getFileSizeString(file.metadata.size)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Uploaded: {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(getFileUrl(file.name), '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(file.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFiles.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {selectedCategory === 'all' 
                ? "No files uploaded yet. Use the upload section above to get started!"
                : `No files in ${categoryLabels[selectedCategory as keyof typeof categoryLabels]} category.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
