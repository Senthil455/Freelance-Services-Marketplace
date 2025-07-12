# Redux Toolkit notes

- createSlice bundles the reducer and actions for one piece of state.
- extraReducers handles pending / fulfilled / rejected of async thunks.
- createAsyncThunk calls an api and returns a payload to the reducer.
- useDispatch returns dispatch, useSelector picks a slice of the store.
- The store combines every slice reducer into one root reducer.
