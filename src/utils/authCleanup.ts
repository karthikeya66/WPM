// Clear all authentication data on window unload
export const setupAuthCleanup = () => {
  if (typeof window !== 'undefined') {
    // Clear session storage on page unload
    window.addEventListener('beforeunload', () => {
      sessionStorage.clear();
      localStorage.removeItem('supabase.auth.token');
    });

    // Clear on visibility change (tab switch, browser close)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sessionStorage.clear();
      }
    });
  }
};

// Initialize cleanup on app load
setupAuthCleanup();
