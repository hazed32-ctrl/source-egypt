import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Calendar,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  Building,
  Compass,
  Paintbrush,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample property data
const propertyData = {
  id: '1',
  title: 'Palm Hills Residence',
  location: 'New Cairo, Egypt',
  address: 'Palm Hills Compound, New Cairo, Cairo Governorate, Egypt',
  price: 5500000,
  salePrice: 4950000,
  beds: 4,
  baths: 3,
  area: 280,
  status: 'available' as const,
  tag: 'hot' as const,
  constructionProgress: 85,
  deliveryDate: '2025 Q2',
  finishing: 'Semi-Finished',
  view: 'Garden View',
  propertyType: 'Villa',
  images: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
  ],
  description: `This stunning villa in Palm Hills represents the pinnacle of luxury living in New Cairo. 
  
  Featuring 4 spacious bedrooms, 3 modern bathrooms, and a generous 280 sqm of living space, this property offers the perfect blend of comfort and elegance.
  
  The villa boasts high-quality finishes throughout, with large windows that flood the interior with natural light and offer beautiful garden views. The open-plan living area flows seamlessly into the modern kitchen, perfect for entertaining guests.
  
  Located in one of Cairo's most prestigious compounds, residents enjoy access to world-class amenities including swimming pools, fitness centers, landscaped gardens, and 24/7 security.`,
  features: [
    'Private Garden',
    'Smart Home System',
    'Central A/C',
    'Built-in Kitchen',
    'Security System',
    'Covered Parking',
    'Marble Flooring',
    'Double Glazed Windows',
  ],
  paymentPlan: {
    downPayment: 10,
    installmentYears: 8,
    monthlyAmount: 51562,
  },
  project: {
    name: 'Palm Hills New Cairo',
    developer: 'Palm Hills Developments',
    totalUnits: 1200,
    deliveryYear: 2025,
  },
};

const PropertyDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const property = propertyData;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-primary">{t('nav.properties')}</Link>
          <span>/</span>
          <span className="text-foreground">{property.title}</span>
        </nav>
      </div>

      {/* Gallery */}
      <section className="container mx-auto px-6 pb-8">
        <div className="relative rounded-2xl overflow-hidden">
          <motion.img
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={property.images[currentImage]}
            alt={property.title}
            className="w-full h-[60vh] object-cover"
          />

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/80 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/80 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {property.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentImage === index ? 'bg-primary w-8' : 'bg-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="badge-available text-sm px-4 py-1">
              {t(`property.status.${property.status}`)}
            </Badge>
          </div>

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                isFavorite ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-foreground hover:bg-background/80'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/80 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{property.address}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 text-center">
                <Bed className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">{property.beds}</p>
                <p className="text-sm text-muted-foreground">{t('property.beds')}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <Bath className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">{property.baths}</p>
                <p className="text-sm text-muted-foreground">{t('property.baths')}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <Maximize className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">{property.area}</p>
                <p className="text-sm text-muted-foreground">{t('property.sqm')}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">{property.deliveryDate}</p>
                <p className="text-sm text-muted-foreground">{t('property.delivery')}</p>
              </div>
            </div>

            {/* Construction Progress */}
            {property.constructionProgress && (
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {t('property.construction')} Progress
                  </h3>
                  <span className="text-primary font-semibold">{property.constructionProgress}%</span>
                </div>
                <div className="progress-gold h-3">
                  <div
                    className="progress-gold-fill"
                    style={{ width: `${property.constructionProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="description" className="glass-card p-6">
              <TabsList className="grid grid-cols-3 w-full bg-secondary/50 mb-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium text-foreground">{property.propertyType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Paintbrush className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('property.finishing')}</p>
                      <p className="font-medium text-foreground">{property.finishing}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Compass className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('property.view')}</p>
                      <p className="font-medium text-foreground">{property.view}</p>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {property.description}
                </p>
              </TabsContent>

              <TabsContent value="features">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="location">
                <div className="aspect-video rounded-xl bg-secondary/30 flex items-center justify-center">
                  <p className="text-muted-foreground">Interactive Map Coming Soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="glass-card p-6 sticky top-28">
              <div className="mb-6">
                {property.salePrice ? (
                  <>
                    <p className="text-muted-foreground line-through text-lg">
                      {formatPrice(property.price)} {t('common.currency')}
                    </p>
                    <p className="text-gold font-display text-3xl font-semibold">
                      {formatPrice(property.salePrice)} {t('common.currency')}
                    </p>
                  </>
                ) : (
                  <p className="text-gold font-display text-3xl font-semibold">
                    {formatPrice(property.price)} {t('common.currency')}
                  </p>
                )}
              </div>

              {/* Payment Plan */}
              <div className="bg-secondary/30 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-foreground mb-3">{t('property.paymentPlan')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Down Payment</span>
                    <span className="text-foreground">{property.paymentPlan.downPayment}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Installment Period</span>
                    <span className="text-foreground">{property.paymentPlan.installmentYears} Years</span>
                  </div>
                  <div className="flex justify-between border-t border-border/30 pt-2 mt-2">
                    <span className="text-muted-foreground">Monthly</span>
                    <span className="text-primary font-medium">
                      {formatPrice(property.paymentPlan.monthlyAmount)} {t('common.currency')}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <Button className="w-full btn-gold h-12 text-base gap-2">
                  <MessageCircle className="w-5 h-5" />
                  {t('property.whatsapp')}
                </Button>
                <Button variant="outline" className="w-full h-12 text-base gap-2 border-border/50 hover:border-primary/50">
                  <Phone className="w-5 h-5" />
                  {t('property.call')}
                </Button>
                <Button variant="outline" className="w-full h-12 text-base gap-2 border-border/50 hover:border-primary/50">
                  <Download className="w-5 h-5" />
                  {t('property.brochure')}
                </Button>
              </div>

              {/* Project Info */}
              <div className="mt-6 pt-6 border-t border-border/30">
                <h4 className="font-medium text-foreground mb-3">Project Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project</span>
                    <span className="text-foreground">{property.project.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Developer</span>
                    <span className="text-foreground">{property.project.developer}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PropertyDetails;
