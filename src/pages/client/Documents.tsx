import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Building2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string | null;
  created_at: string;
  property: {
    id: string;
    title: string;
  } | null;
}

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('documents')
          .select(`
            id,
            name,
            file_path,
            file_type,
            created_at,
            property:properties(id, title)
          `)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setDocuments(data || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load your documents');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  const handleDownload = async (doc: Document) => {
    setDownloadingId(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Document downloaded successfully');
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Failed to download document');
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <PortalLayout title="Property Documents" subtitle="Access your contracts and legal documents">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Property Documents" subtitle="Access your contracts and legal documents">
      {error && (
        <div className="glass-card p-4 border border-destructive/30 mb-6 flex items-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {documents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 border border-border/20 text-center"
        >
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            No Documents Available
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You don't have any documents yet. Documents will appear here once
            your administrator uploads them for your properties.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="glass-card p-6 border border-border/20 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-foreground">{doc.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {doc.property && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          {doc.property.title}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleDownload(doc)}
                  disabled={downloadingId === doc.id}
                  className="btn-gold gap-2"
                >
                  {downloadingId === doc.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 glass-card p-4 border border-border/20 flex items-start gap-3"
      >
        <CheckCircle className="w-5 h-5 text-success mt-0.5" />
        <div>
          <p className="text-sm text-foreground font-medium">Secure Documents</p>
          <p className="text-sm text-muted-foreground">
            All documents are securely stored and only accessible by you and authorized administrators.
          </p>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default Documents;
