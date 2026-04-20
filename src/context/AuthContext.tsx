import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginAdmin: (username: string, pass: string) => boolean;
  loginWithGoogle: () => Promise<void>;
  logoutAdmin: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminSession, setIsAdminSession] = useState(localStorage.getItem('isAdmin') === 'true');
  const [adminCreds, setAdminCreds] = useState({ username: 'SHAMIM', pass: '321' });
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(['shamimrez22@gmail.com']);

  useEffect(() => {
    // Listen for site settings to get admin credentials and emails
    const unsubSettings = onSnapshot(doc(db, 'settings', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.ads?.adminCredentials) {
          setAdminCreds(data.ads.adminCredentials);
        }
        if (data.ads?.adminEmails && Array.isArray(data.ads.adminEmails)) {
          setAuthorizedEmails(data.ads.adminEmails);
        }
      }
    });

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const currentProfile = userDoc.exists() ? userDoc.data() as UserProfile : null;
          
          // Re-evaluate role based on dynamic authorized emails
          const isUserAdminByEmail = firebaseUser.email && 
            authorizedEmails.map(e => e.toLowerCase()).includes(firebaseUser.email.toLowerCase());
          
          if (currentProfile) {
            // Update role if it changed in settings
            if (isUserAdminByEmail && currentProfile.role !== 'admin') {
               const updatedProfile = { ...currentProfile, role: 'admin' as const };
               await setDoc(doc(db, 'users', firebaseUser.uid), updatedProfile);
               setProfile(updatedProfile);
            } else if (!isUserAdminByEmail && currentProfile.role === 'admin' && firebaseUser.email?.toLowerCase() !== 'shamimrez22@gmail.com') {
               // Demote if removed from list (keeping master shamim email always admin as fallback)
               const updatedProfile = { ...currentProfile, role: 'customer' as const };
               await setDoc(doc(db, 'users', firebaseUser.uid), updatedProfile);
               setProfile(updatedProfile);
            } else {
               setProfile(currentProfile);
            }
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: isUserAdminByEmail ? 'admin' : 'customer',
              wishlist: [],
              cart: [],
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubSettings();
      unsubAuth();
    };
  }, []);

  // Update profile role if authorizedEmails change
  useEffect(() => {
    const updateRole = async () => {
      if (user && profile) {
        const isUserAdminByEmail = user.email && 
          authorizedEmails.map(e => e.toLowerCase()).includes(user.email.toLowerCase());
        
        if (isUserAdminByEmail && profile.role !== 'admin') {
          const updatedProfile = { ...profile, role: 'admin' as const };
          await setDoc(doc(db, 'users', user.uid), updatedProfile);
          setProfile(updatedProfile);
        } else if (!isUserAdminByEmail && profile.role === 'admin' && user.email?.toLowerCase() !== 'shamimrez22@gmail.com') {
          const updatedProfile = { ...profile, role: 'customer' as const };
          await setDoc(doc(db, 'users', user.uid), updatedProfile);
          setProfile(updatedProfile);
        }
      }
    };
    updateRole();
  }, [authorizedEmails, user]);

  const loginAdmin = (username: string, pass: string) => {
    if (username === adminCreds.username && pass === adminCreds.pass) {
      setIsAdminSession(true);
      localStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logoutAdmin = async () => {
    setIsAdminSession(false);
    localStorage.removeItem('isAdmin');
    await firebaseSignOut(auth);
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin: isAdminSession || profile?.role === 'admin',
      loginAdmin,
      loginWithGoogle,
      logoutAdmin,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
