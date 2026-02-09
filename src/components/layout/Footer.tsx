import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import sourceLogo from '@/assets/logo-b-secondary.svg';

const PHONE_NUMBER = '+201036786432';
const DISPLAY_PHONE = '+20 103 678 6432';
const CONTACT_EMAIL = 'contact@source-eg.com';
const ADDRESS = 'Al Thawra Street 107, Cairo, Cairo, Egypt.';
const WHATSAPP_URL = `https://wa.me/${PHONE_NUMBER}`;

const emailSchema = z.string().trim().email('Please enter a valid email').max(255);

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers' as any)
        .insert({ email: parsed.data } as any);
      if (error) {
        if (error.code === '23505') {
          toast.info('You are already subscribed!');
        } else {
          throw error;
        }
      } else {
        toast.success('Successfully subscribed to our newsletter!');
        setEmail('');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/', label: t('nav.home', 'Home') },
    { href: '/properties', label: t('footer.properties', 'Properties') },
    { href: '/find-property', label: t('nav.search', 'Find Your Property') },
    { href: '/contact', label: t('footer.contact', 'Contact') },
    { href: '/about', label: t('footer.about', 'About') },
    { href: '/auth', label: t('nav.login', 'Login') },
  ];

  const legalLinks: { href: string; label: string }[] = [];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="relative bg-background-secondary border-t border-border/30">
      {/* Watermark */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-1/2 -right-1/4 w-full h-full opacity-[0.02]">
          <div className="w-full h-full bg-gradient-gold rounded-full blur-3xl" />
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img src={sourceLogo} alt="Source" className="h-16 w-auto" />
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              Discover exceptional properties in the most prestigious locations. 
              Your journey to luxury living begins here.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">
              Quick Links
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">
              {t('footer.contact', 'Contact')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                <span>{ADDRESS}</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href={`tel:${PHONE_NUMBER}`} className="hover:text-primary transition-colors">{DISPLAY_PHONE}</a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-primary transition-colors">{CONTACT_EMAIL}</a>
              </li>
              <li className="pt-2">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(142,70%,35%)] hover:bg-[hsl(142,70%,30%)] text-white text-sm font-medium transition-colors duration-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  Call on WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">
              {t('footer.newsletter', 'Newsletter')}
            </h4>
            <p className="text-muted-foreground mb-4">
              Stay updated with our latest properties and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.newsletterPlaceholder', 'Your email')}
                className="input-luxury flex-1"
                disabled={isSubmitting}
                required
              />
              <Button type="submit" className="btn-gold px-4" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Source Egypt. {t('footer.rights', 'All rights reserved')}.
          </p>
          {legalLinks.length > 0 && (
            <div className="flex gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-muted-foreground text-sm hover:text-primary transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
