import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const RETRY_COUNT = 3;
const RETRY_TIMEOUT = 5000; // 5 seconds

export const useLoadingWithRetry = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeWithRetry = useCallback(async (asyncFunction) => {
    setLoading(true);
    setError(null);
    
    let attempts = 0;
    
    while (attempts < RETRY_COUNT) {
      try {
        const result = await Promise.race([
          asyncFunction(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), RETRY_TIMEOUT)
          )
        ]);
        
        setLoading(false);
        return result;
      } catch (err) {
        attempts++;
        
        if (attempts === RETRY_COUNT) {
          const errorMessage = err.message || 'An error occurred';
          setError(errorMessage);
          toast.error(`Failed after ${RETRY_COUNT} attempts: ${errorMessage}`);
          setLoading(false);
          return null;
        }
        
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.info(`Retrying... Attempt ${attempts + 1} of ${RETRY_COUNT}`);
      }
    }
  }, []);

  return { loading, error, executeWithRetry };
}; 