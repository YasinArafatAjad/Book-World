import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, setDoc, getDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const FavoritesContext = createContext();

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadFavorites = async () => {
      if (!currentUser) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        const favoritesDoc = await getDoc(doc(db, 'favorites', currentUser.uid));
        if (favoritesDoc.exists()) {
          setFavorites(favoritesDoc.data().books || []);
        } else {
          await setDoc(doc(db, 'favorites', currentUser.uid), {
            books: [],
            updatedAt: serverTimestamp()
          });
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [currentUser]);

  const toggleFavorite = async (book) => {
    if (!currentUser) {
      return false;
    }

    try {
      const favoritesRef = doc(db, 'favorites', currentUser.uid);
      const isFavorite = favorites.some(fav => fav.id === book.id);

      if (isFavorite) {
        await setDoc(favoritesRef, {
          books: favorites.filter(fav => fav.id !== book.id),
          updatedAt: serverTimestamp()
        });
        setFavorites(prev => prev.filter(fav => fav.id !== book.id));
      } else {
        const bookData = {
          id: book.id,
          title: book.title,
          author: book.author,
          imageUrl: book.imageUrl,
          price: book.price
        };
        await setDoc(favoritesRef, {
          books: [...favorites, bookData],
          updatedAt: serverTimestamp()
        });
        setFavorites(prev => [...prev, bookData]);
      }

      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };

  const isFavorite = (bookId) => {
    return favorites.some(book => book.id === bookId);
  };

  const value = {
    favorites,
    loading,
    toggleFavorite,
    isFavorite
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}