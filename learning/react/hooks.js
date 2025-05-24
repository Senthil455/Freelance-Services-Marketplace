function useCounter(start = 0) {
  const [count, setCount] = React.useState(start);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(start);

  return { count, increment, decrement, reset };
}
