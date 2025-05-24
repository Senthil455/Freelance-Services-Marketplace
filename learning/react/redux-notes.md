# Redux Toolkit notes

- Redux keeps app state in a single store; components subscribe with useDispatch and useSelector.
- A slice groups state, reducers and actions for one feature (createSlice).
- Reducers are pure functions: same state + action -> same next state.
- Toolkit uses immer under the hood, so reducers can mutate state directly.
- Async logic goes in thunks created with createAsyncThunk.
