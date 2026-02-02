import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface AgentInfo {
  name: string;
  phone: string;
  whatsapp?: string;
  avatar?: string;
}

interface ContactAgentButtonProps {
  agent?: AgentInfo;
  className?: string;
  variant?: 'button' | 'circle';
}

export const ContactAgentButton = ({ 
  agent,
  className,
  variant = 'button'
}: ContactAgentButtonProps) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Default agent info if not provided
  const agentInfo: AgentInfo = agent || {
    name: language === 'ar' ? 'مستشار العقارات' : 'Property Consultant',
    phone: '+201000000000',
    whatsapp: '+201000000000',
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      language === 'ar' 
        ? 'مرحباً، أريد الاستفسار عن عقاراتي' 
        : 'Hello, I would like to inquire about my properties'
    );
    const whatsappNumber = agentInfo.whatsapp?.replace(/[^0-9]/g, '') || agentInfo.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    setIsOpen(false);
  };

  const handleCall = () => {
    window.open(`tel:${agentInfo.phone}`, '_self');
    setIsOpen(false);
  };

  if (variant === 'circle') {
    return (
      <>
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex flex-col items-center gap-4",
            className
          )}
        >
          <div className={cn(
            "relative w-28 h-28 md:w-32 md:h-32 rounded-full",
            "flex items-center justify-center",
            "bg-gradient-to-br from-secondary/60 to-secondary/30",
            "backdrop-blur-md border border-border/30",
            "shadow-lg shadow-black/20",
            "transition-all duration-300",
            "hover:scale-110 hover:border-primary/50 hover:shadow-gold"
          )}>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            <Phone className="relative z-10 w-10 h-10 md:w-12 md:h-12 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-sm md:text-base font-medium text-foreground">
            {language === 'ar' ? 'تواصل مع وكيلك' : 'Contact Agent'}
          </span>
        </motion.button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="glass-card border-border/30 max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-center">
                {language === 'ar' ? 'تواصل مع وكيلك' : 'Contact Your Agent'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              {/* Agent Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  {agentInfo.avatar ? (
                    <img src={agentInfo.avatar} alt={agentInfo.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{agentInfo.name}</p>
                  <p className="text-sm text-muted-foreground">{agentInfo.phone}</p>
                </div>
              </div>

              {/* Contact Options */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleWhatsApp}
                  className="h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </Button>
                <Button
                  onClick={handleCall}
                  variant="outline"
                  className="h-14 border-border/50 hover:border-primary/50 gap-2"
                >
                  <Phone className="w-5 h-5" />
                  {language === 'ar' ? 'اتصل' : 'Call'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn("btn-gold gap-2", className)}
      >
        <Phone className="w-4 h-4" />
        {language === 'ar' ? 'تواصل مع وكيلك' : 'Contact My Agent'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass-card border-border/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-center">
              {language === 'ar' ? 'تواصل مع وكيلك' : 'Contact Your Agent'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Agent Info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                {agentInfo.avatar ? (
                  <img src={agentInfo.avatar} alt={agentInfo.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{agentInfo.name}</p>
                <p className="text-sm text-muted-foreground">{agentInfo.phone}</p>
              </div>
            </div>

            {/* Contact Options */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleWhatsApp}
                className="h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </Button>
              <Button
                onClick={handleCall}
                variant="outline"
                className="h-14 border-border/50 hover:border-primary/50 gap-2"
              >
                <Phone className="w-5 h-5" />
                {language === 'ar' ? 'اتصل' : 'Call'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContactAgentButton;
