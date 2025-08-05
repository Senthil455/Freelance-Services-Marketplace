import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client.js';

export const fetchConversations = createAsyncThunk('chat/fetchConversations', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/chat/conversations');
    return data.conversations;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    activeConversation: null,
    messages: [],
    loading: false,
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      const msg = action.payload;
      if (state.activeConversation && msg.conversation?.toString() === state.activeConversation?._id?.toString()) {
        state.messages.push(msg);
      }
    },
    prependConversation: (state, action) => {
      const conv = action.payload;
      state.conversations = [conv, ...state.conversations.filter((c) => c._id !== conv._id)];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.loading = false;
      })
      .addCase(fetchConversations.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setActiveConversation, setMessages, addMessage, prependConversation } = chatSlice.actions;
export default chatSlice.reducer;