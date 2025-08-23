'use client'
import React, {  useEffect,  useState } from 'react';
import { Plus, Settings } from 'lucide-react';

import { useRouter } from 'next/navigation';


import { toast } from 'sonner';
import { QRList } from '@/components/QRList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRGenerator } from '@/components/QRGenerator';
import { UserButton } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';


const Dashboard = () => {

    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const { userId } = useAuth()

    useEffect(() => {
        if (!userId) return;
        (async () => {
            const res = await fetch(`/api/access-check?userId=${userId}`);
            const allowed = await res.json();
            if (!allowed.allowed) {
                
                router.push("/pricing");
            }
        })();
    }, [userId]);
    
    function goToSetting() {
        router.push('/settings')
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    function getRelativeTimeString(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();

        const diffInSecs = Math.floor(diffInMs / 1000);
        const diffInMins = Math.floor(diffInSecs / 60);
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        const diffInMonths = Math.floor(diffInDays / 30);
        const diffInYears = Math.floor(diffInDays / 365);

        if (diffInYears > 0) {
            return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
        } else if (diffInMonths > 0) {
            return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
        } else if (diffInDays > 0) {
            return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
        } else if (diffInHours > 0) {
            return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
        } else if (diffInMins > 0) {
            return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
        } else {
            return 'just now';
        }
    }
    const handleUpload = () => {
        setIsOpen(true)
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto p-6 h-full">
                <div className='flex w-full items-center mb-8 justify-between'>
                    <div className='flex items-center space-x-2'>
                        <img src="/logo.svg" alt="Logo" width={40} height={40} />
                        <h1 className="text-xl sm:text-2xl font-bold bg-gray-900 bg-clip-text text-transparent">
                            <span className='font-[kantithin]'>Quick</span><span className='font-[doto]'>Tag</span>
                        </h1>
                    </div>
                    <div></div>
                    <div className='flex justify-between items-center w-20 text-zinc-500'> <button className="p-1 hover:bg-zinc-600 rounded transition-colors" onClick={(e) => { e.stopPropagation(); goToSetting() }}>
                        <Settings className="w-6 h-6 text-zinc-400 hover:text-zinc-200" />
                    </button>
                        <UserButton
                            appearance={{
                                elements: {
                                    userButtonPopoverMain: "bg-zinc-800",
                                    userPreview: "text-zinc-400",
                                    userButtonPopoverActionButton__manageAccount: "hidden",
                                    userButtonPopoverActionButton__signOut: "text-zinc-400 hover:text-orange-600",
                                    userButtonPopoverFooter: "bg-gradient-to-b from-zinc-700 to-zinc-900",

                                }
                            }
                            }
                        />
                    </div>
                </div>
                <div className='flex justify-end'>
                    <button
                        onClick={handleUpload}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg shadow hover:bg-gray-700 transition my-4"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create QR Code</span>
                    </button>
                </div>
                <QRList />

            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen} modal={true}>
                <DialogContent aria-describedby="Create QR Code" className="max-w-[100%] sm:max-w-[100%] max-h-[80vh] h-full w-7xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle></DialogTitle>
                    </DialogHeader>
                    <div className='w-full'><QRGenerator setDialogOpen={setIsOpen}/></div>
                </DialogContent>
            </Dialog>
        </div>
    );


};

export default Dashboard;