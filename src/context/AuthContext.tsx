import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { UserProfile } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [adminCreds, setAdminCreds] = useState({ username: 'SHAMIM', pass: '321' });

  const MASTER_EMAIL = 'shamimrez22@gmail.com';

  useEffect(() => {
    // Sync admin credentials from settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.adminCredentials) {
          setAdminCreds(data.adminCredentials);
        }
      }
    });

    // Handle redirected sign-ins
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('Redirect login success:', result.user.email);
          toast.success('Login successful');
        }
      } catch (error: any) {
        console.error('Redirect login error:', error);
        if (error.code === 'auth/unauthorized-domain') {
          const domain = window.location.hostname;
          const message = `Firebase domain not authorized: ${domain}`;
          
          toast.error(message, { 
            duration: 20000,
            description: "Go to Firebase Console -> Auth -> Settings -> Authorized Domains",
          });
        }
      }
    };
    checkRedirect();

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const currentProfile = userDoc.data() as UserProfile;
            setProfile(currentProfile);
          } else {
            const isMaster = firebaseUser.email?.toLowerCase() === MASTER_EMAIL;
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: isMaster ? 'super_admin' : 'customer',
              status: 'active',
              wishlist: [],
              cart: [],
              createdAt: new Date().toISOString()
            } as any;
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
          setIsAdminSession(false);
        }
      } catch (error) {
        console.error('Auth Error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubSettings();
      unsubAuth();
    };
  }, []);

  const loginAdmin = (username: string, pass: string) => {
    if (username === adminCreds.username && pass === adminCreds.pass) {
      setIsAdminSession(true);
      return true;
    }
    return false;
  };

  const loginWithGoogle = async () => {
    try {
      console.log('Starting Google Login...');
      // Try popup first
      await signInWithPopup(auth, googleProvider);
      console.log('Google Popup success');
      toast.success('সফলভাবে লগইন করেছেন');
    } catch (error: any) {
      console.error('Google login error (popup):', error);
      
      // Better error message for user
      let message = 'গুগল লগইন করতে সমস্যা হয়েছে।';
      
      if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        message = `এই ডোমেইনটি (${domain}) Firebase এ অনুমোদিত নয়। দয়া করে Firebase Console এ গিয়ে এটি Authorized Domains এ যুক্ত করুন।`;
        toast.error(message, { 
          duration: 15000,
          action: {
            label: 'Copy Domain',
            onClick: () => {
              navigator.clipboard.writeText(domain);
              toast.success('Domain copied!');
            }
          }
        });
        throw new Error(message);
      }

      // If popup is blocked or fails, try redirect as a fallback
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        try {
          console.log('Attempting redirect fallback...');
          toast.info('পপ-আপ ব্যবহার করা যাচ্ছে না, রিডাইরেক্ট করা হচ্ছে...');
          await signInWithRedirect(auth, googleProvider);
          return; 
        } catch (redirectError: any) {
          console.error('Google login error (redirect):', redirectError);
        }
      }

      if (error.code === 'auth/popup-blocked') {
        message = 'আপনার ব্রাউজারে পপ-আপ ব্লক করা আছে।';
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        message = 'লগইন প্রসেস বাতিল করা হয়েছে।';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'গুগল লগইন বর্তমানে ডিজেবল আছে। অ্যাডমিনের সাথে যোগাযোগ করুন।';
      }
      
      toast.error(message);
      throw new Error(message);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await firebaseUpdateProfile(userCredential.user, { displayName: name });
      
      // The onAuthStateChanged listener will handle profile creation in Firestore
      toast.success('রেজিস্ট্রেশন সফল হয়েছে');
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে।';
      if (error.code === 'auth/email-already-in-use') message = 'এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে।';
      if (error.code === 'auth/weak-password') message = 'পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।';
      if (error.code === 'auth/invalid-email') message = 'সঠিক ইমেইল দিন।';
      toast.error(message);
      throw new Error(message);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast.success('লগইন সফল হয়েছে');
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'লগইন করতে সমস্যা হয়েছে।';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') message = 'ইমেইল বা পাসওয়ার্ড ভুল।';
      if (error.code === 'auth/too-many-requests') message = 'ভুল পাসওয়ার্ড দেওয়ার কারণে অ্যাকাউন্টটি সাময়িকভাবে লক হয়েছে। একটু পরে চেষ্টা করুন।';
      toast.error(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    setIsAdminSession(false);
    await firebaseSignOut(auth);
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      try {
        // Reload the user to get latest photoURL/displayName from Auth service
        await auth.currentUser.reload();
        
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setProfile(data);
        }
        
        // Use a new object reference to trigger React re-render
        setUser({ ...auth.currentUser } as User);
      } catch (error) {
        console.error('Refresh profile error:', error);
      }
    }
  };

  const updateUserProfile = async (data: { name: string; photoURL?: string }) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    
    try {
      // 1. Update Firebase Auth profile
      await firebaseUpdateProfile(auth.currentUser, {
        displayName: data.name,
        photoURL: data.photoURL
      });

      // 2. Update Firestore document (idempotent if data is same)
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name: data.name,
        photoURL: data.photoURL || auth.currentUser.photoURL || ''
      });

      // 3. Force reload and state update
      await refreshProfile();
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
