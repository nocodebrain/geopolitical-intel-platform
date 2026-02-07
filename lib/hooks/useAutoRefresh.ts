import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseAutoRefreshOptions {
  interval?: number; // milliseconds, default 1 hour
  onRefresh?: () => Promise<void>;
  enableToast?: boolean;
}

export function useAutoRefresh({ 
  interval = 60 * 60 * 1000, // 1 hour default
  onRefresh,
  enableToast = true 
}: UseAutoRefreshOptions = {}) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState<number>(interval);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      if (onRefresh) {
        await onRefresh();
      }
      
      setLastUpdated(new Date());
      
      if (enableToast) {
        toast.success('Data refreshed successfully', {
          duration: 2000,
          icon: '🔄',
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            border: '1px solid rgba(148, 163, 184, 0.2)',
          }
        });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      
      if (enableToast) {
        toast.error('Failed to refresh data', {
          duration: 3000,
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing, enableToast]);

  // Auto-refresh timer
  useEffect(() => {
    const timer = setInterval(() => {
      refresh();
    }, interval);

    return () => clearInterval(timer);
  }, [interval, refresh]);

  // Update countdown timer
  useEffect(() => {
    const countdown = setInterval(() => {
      const elapsed = Date.now() - lastUpdated.getTime();
      const remaining = Math.max(0, interval - elapsed);
      setTimeUntilNext(remaining);
    }, 1000);

    return () => clearInterval(countdown);
  }, [lastUpdated, interval]);

  // Format time ago
  const getTimeAgo = useCallback(() => {
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }, [lastUpdated]);

  // Format time until next
  const getTimeUntilNext = useCallback(() => {
    const seconds = Math.floor(timeUntilNext / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }, [timeUntilNext]);

  return {
    lastUpdated,
    isRefreshing,
    refresh,
    getTimeAgo,
    getTimeUntilNext,
    timeUntilNext
  };
}
