import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
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

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const isMaster = firebaseUser.email?.toLowerCase() === MASTER_EMAIL;
          
          if (userDoc.exists()) {
            const currentProfile = userDoc.data() as UserProfile;
            
            // Auto-upgrade role if it's the master email but role is different
            if (isMaster && currentProfile.role !== 'super_admin') {
              const updatedProfile = { ...currentProfile, role: 'super_admin' as const, status: 'active' as const };
              await updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'super_admin', status: 'active' });
              setProfile(updatedProfile);
            } else {
              setProfile(currentProfile);
            }
          } else {
            // First time login - Create profile
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

  const isAdmin = isAdminSession || (!!profile && (profile.role === 'admin' || profile.role === 'super_admin') && profile.status === 'active');
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
