/**
 * GDPR-Compliant Consent Banner
 * Uses react-cookie-consent with custom styling
 */

import CookieConsent from 'react-cookie-consent';
import { useLanguage } from '@/contexts/LanguageContext';

const ConsentBanner = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const translations = {
    en: {
      message: 'We use cookies to enhance your experience and analyze site traffic. By clicking "Accept", you consent to our use of cookies.',
      accept: 'Accept All',
      decline: 'Decline',
      learnMore: 'Learn More',
    },
    ar: {
      message: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل حركة المرور. بالنقر على "قبول"، فإنك توافق على استخدامنا لملفات تعريف الارتباط.',
      accept: 'قبول الكل',
      decline: 'رفض',
      learnMore: 'اعرف المزيد',
    },
  };

  const t = translations[language] || translations.en;

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: Date.now(),
    }));
    
    // Trigger analytics initialization
    window.dispatchEvent(new CustomEvent('consent_granted'));
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      analytics: false,
      marketing: false,
      functional: true,
      timestamp: Date.now(),
    }));
  };

  return (
    <CookieConsent
      location="bottom"
      buttonText={t.accept}
      declineButtonText={t.decline}
      enableDeclineButton
      onAccept={handleAccept}
      onDecline={handleDecline}
      cookieName="cookie_consent"
      style={{
        background: 'hsl(var(--card))',
        borderTop: '1px solid hsl(var(--border))',
        padding: '1rem 1.5rem',
        alignItems: 'center',
        zIndex: 9999,
        direction: isRTL ? 'rtl' : 'ltr',
      }}
      buttonStyle={{
        background: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontWeight: 500,
        fontSize: '0.875rem',
        marginLeft: isRTL ? '0' : '0.5rem',
        marginRight: isRTL ? '0.5rem' : '0',
      }}
      declineButtonStyle={{
        background: 'transparent',
        border: '1px solid hsl(var(--border))',
        color: 'hsl(var(--foreground))',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontWeight: 500,
        fontSize: '0.875rem',
      }}
      contentStyle={{
        flex: '1 0 300px',
        margin: '0.5rem 0',
      }}
      expires={365}
    >
      <span className="text-sm text-muted-foreground">
        {t.message}
      </span>
    </CookieConsent>
  );
};

export default ConsentBanner;
