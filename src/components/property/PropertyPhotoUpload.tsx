import { useState, useEffect } from 'react';
import { Camera, Loader2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { toast } from 'sonner';

interface PropertyPhoto {
  id: string;
  file_path: string;
  note: string | null;
  taken_at: string;
  created_at: string;
}

interface PropertyPhotoUploadProps {
  propertyId: string;
}

const PropertyPhotoUpload = ({ propertyId }: PropertyPhotoUploadProps) => {
  const { user } = useApiAuth();
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [note, setNote] = useState('');
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split('T')[0]);

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('property_photos')
      .select('*')
      .eq('property_id', propertyId)
      .order('taken_at', { ascending: false });

    if (!error) setPhotos(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPhotos();
  }, [propertyId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('property-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('property_photos')
        .insert({
          property_id: propertyId,
          file_path: fileName,
          note: note || null,
          taken_at: takenAt,
          uploaded_by: user?.id || null,
        });

      if (dbError) throw dbError;

      toast.success('Photo uploaded');
      setNote('');
      fetchPhotos();
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (photo: PropertyPhoto) => {
    try {
      await supabase.storage.from('property-photos').remove([photo.file_path]);
      await supabase.from('property_photos').delete().eq('id', photo.id);
      toast.success('Photo deleted');
      fetchPhotos();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const getSignedUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('property-photos')
      .createSignedUrl(filePath, 3600);
    return data?.signedUrl || '';
  };

  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadUrls = async () => {
      const urls: Record<string, string> = {};
      for (const photo of photos) {
        urls[photo.id] = await getSignedUrl(photo.file_path);
      }
      setSignedUrls(urls);
    };
    if (photos.length > 0) loadUrls();
  }, [photos]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Camera className="w-4 h-4 text-primary" />
        Live Photos ({photos.length})
      </div>

      {/* Upload Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Date</Label>
          <Input
            type="date"
            value={takenAt}
            onChange={(e) => setTakenAt(e.target.value)}
            className="input-luxury mt-1 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Note (optional)</Label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Foundation complete"
            className="input-luxury mt-1 text-sm"
          />
        </div>
        <div className="flex items-end">
          <label className="w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-primary/30 hover:bg-primary/10"
              disabled={isUploading}
              asChild
            >
              <span>
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Photo Grid */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : photos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-3">No photos uploaded yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-border/20">
              {signedUrls[photo.id] ? (
                <img
                  src={signedUrls[photo.id]}
                  alt={photo.note || 'Progress photo'}
                  className="w-full h-24 object-cover"
                />
              ) : (
                <div className="w-full h-24 bg-secondary animate-pulse" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-destructive"
                  onClick={() => handleDelete(photo)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5">
                <span className="text-[10px] text-white/80">{photo.taken_at}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyPhotoUpload;
