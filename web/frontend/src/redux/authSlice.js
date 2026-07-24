import { createSlice } from '@reduxjs/toolkit';

const storedToken = localStorage.getItem('bamp_token');
const storedUser = localStorage.getItem('bamp_user');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem('bamp_token', action.payload.token);
      localStorage.setItem('bamp_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('bamp_token');
      localStorage.removeItem('bamp_user');
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setAuthSuccess, logout, setAuthLoading, setAuthError } = authSlice.actions;
export default authSlice.reducer;
