import { createSlice } from '@reduxjs/toolkit';

const toastSlice = createSlice({
  name: 'toast',
  initialState: {
    toasts: []
  },
  reducers: {
    addToast: (state, action) => {
      const { id = Date.now(), message, type = 'success', duration = 4000 } = action.payload;
      state.toasts.push({ id, message, type, duration });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    }
  }
});

export const { addToast, removeToast } = toastSlice.actions;

export const showToast = (message, type = 'success') => (dispatch) => {
  const id = Date.now();
  dispatch(addToast({ id, message, type }));
  setTimeout(() => {
    dispatch(removeToast(id));
  }, 4000);
};

export default toastSlice.reducer;
