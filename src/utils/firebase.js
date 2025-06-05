import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Books
export const getBooks = async (options = {}) => {
  try {
    const { category, featured, search, sort, limit: limitCount } = options;
    
    // Start with a basic query
    let booksQuery = collection(db, 'books');
    
    // Apply filters
    if (category) {
      booksQuery = query(booksQuery, where('category', '==', category));
    }
    
    if (featured) {
      booksQuery = query(booksQuery, where('featured', '==', true));
    }
    
    // Apply search (Note: Firebase doesn't support text search well, this is a basic implementation)
    if (search) {
      // This is a simplified approach - Firestore doesn't support full-text search
      booksQuery = query(booksQuery, where('title', '>=', search), where('title', '<=', search + '\uf8ff'));
    }
    
    // Apply sorting
    if (sort) {
      const [field, direction] = sort.split(':');
      booksQuery = query(booksQuery, orderBy(field, direction === 'desc' ? 'desc' : 'asc'));
    } else {
      // Default sort
      booksQuery = query(booksQuery, orderBy('createdAt', 'desc'));
    }
    
    // Apply limit
    if (limitCount) {
      booksQuery = query(booksQuery, limit(parseInt(limitCount)));
    }
    
    const snapshot = await getDocs(booksQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting books:', error);
    throw error;
  }
};

export const getBookById = async (id) => {
  try {
    const docRef = doc(db, 'books', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Book not found');
    }
  } catch (error) {
    console.error('Error getting book by ID:', error);
    throw error;
  }
};

export const addBook = async (bookData) => {
  try {
    const booksRef = collection(db, 'books');
    const newBook = {
      ...bookData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(booksRef, newBook);
    return docRef.id;
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};

export const updateBook = async (id, bookData) => {
  try {
    const bookRef = doc(db, 'books', id);
    
    await updateDoc(bookRef, {
      ...bookData,
      updatedAt: serverTimestamp()
    });
    
    return id;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

export const deleteBook = async (id) => {
  try {
    const bookRef = doc(db, 'books', id);
    await deleteDoc(bookRef);
    return id;
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};

// Check for duplicate orders within the last hour
const checkDuplicateOrder = async (userId, items) => {
  try {
    // Get timestamp for 1 hour ago
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    // Query recent orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      where('createdAt', '>', Timestamp.fromDate(oneHourAgo)),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(ordersQuery);
    
    // Check each recent order for matching items
    for (const doc of snapshot.docs) {
      const order = doc.data();
      
      // Check if items match (same books and quantities)
      const itemsMatch = items.every(newItem => {
        const matchingItem = order.items.find(existingItem => 
          existingItem.id === newItem.id && 
          existingItem.quantity === newItem.quantity
        );
        return matchingItem !== undefined;
      }) && order.items.length === items.length;
      
      if (itemsMatch) {
        return true; // Duplicate order found
      }
    }
    
    return false; // No duplicate found
  } catch (error) {
    console.error('Error checking for duplicate orders:', error);
    throw error;
  }
};

// Orders
export const createOrder = async (userId, orderData) => {
  try {
    // Check for duplicate orders
    const isDuplicate = await checkDuplicateOrder(userId, orderData.items);
    if (isDuplicate) {
      throw new Error('DUPLICATE_ORDER');
    }

    return await runTransaction(db, async (transaction) => {
      // First, read all book documents and verify stock
      const bookRefs = orderData.items.map(item => doc(db, 'books', item.id));
      const bookDocs = await Promise.all(
        bookRefs.map(ref => transaction.get(ref))
      );

      // Verify all books exist and have sufficient stock
      const stockUpdates = [];
      bookDocs.forEach((doc, index) => {
        if (!doc.exists()) {
          throw new Error(`Book ${orderData.items[index].id} not found`);
        }

        const currentStock = doc.data().stock;
        const requestedQuantity = orderData.items[index].quantity;

        if (currentStock < requestedQuantity) {
          throw new Error(`Insufficient stock for book ${orderData.items[index].id}`);
        }

        stockUpdates.push({
          ref: bookRefs[index],
          newStock: currentStock - requestedQuantity
        });
      });

      // After all reads and validations, perform writes
      // Create the order document reference first
      const ordersRef = collection(db, 'orders');
      const orderRef = doc(ordersRef);

      // Set the order data
      transaction.set(orderRef, {
        userId,
        ...orderData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update all book stocks
      stockUpdates.forEach(update => {
        transaction.update(update.ref, {
          stock: update.newStock,
          updatedAt: serverTimestamp()
        });
      });

      return orderRef.id;
    });
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    return orderId;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Team Members
export const addTeamMember = async (memberData) => {
  try {
    const teamRef = collection(db, 'team');
    const newMember = {
      ...memberData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(teamRef, newMember);
    return docRef.id;
  } catch (error) {
    console.error('Error adding team member:', error);
    throw error;
  }
};

export const getTeamMembers = async () => {
  try {
    const teamQuery = query(
      collection(db, 'team'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(teamQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting team members:', error);
    throw error;
  }
};

export const deleteTeamMember = async (id) => {
  try {
    const memberRef = doc(db, 'team', id);
    await deleteDoc(memberRef);
    return id;
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
};

// Site Settings
export const updateSiteLogo = async (logoUrl) => {
  try {
    const settingsRef = doc(db, 'settings', 'site');
    await setDoc(settingsRef, {
      logoUrl,
      faviconUrl: logoUrl, // Store favicon URL alongside logo
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Update favicon in the DOM
    const favicon = document.querySelector("link[rel*='icon']");
    if (favicon) {
      favicon.href = logoUrl;
    }

    return true;
  } catch (error) {
    console.error('Error updating site logo:', error);
    throw error;
  }
};

export const getSiteSettings = async () => {
  try {
    const settingsRef = doc(db, 'settings', 'site');
    const snapshot = await getDoc(settingsRef);
    
    if (snapshot.exists()) {
      const settings = snapshot.data();
      
      // Update favicon in the DOM when settings are loaded
      if (settings.faviconUrl) {
        const favicon = document.querySelector("link[rel*='icon']");
        if (favicon) {
          favicon.href = settings.faviconUrl;
        }
      }
      
      return settings;
    }
    
    return {};
  } catch (error) {
    console.error('Error getting site settings:', error);
    throw error;
  }
};