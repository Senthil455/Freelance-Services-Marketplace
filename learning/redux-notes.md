# Redux Toolkit notes

- createSlice bundles state, reducers and actions in one place.
- Immer lets reducers mutate state directly - no manual spreads.
- createAsyncThunk generates pending, fulfilled and rejected actions for async calls.
- configureStore wires slices together and enables the devtools.
- Selectors read state: useSelector((s) => s.auth.user).
- extraReducers listen to thunk actions (pending / fulfilled / rejected).
