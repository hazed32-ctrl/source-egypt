import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Users, Award, TrendingUp, Send, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import FirstVisitLeadPopup from '@/components/landing/FirstVisitLeadPopup';
import PropertyCard from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import sourceLogo from '@/assets/logo-b-secondary.svg';
import { useCountUp } from '@/hooks/useCountUp';
import { HeroContent, defaultHeroContent } from '@/components/cms/HeroContentType';

const CountUpStat = ({ value, suffix }: { value: number; suffix: string }) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const count = useCountUp(value, 1800, 0, inView);

  return (
    <span
      ref={(el) => {
        if (el && !ref.current) {
          ref.current = el;
          const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
            { threshold: 0.3 }
          );
          observer.observe(el);
        }
      }}
    >
      {count.toLocaleString()}{suffix}
    </span>
  );
};

interface FeaturedProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  image: string;
  status: 'available' | 'reserved' | 'sold';
}

const statIcons = [Building2, Users, Award, TrendingUp];

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().optional(),
  message: z.string().trim().min(1, 'Message is required').max(1000),
});

const Index = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hero, setHero] = useState<HeroContent>(defaultHeroContent);
  const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([]);
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    // Fetch CMS hero
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'cms_home_hero')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          try {
            setHero({ ...defaultHeroContent, ...JSON.parse(data.value) });
          } catch { /* keep defaults */ }
        }
      });

    // Fetch featured properties from Supabase
    supabase
      .from('properties')
      .select('id, title, location, price, beds, baths, area, image_url, status')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to fetch featured properties:', error);
          return;
        }
        const mapStatus = (s: string): 'available' | 'reserved' | 'sold' => {
          if (s === 'reserved' || s === 'pending') return 'reserved';
          if (s === 'sold' || s === 'archived') return 'sold';
          return 'available';
        };
        setFeaturedProperties(
          (data || []).map((p) => ({
            id: p.id,
            title: p.title,
            location: p.location || '',
            price: p.price || 0,
            beds: p.beds || 0,
            baths: p.baths || 0,
            area: p.area || 0,
            image: p.image_url || '/placeholder.svg',
            status: mapStatus(p.status),
          }))
        );
      });
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = leadSchema.safeParse(leadForm);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('leads').insert({
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone || null,
        message: leadForm.message,
      });

      if (error) throw error;

      toast.success('Thank you! We will contact you soon.');
      setLeadForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Error submitting lead:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <FirstVisitLeadPopup />
      {/* Hero Section */}
      <section className={`relative flex items-center justify-center overflow-hidden ${hero.heroSize === 'small' ? 'min-h-[60vh]' : 'min-h-[75vh]'}`}>
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-hero" />
        
        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.img
            src={sourceLogo}
            alt=""
            className="w-[600px] h-[600px] opacity-[0.02] blur-[1px]"
            animate={{ 
              scale: [1, 1.03, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-5xl md:text-7xl font-semibold text-foreground mb-6 leading-tight">
                {hero.headline} <span className="text-gold-gradient">{hero.highlightWord}</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                {hero.subtitle}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to={hero.primaryCta.link}>
                <Button className="btn-gold text-lg px-8 py-6">
                  {hero.primaryCta.label}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={hero.secondaryCta.link}>
                <Button variant="outline" className="text-lg px-8 py-6 border-border/50 hover:border-primary/50 hover:bg-primary/5">
                  {hero.secondaryCta.label}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-border/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {hero.stats.map((stat, index) => {
              const Icon = statIcons[index] || Building2;
              return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-3xl font-display font-semibold text-foreground mb-1 tabular-nums">
                  <CountUpStat value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              {t('property.featured')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('property.featuredSubtitle')}
            </p>
          </motion.div>

          {featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No properties available yet.
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/properties">
              <Button variant="outline" size="lg" className="border-border/50 hover:border-primary/50 gap-2">
                View All Properties
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-24 border-t border-border/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-8">
                Who We Are &amp; Why{' '}
                <span className="text-gold-gradient">Make It Yours</span>?
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                Source is your dedicated partner in luxury real estate — designed to keep you
                informed, empowered, and in control. From real-time asset tracking and
                construction progress photos to centralized document management and curated
                market insights, every detail of your portfolio lives in one elegant platform.
                We deliver tailored investment opportunities, personalised recommendations, and
                seamless support for buying and selling — all through direct, white-glove
                communication with your dedicated team.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Lead Form Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-card" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-gold blur-3xl" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
                  Ready to Find Your{' '}
                  <span className="text-gold-gradient">Dream Home?</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Our team of experts is ready to help you discover the perfect property 
                  that matches your lifestyle and investment goals. Fill out the form 
                  and we'll get back to you within 24 hours.
                </p>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Personalized property recommendations
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Expert market analysis
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Flexible payment plans
                  </li>
                </ul>
              </motion.div>

              {/* Lead Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="glass-card p-8 border border-border/30">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                    Get in Touch
                  </h3>
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="lead-name">Full Name *</Label>
                      <Input
                        id="lead-name"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        placeholder="Your full name"
                        className="input-luxury mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lead-email">Email Address *</Label>
                      <Input
                        id="lead-email"
                        type="email"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        placeholder="your@email.com"
                        className="input-luxury mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lead-phone">Phone Number</Label>
                      <Input
                        id="lead-phone"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        placeholder="+20 xxx xxx xxxx"
                        className="input-luxury mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lead-message">Message *</Label>
                      <Textarea
                        id="lead-message"
                        value={leadForm.message}
                        onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                        placeholder="Tell us about your property requirements..."
                        className="input-luxury mt-1 min-h-24"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-gold h-12 gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
