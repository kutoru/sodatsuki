export const handleError = (callback?: () => void) => (reason: any) => {
  console.warn("Error:", reason);
  callback?.();
};
