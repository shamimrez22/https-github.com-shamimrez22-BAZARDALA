import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SiteSettings } from '../types';
import { safeStorage } from '../lib/storage';

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(() => {
    const cached = safeStorage.get('bzd_site_settings_cache');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!settings);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'site'), async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteSettings;
        
        // Auto-migrate siteName to BAZAR DALA if it is BAZAR THOLE or other obsolete names
        const oldNames = ['LuxeCart', 'Luxe Cart', 'LUXECART', 'LUXE CART', 'My App', 'BAZAR THOLE', 'BAZAR_THOLE', 'SS SMART HAAT'];
        if (data.siteName && oldNames.includes(data.siteName)) {
          console.log(`Auto-migrating siteName from ${data.siteName} to BAZAR DALA`);
          updateDoc(doc(db, 'settings', 'site'), {
            siteName: 'BAZAR DALA',
            siteDescription: data.siteDescription?.toLowerCase().includes('thole')
              ? 'BAZAR DALA - Your premium destination for multi-category products and deals.'
              : data.siteDescription || 'BAZAR DALA - Your premium destination for multi-category products and deals.'
          }).catch(err => {
            console.error('Failed to auto-migrate siteName in Firestore:', err);
          });
        }

        // Ensure nesting doesn't break
        const sanitizedData = {
          ...data,
          ads: {
            ...data.ads,
            adsterra: {
              popunderCode: '',
              nativeBannerCode: '',
              socialBarCode: '',
              bannerOneCode: '',
              bannerTwoCode: '',
              bannerThreeCode: '',
              bannerFourCode: '',
              bannerFiveCode: '',
              bannerSixCode: '',
              ...(data.ads?.adsterra || {})
            },
            floatingNotice: {
              active: false,
              text: '',
              textColor: '#000000',
              bgColor: '#ffffff',
              ...(data.ads?.floatingNotice || {})
            },
            topScrollingNotice: {
              active: false,
              text: '',
              textColor: '#ffffff',
              bgColor: '#0A7C6E',
              ...(data.ads?.topScrollingNotice || {})
            }
          }
        };

        setSettings(sanitizedData as any);
        safeStorage.set('bzd_site_settings_cache', JSON.stringify(sanitizedData));
      } else {
        console.log('No site settings found. Initializing default site settings in Firestore...');
        const defaultSettings = {
          siteName: 'BAZAR DALA',
          siteDescription: 'BAZAR DALA - Your premium destination for multi-category products and deals.',
          siteDescriptionBangla: 'বাজার ডালা - আপনার দৈনন্দিন কেনাকাটার নির্ভরযোগ্য অনলাইন শপ।',
          contactEmail: 'support@bazardala.com',
          contactPhone: '01700000000',
          whatsappNumber: '8801700000000',
          contactAddress: 'Dhaka, Bangladesh',
          footerSupportLinks: [
            { label: 'Privacy Policy', url: '/info/privacy-policy' },
            { label: 'Terms & Conditions', url: '/info/terms-and-conditions' },
            { label: 'Refund Policy', url: '/info/refund-policy' }
          ],
          footerCompanyLinks: [
            { label: 'About Us', url: '/info/about-us' },
            { label: 'Contact Us', url: '/info/contact-us' }
          ],
          socialLinks: [
            { platform: 'facebook', url: 'https://facebook.com' },
            { platform: 'youtube', url: 'https://youtube.com' },
            { platform: 'instagram', url: 'https://instagram.com' }
          ],
          ads: {
            topScrollingNotice: {
              active: true,
              text: 'Welcome to BAZAR DALA! Free home delivery across Dhaka City on orders above ৳1000!',
              textColor: '#ffffff',
              bgColor: '#8B1E1E'
            },
            floatingNotice: {
              active: false,
              text: '',
              textColor: '#000000',
              bgColor: '#ffffff'
            }
          }
        };
        try {
          await setDoc(doc(db, 'settings', 'site'), defaultSettings);
        } catch (e) {
          console.error('Failed to initialize default site settings:', e);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error('Settings sync error:', error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Centralized Theme Injection Effect
  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    if (settings.theme?.enabled) {
      const theme = settings.theme;
      if (theme.primaryColor) root.style.setProperty('--primary-color', theme.primaryColor);
      if (theme.secondaryColor) root.style.setProperty('--secondary-color', theme.secondaryColor);
      if (theme.backgroundColor) {
        root.style.setProperty('--background-color', theme.backgroundColor);
        root.style.setProperty('--background', theme.backgroundColor); // Sync with CSS
      }
      if (theme.cardColor) root.style.setProperty('--card-color', theme.cardColor);
      if (theme.buttonColor) root.style.setProperty('--button-color', theme.buttonColor);
    } else {
      // Default Bazar Dala theme
      root.style.setProperty('--primary-color', '#0A7C6E');
      root.style.setProperty('--secondary-color', '#ffffff');
      root.style.setProperty('--background-color', '#ffffff');
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--card-color', '#ffffff');
      root.style.setProperty('--button-color', '#0A7C6E');
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
