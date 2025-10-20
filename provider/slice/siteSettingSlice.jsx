import axiosInstance from '@/config/axios.config';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for API call
export const fetchSiteSetting = createAsyncThunk(
  'siteSetting/fetchSiteSetting',
  async () => {
    const {data} = await axiosInstance({
      url:`/api/Site-setting`,
      method:'get'
    });
    console.log('response pagination',data)
    return data.data;
  }
);

const siteSettingSlice = createSlice({
  name: 'siteSetting',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSiteSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSiteSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSiteSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default siteSettingSlice.reducer;