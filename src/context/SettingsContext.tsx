import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { SiteSettings } from '../types';

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteSettings;
        
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
            }
          }
        };

        setSettings(sanitizedData as any);
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
      root.style.setProperty('--primary-color', '#9B2B2C');
      root.style.setProperty('--secondary-color', '#ffffff');
      root.style.setProperty('--background-color', '#ffffff');
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--card-color', '#ffffff');
      root.style.setProperty('--button-color', '#9B2B2C');
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
