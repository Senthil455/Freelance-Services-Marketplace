import { createContext, useContext } from 'react';
import { useDispatch } from 'react-redux';

// Simple typed wrapper around useDispatch to avoid TS-style boilerplate.
const DispatchContext = createContext(null);

export function useAppDispatch() {
  const dispatch = useDispatch();
  if (!dispatch) throw new Error('useAppDispatch must be used inside a React Redux provider');
  return dispatch;
}

export default useAppDispatch;