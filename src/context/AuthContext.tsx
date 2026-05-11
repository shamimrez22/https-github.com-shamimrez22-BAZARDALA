import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminCreds: any;
  loginAdmin: (username: string, pass: string) => boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserProfile: (data: { name: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminSession, setIsAdminSession] = useState(localStorage.getItem('isAdmin') === 'true');
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
          toast.success('লগইন সফল হয়েছে');
        }
      } catch (error: any) {
        console.error('Redirect login error:', error);
        if (error.code === 'auth/unauthorized-domain') {
          toast.error('Firebase Console এ এই ডোমেইনটি (Domain) অ্যাড করা নেই। দয়া করে Authorized Domains এ ডোমেইনটি যুক্ত করুন।');
        } else if (error.code !== 'auth/operation-not-supported-in-this-environment') {
           // Ignore this common error in some development environments
           toast.error('লগইন ত্রুটি: ' + error.message);
        }
      }
    };
    checkRedirect();

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log('Current Auth State User:', firebaseUser?.email);
        setUser(firebaseUser);
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const currentProfile = userDoc.data() as UserProfile;
            console.log('User Profile found:', currentProfile.role);
            setProfile(currentProfile);
          } else {
            console.log('Creating new profile for:', firebaseUser.email);
            // First time login - Create profile
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
          // If logged out from Firebase, also clear admin session
          setIsAdminSession(false);
          localStorage.removeItem('isAdmin');
        }
      } catch (error) {
        console.error('CRITICAL Auth Error:', error);
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
      localStorage.setItem('isAdmin', 'true');
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
        message = 'এই ডোমেইনটি (Domain) Firebase এ অনুমোদিত নয়। দয়া করে Firebase Console এ গিয়ে Authorized Domains এ এই ডোমেইনটি যুক্ত করুন।';
        toast.error(message, { duration: 10000 });
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

  const logout = async () => {
    setIsAdminSession(false);
    localStorage.removeItem('isAdmin');
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

  // Tighten isAdmin logic: A super_admin (Master Owner) can always access admin if logged in via Firebase.
  // Others need BOTH a valid Firebase profile with admin role AND an active admin session (from login form).
  const isAdmin = !!profile && profile.status === 'active' && (
    profile.role === 'super_admin' || 
    (isAdminSession && profile.role === 'admin')
  );
  
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
