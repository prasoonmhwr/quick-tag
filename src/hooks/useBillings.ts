import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export const useBillings = () => {
  const [invoices, setInvoices] = useState<any>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [error, setError] = useState<string |null>(null);
  const { userId } = useAuth();
  const fetchInvoices = async () => {
    if (!userId) {
        setInvoicesLoading(false);
      return;
    }

    try {
        setInvoicesLoading(true);
      const response = await fetch('/api/payments');

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch payments');
        setInvoicesLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setInvoices(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch payments');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('An unexpected error occurred');
    } finally {
        setInvoicesLoading(false);
    }
  };

  useEffect(() => {
    
    fetchInvoices();
  }, [userId]);

  return { invoices, invoicesLoading, error, fetchInvoices };
};