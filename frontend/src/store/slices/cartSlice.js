import { createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('bookstore_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem('bookstore_cart', JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save cart to storage:', e);
  }
};

const initialItems = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: initialItems
  },
  reducers: {
    addToCart: (state, action) => {
      const { book, quantity = 1 } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.bookId === book._id || item.bookId === book.id
      );

      const effectivePrice =
        book.discountPrice > 0 && book.discountPrice < book.price
          ? book.discountPrice
          : book.price;

      const maxStock = book.stock || 99;

      if (existingIndex > -1) {
        const currentQty = state.items[existingIndex].quantity;
        const newQty = Math.min(currentQty + quantity, maxStock);
        state.items[existingIndex].quantity = newQty;
        state.items[existingIndex].subtotal = parseFloat((effectivePrice * newQty).toFixed(2));
      } else {
        const safeQty = Math.min(quantity, maxStock);
        state.items.push({
          bookId: book._id || book.id,
          title: book.title,
          author: book.author,
          coverImage: book.coverImage,
          price: book.price,
          discountPrice: book.discountPrice,
          effectivePrice: effectivePrice,
          stock: maxStock,
          quantity: safeQty,
          subtotal: parseFloat((effectivePrice * safeQty).toFixed(2))
        });
      }
      saveCartToStorage(state.items);
    },

    updateQuantity: (state, action) => {
      const { bookId, quantity } = action.payload;
      const item = state.items.find((i) => i.bookId === bookId);
      if (item) {
        const safeQty = Math.max(1, Math.min(quantity, item.stock));
        item.quantity = safeQty;
        item.subtotal = parseFloat((item.effectivePrice * safeQty).toFixed(2));
        saveCartToStorage(state.items);
      }
    },

    removeFromCart: (state, action) => {
      const bookId = action.payload;
      state.items = state.items.filter((item) => item.bookId !== bookId);
      saveCartToStorage(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      saveCartToStorage([]);
    }
  }
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;

// Selectors for accurate monetary breakdown
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartSubtotal = (state) => {
  const sum = state.cart.items.reduce((acc, item) => acc + item.effectivePrice * item.quantity, 0);
  return parseFloat(sum.toFixed(2));
};

export const selectDeliveryFee = (state) => {
  const subtotal = selectCartSubtotal(state);
  if (subtotal === 0) return 0;
  return subtotal >= 50 ? 0.0 : 3.5;
};

export const selectCartTotal = (state) => {
  const subtotal = selectCartSubtotal(state);
  const delivery = selectDeliveryFee(state);
  return parseFloat((subtotal + delivery).toFixed(2));
};

export default cartSlice.reducer;
