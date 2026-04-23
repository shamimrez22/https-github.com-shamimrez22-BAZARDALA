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
              bgColor: '#f4e4d4',
              ...(data.ads?.floatingNotice || {})
            }
          }
        };

        setSettings(sanitizedData as any);

        // Inject Dynamic Colors
        if (data.theme?.enabled) {
          const root = document.documentElement;
          root.style.setProperty('--primary-color', data.theme.primaryColor);
          root.style.setProperty('--secondary-color', data.theme.secondaryColor);
          root.style.setProperty('--background-color', data.theme.backgroundColor);
          root.style.setProperty('--card-color', data.theme.cardColor);
          root.style.setProperty('--button-color', data.theme.buttonColor);
        } else {
          // Reset to defaults
          const root = document.documentElement;
          root.style.setProperty('--primary-color', '#9B2B2C');
          root.style.setProperty('--secondary-color', '#ead9c4');
          root.style.setProperty('--background-color', '#f4e4d4');
          root.style.setProperty('--card-color', '#ffffff');
          root.style.setProperty('--button-color', '#9B2B2C');
        }
      }
      setLoading(false);
    }, (error) => {
      console.error('Settings sync error:', error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

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
