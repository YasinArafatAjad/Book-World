import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Calculate cart totals
  const cartTotal = Array.isArray(cart) ? cart.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;
  const cartItems = Array.isArray(cart) ? cart.reduce((total, item) => total + item.quantity, 0) : 0;

  // Load cart from localStorage or Firebase
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          // Load cart from Firebase if user is logged in
          const cartDoc = await getDoc(doc(db, 'carts', currentUser.uid));
          if (cartDoc.exists()) {
            const cartData = cartDoc.data().items;
            setCart(Array.isArray(cartData) ? cartData : []);
          } else {
            // Create a new cart for the user if it doesn't exist
            await setDoc(doc(db, 'carts', currentUser.uid), {
              items: [],
              updatedAt: serverTimestamp()
            });
            setCart([]);
          }
        } else {
          // Load cart from localStorage if user is not logged in
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart);
              setCart(Array.isArray(parsedCart) ? parsedCart : []);
            } catch (error) {
              console.error('Error parsing cart from localStorage:', error);
              setCart([]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [currentUser]);

  // Save cart to localStorage when it changes (for non-authenticated users)
  useEffect(() => {
    if (!loading && !currentUser && Array.isArray(cart)) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, loading, currentUser]);

  // Save cart to Firebase when it changes (for authenticated users)
  useEffect(() => {
    const saveCart = async () => {
      if (!loading && currentUser && Array.isArray(cart)) {
        try {
          const cartDocRef = doc(db, 'carts', currentUser.uid);
          const cartDocSnap = await getDoc(cartDocRef);
          
          if (cartDocSnap.exists()) {
            await updateDoc(cartDocRef, {
              items: cart,
              updatedAt: serverTimestamp()
            });
          } else {
            await setDoc(cartDocRef, {
              items: cart,
              updatedAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error('Error saving cart to Firebase:', error);
        }
      }
    };

    saveCart();
  }, [cart, loading, currentUser]);

  // Add item to cart
  const addItem = (book, quantity = 1) => {
    setCart(prevCart => {
      if (!Array.isArray(prevCart)) prevCart = [];
      
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(item => item.id === book.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Add new item if it doesn't exist
        return [...prevCart, {
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          imageUrl: book.imageUrl,
          quantity
        }];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (id, quantity) => {
    setCart(prevCart => {
      if (!Array.isArray(prevCart)) return [];
      return prevCart.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, quantity) } 
          : item
      );
    });
  };

  // Remove item from cart
  const removeItem = (id) => {
    setCart(prevCart => {
      if (!Array.isArray(prevCart)) return [];
      return prevCart.filter(item => item.id !== id);
    });
  };

  // Clear the entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Transfer cart from localStorage to Firebase when user logs in
  const transferCartToFirebase = async () => {
    if (currentUser) {
      try {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          const parsedCart = JSON.parse(localCart);
          const cartData = Array.isArray(parsedCart) ? parsedCart : [];
          
          if (cartData.length > 0) {
            await setDoc(doc(db, 'carts', currentUser.uid), {
              items: cartData,
              updatedAt: serverTimestamp()
            });
            setCart(cartData);
            localStorage.removeItem('cart');
          }
        }
      } catch (error) {
        console.error('Error transferring cart to Firebase:', error);
        setCart([]);
      }
    }
  };

  const value = {
    cart,
    cartTotal,
    cartItems,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    transferCartToFirebase
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}