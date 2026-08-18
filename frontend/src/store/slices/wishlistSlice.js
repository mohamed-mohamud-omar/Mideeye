import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/wishlist');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleWishlistAsync = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (bookId, { rejectWithValue }) => {
    try {
      const res = await api.post('/wishlist/toggle', { bookId });
      return { items: res.data.data, isAdded: res.data.isAdded };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    isLoading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload || [];
      })
      .addCase(toggleWishlistAsync.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
      });
  }
});

export default wishlistSlice.reducer;
