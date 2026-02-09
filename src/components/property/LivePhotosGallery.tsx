import { useState, useEffect } from 'react';
import { Camera, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface PropertyPhoto {
  id: string;
  file_path: string;
  note: string | null;
  taken_at: string;
}

interface LivePhotosGalleryProps {
  propertyId: string;
  propertyTitle: string;
}

const LivePhotosGallery = ({ propertyId, propertyTitle }: LivePhotosGalleryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchPhotos = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('property_photos')
      .select('id, file_path, note, taken_at')
      .eq('property_id', propertyId)
      .order('taken_at', { ascending: false });

    const photoList = data || [];
    setPhotos(photoList);

    // Load signed URLs
    const urls: Record<string, string> = {};
    for (const photo of photoList) {
      const { data: urlData } = await supabase.storage
        .from('property-photos')
        .createSignedUrl(photo.file_path, 3600);
      if (urlData?.signedUrl) urls[photo.id] = urlData.signedUrl;
    }
    setSignedUrls(urls);
    setIsLoading(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setActiveIndex(0);
    fetchPhotos();
  };

  const prev = () => setActiveIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  const next = () => setActiveIndex((i) => (i < photos.length - 1 ? i + 1 : 0));

  const activePhoto = photos[activeIndex];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-primary/30 hover:bg-primary/10 text-sm"
        onClick={handleOpen}
      >
        <Camera className="w-4 h-4 text-primary" />
        Live Photos
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass-card border-border/30 sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="font-display text-lg">
              {propertyTitle} — Live Photos
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No progress photos available yet.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Main Image */}
              <div className="relative bg-black/20 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                {activePhoto && signedUrls[activePhoto.id] ? (
                  <img
                    src={signedUrls[activePhoto.id]}
                    alt={activePhoto.note || 'Progress photo'}
                    className="max-h-[400px] w-full object-contain"
                  />
                ) : (
                  <div className="w-full h-[300px] bg-secondary animate-pulse" />
                )}

                {photos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full"
                      onClick={prev}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full"
                      onClick={next}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}
              </div>

              {/* Info Bar */}
              {activePhoto && (
                <div className="px-6 py-4 border-t border-border/20">
                  <div className="flex items-center justify-between">
                    <div>
                      {activePhoto.note && (
                        <p className="text-sm text-foreground font-medium">{activePhoto.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">{activePhoto.taken_at}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activeIndex + 1} / {photos.length}
                    </span>
                  </div>
                </div>
              )}

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="px-6 pb-4 flex gap-2 overflow-x-auto">
                  {photos.map((photo, idx) => (
                    <button
                      key={photo.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === activeIndex
                          ? 'border-primary ring-1 ring-primary/30'
                          : 'border-border/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {signedUrls[photo.id] ? (
                        <img
                          src={signedUrls[photo.id]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LivePhotosGallery;
