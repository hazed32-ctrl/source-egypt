/**
 * Pixel Loader Component
 * Lazily loads analytics scripts after consent
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isTrackingAllowed } from '@/lib/analytics/utils';

interface AnalyticsSetting {
  key: string;
  value: string | null;
  enabled: boolean;
}

const PixelLoader = () => {
  const [settings, setSettings] = useState<AnalyticsSetting[]>([]);
  const [consentGranted, setConsentGranted] = useState(isTrackingAllowed());

  // Fetch analytics settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('analytics_settings')
        .select('key, value, enabled');
      
      if (data) {
        setSettings(data);
      }
    };

    fetchSettings();
  }, []);

  // Listen for consent changes
  useEffect(() => {
    const handleConsent = () => {
      setConsentGranted(isTrackingAllowed());
    };

    window.addEventListener('consent_granted', handleConsent);
    return () => window.removeEventListener('consent_granted', handleConsent);
  }, []);

  // Load scripts only after consent
  useEffect(() => {
    if (!consentGranted) return;

    const loadScript = (src: string, id: string) => {
      if (document.getElementById(id)) return;
      
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    };

    const loadInlineScript = (content: string, id: string) => {
      if (document.getElementById(id)) return;
      
      const script = document.createElement('script');
      script.id = id;
      script.innerHTML = content;
      document.head.appendChild(script);
    };

    settings.forEach(setting => {
      if (!setting.enabled || !setting.value) return;

      switch (setting.key) {
        case 'ga4_measurement_id':
          loadScript(
            `https://www.googletagmanager.com/gtag/js?id=${setting.value}`,
            'ga4-script'
          );
          loadInlineScript(
            `window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${setting.value}');`,
            'ga4-config'
          );
          break;

        case 'gtm_container_id':
          loadInlineScript(
            `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${setting.value}');`,
            'gtm-script'
          );
          break;

        case 'meta_pixel_id':
          loadInlineScript(
            `!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${setting.value}');
            fbq('track', 'PageView');`,
            'meta-pixel'
          );
          break;

        case 'tiktok_pixel_id':
          loadInlineScript(
            `!function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${setting.value}');
            ttq.page();
            }(window, document, 'ttq');`,
            'tiktok-pixel'
          );
          break;

        case 'linkedin_partner_id':
          loadInlineScript(
            `_linkedin_partner_id = "${setting.value}";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);})(window.lintrk);`,
            'linkedin-insight'
          );
          break;

        case 'clarity_project_id':
          loadInlineScript(
            `(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${setting.value}");`,
            'clarity-script'
          );
          break;
      }
    });
  }, [consentGranted, settings]);

  return null; // This component only loads scripts, no UI
};

export default PixelLoader;
