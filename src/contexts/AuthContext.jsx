import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, deleteDoc, serverTimestamp, collection, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  async function signup(email, password, name) {
    try {
      // Check if this is the first user before creating the account
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const isFirstUser = usersSnapshot.empty;

      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        role: isFirstUser ? 'admin' : 'user',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  // Login with email and password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Logout
  function logout() {
    return signOut(auth);
  }

  // Reset password
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Update user profile
  async function updateUserProfile(name) {
    await updateProfile(auth.currentUser, { displayName: name });
    
    // Update Firestore user document
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userRef, {
      name,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Update current user state
    setCurrentUser({
      ...currentUser,
      displayName: name
    });
  }

  // Change password
  async function changePassword(currentPassword, newPassword) {
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
    } catch (error) {
      throw error;
    }
  }

  // Delete account
  async function deleteAccount(password) {
    try {
      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Delete user data from Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await deleteDoc(userRef);
      
      // Delete user account
      await deleteUser(auth.currentUser);
    } catch (error) {
      throw error;
    }
  }

  // Admin: Delete user
  async function adminDeleteUser(userId) {
    try {
      // Delete user data from Firestore
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Toggle user status (block/unblock)
  async function toggleUserStatus(userId, newStatus) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Check if user is admin and get user status
  async function checkUserRole(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role);
        setUserStatus(userData.status);
        return userData.role;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  }

  // Effect to handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await checkUserRole(user.uid);
      } else {
        setUserRole(null);
        setUserStatus(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userStatus,
    isAdmin: userRole === 'admin',
    isModerator: userRole === 'moderator',
    isDeveloper: userRole === 'developer',
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    changePassword,
    deleteAccount,
    adminDeleteUser,
    toggleUserStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}