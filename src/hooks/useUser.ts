import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
interface UserDetail {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    dynamicAccess?: any
    provider: string;
    status: string
    currentPeriodEnd: Date;
cancel_at_period_end: boolean;
    subscriptionId: string;


}
export const useUser = () => {
    const [user, setUser] = useState<UserDetail | null>(null);
    const [userLoading, setUserLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { userId, getToken } = useAuth();
    const fetchUser = async () => {
        if (!userId) {
            setUserLoading(false);
            return;
        }

        try {
            setUserLoading(true);
            const response = await fetch('/api/userDetails');

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch user');
                setUserLoading(false);
                return;
            }

            const data = await response.json();
            if (data.success) {
                setUser(data.data);
                setError(null);
            } else {
                setError(data.message || 'Failed to fetch user');
            }
        } catch (err) {
            console.error('Error fetching user:', err);
            setError('An unexpected error occurred');
        } finally {
            setUserLoading(false);
        }
    };
    const updateUser = async (numberOfExports: number) => {
        if (!userId) {
            return
        }
        try {
            const suggestionPUTResponse = await fetch('/api/userDetails', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ numberOfExports: numberOfExports + 1 }),
            });
        } catch (err) {

        }
    }

    useEffect(() => {

        fetchUser();
    }, [userId, getToken]);

    return { user, userLoading, error, fetchUser, updateUser };
};