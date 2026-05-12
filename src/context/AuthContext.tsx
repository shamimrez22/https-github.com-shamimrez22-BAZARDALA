import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signOut as firebaseSignOut 
} from 'firebase/auth'; // Still using for the sign out helper if needed, but mostly manual now
import { doc, getDoc, setDoc, onSnapshot, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';
import { toast } from 'sonner';

// Simplified User interface consistent with the manual system
interface SimpleUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface AuthContextType {
  user: SimpleUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminCreds: any;
  loginAdmin: (username: string, pass: string) => boolean;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserProfile: (data: { name: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [adminCreds, setAdminCreds] = useState({ username: 'SHAMIM', pass: '321' });

  const MASTER_EMAIL = 'shamimrez22@gmail.com';

  useEffect(() => {
    // Sync admin credentials
    const unsubSettings = onSnapshot(doc(db, 'settings', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.adminCredentials) {
          setAdminCreds(data.adminCredentials);
        }
      }
    });

    // CUSTOM LOCAL AUTH INITIALIZATION
    const initializeAuth = async () => {
      // 1. Check Admin Session
      const savedAdmin = localStorage.getItem('is_admin_session');
      if (savedAdmin === 'true') {
        setIsAdminSession(true);
      }

      const savedUid = localStorage.getItem('site_user_id');
      if (savedUid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', savedUid));
          if (userDoc.exists()) {
            const currentProfile = userDoc.data() as UserProfile;
            setProfile(currentProfile);
            setUser({
              uid: currentProfile.uid,
              email: currentProfile.email,
              displayName: currentProfile.name,
              photoURL: currentProfile.photoURL
            });
          } else {
            localStorage.removeItem('site_user_id');
          }
        } catch (error) {
          console.error('Local Auth Init Error:', error);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    return () => {
      unsubSettings();
    };
  }, []);

  const loginAdmin = (username: string, pass: string) => {
    if (username === adminCreds.username && pass === adminCreds.pass) {
      setIsAdminSession(true);
      localStorage.setItem('is_admin_session', 'true');
      return true;
    }
    return false;
  };

  const loginWithGoogle = async () => {
    toast.error('গুগল লগইন বর্তমানে ডিজেবল আছে। ওয়েবসাইটে রেজিস্টার করুন।');
  };

  const register = async (email: string, pass: string, name: string) => {
    try {
      // 1. Check if user already exists
      const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে।');
      }

      // 2. Create local user record
      const uid = 'user_' + Math.random().toString(36).substr(2, 9);
      const isMaster = email.toLowerCase() === MASTER_EMAIL;
      
      const newProfile: UserProfile = {
        uid,
        name,
        email: email.toLowerCase(),
        password: pass, // Storing locally for simplicity as requested
        role: isMaster ? 'super_admin' : 'customer',
        status: 'active',
        wishlist: [],
        cart: [],
        createdAt: new Date().toISOString()
      } as any;

      await setDoc(doc(db, 'users', uid), newProfile);
      
      // 3. Set Session
      localStorage.setItem('site_user_id', uid);
      setUser({
        uid,
        email: newProfile.email,
        displayName: name,
        photoURL: ''
      });
      setProfile(newProfile);
      
      toast.success('রেজিস্ট্রেশন সফল হয়েছে');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে।');
      throw error;
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const q = query(
        collection(db, 'users'), 
        where('email', '==', email.toLowerCase()),
        where('password', '==', pass)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('ইমেইল বা পাসওয়ার্ড ভুল।');
      }

      const userData = querySnapshot.docs[0].data() as UserProfile;
      
      if (userData.status !== 'active') {
        throw new Error('আপনার অ্যাকাউন্টটি ডিজেবল আছে।');
      }

      // Set Session
      localStorage.setItem('site_user_id', userData.uid);
      setUser({
        uid: userData.uid,
        email: userData.email,
        displayName: userData.name,
        photoURL: userData.photoURL
      });
      setProfile(userData);
      
      toast.success('লগইন সফল হয়েছে');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'লগইন করতে সমস্যা হয়েছে।');
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('site_user_id');
    localStorage.removeItem('is_admin_session');
    setIsAdminSession(false);
    setUser(null);
    setProfile(null);
    toast.success('লগআউট সফল হয়েছে');
  };

  const refreshProfile = async () => {
    const currentUid = user?.uid || localStorage.getItem('site_user_id');
    if (currentUid) {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setProfile(data);
          setUser({
            uid: data.uid,
            email: data.email,
            displayName: data.name,
            photoURL: data.photoURL
          });
        }
      } catch (error) {
        console.error('Refresh profile error:', error);
      }
    }
  };

  const updateUserProfile = async (data: { name: string; photoURL?: string }) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: data.name,
        photoURL: data.photoURL || ''
      });

      await refreshProfile();
      toast.success('প্রোফাইল আপডেট হয়েছে');
    } catch (error) {
      console.error('Update profile internal error:', error);
      throw error;
    }
  };

  // HARD SECURITY: Admin access ONLY allowed if explicitly logged in via the admin form (isAdminSession).
  // A super_admin (Master Email) still needs to provide the credentials to get an active Admin Session.
  const isAdmin = isAdminSession;
  
  const isSuperAdmin = !!profile && profile.role === 'super_admin' && profile.status === 'active';

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin,
      isSuperAdmin,
      adminCreds,
      loginAdmin,
      loginWithGoogle,
      register,
      login,
      logout,
      refreshProfile,
      updateUserProfile
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
