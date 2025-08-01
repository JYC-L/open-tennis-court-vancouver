import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchFreedCourts,
  formatFreedCourtsMessage,
} from "../utils/freedCourtsApi.ts";

// Types
interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
}

interface FreedCourt {
  clubName: string;
  courtNumber: number;
  date: string;
  startTime: string;
  time: string;
}

interface ToastState {
  toasts: Toast[];
  freedCourts: FreedCourt[];
  isLoading: boolean;
  error: string | null;
  lastChecked: string | null;
}

const initialState: ToastState = {
  toasts: [],
  freedCourts: [],
  isLoading: false,
  error: null,
  lastChecked: null,
};

// Async thunk for fetching freed courts
export const checkFreedCourts = createAsyncThunk(
  "toast/checkFreedCourts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchFreedCourts();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to check for freed courts"
      );
    }
  }
);

// Generate unique ID for toasts
const generateToastId = () =>
  `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: (
      state,
      action: PayloadAction<{
        message: string;
        type: "success" | "error" | "info";
      }>
    ) => {
      const toast: Toast = {
        id: generateToastId(),
        message: action.payload.message,
        type: action.payload.type,
        isVisible: true,
      };
      state.toasts.push(toast);
    },
    hideToast: (state, action: PayloadAction<string>) => {
      const toast = state.toasts.find((t) => t.id === action.payload);
      if (toast) {
        toast.isVisible = false;
      }
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },
    mockFreedCourts: (state) => {
      // Create mock data for testing
      const mockData = [
        {
          clubName: "UBC Tennis Centre",
          courtNumber: 3,
          date: new Date().toISOString().split("T")[0],
          startTime: "2:00 PM",
          time: "2:00 PM",
        },
        {
          clubName: "Jericho Tennis Club",
          courtNumber: 1,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          startTime: "4:30 PM",
          time: "4:30 PM",
        },
      ];

      state.freedCourts = mockData;

      // Format message and show toast
      const mockResponse = { freed_courts: mockData };
      const message = formatFreedCourtsMessage(mockResponse);

      if (message) {
        const toast: Toast = {
          id: generateToastId(),
          message,
          type: "success",
          isVisible: true,
        };
        state.toasts.push(toast);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkFreedCourts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkFreedCourts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.lastChecked = new Date().toISOString();

        const { freed_courts } = action.payload;
        state.freedCourts = freed_courts || [];

        // Show toast if there are freed courts
        if (freed_courts && freed_courts.length > 0) {
          const message = formatFreedCourtsMessage(action.payload);
          if (message) {
            const toast: Toast = {
              id: generateToastId(),
              message,
              type: "success",
              isVisible: true,
            };
            state.toasts.push(toast);
          }
        }
      })
      .addCase(checkFreedCourts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;

        // Show error toast
        const toast: Toast = {
          id: generateToastId(),
          message: "Failed to check for new court availability",
          type: "error",
          isVisible: true,
        };
        state.toasts.push(toast);
      });
  },
});

export const {
  showToast,
  hideToast,
  removeToast,
  clearAllToasts,
  mockFreedCourts,
} = toastSlice.actions;

export default toastSlice.reducer;
