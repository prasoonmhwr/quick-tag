'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { Search, Download, Clipboard, Eye, Trash2, Info, Upload, Plus, Settings } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { Skeleton } from '@/components/ui/skeleton';

import { toast } from 'sonner';
import { QRList } from '@/components/QRList';

const Dashboard = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isCreateOpen, setCreateOpen] = useState<boolean>(false)
    const [isOptionOpen, setOptionOpen] = useState<boolean>(false)
    const [progress, setProgress] = useState(0)
    // useEffect(() => {
    //     refetch()
    // }, [])

    // useEffect(() => {
    //     if(user?.planType == PlanType.PRO && user?.subscription.plan.serviceProvider == ServiceProvider.DODOPAYMENTS){
    //         fetch('/api/subscriptions/check',{
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 subscriptionId: user?.subscription.razorpaySubscriptionId,
    //             }),
    //         }).then(response => response.json())
    //         .then(data => {
    //             console.log(data)
    //         })
    //     }
    // },[user])
    // function showResume(e: any, resumeId: string) {
    //     e.stopPropagation()
    //     setResumeId(resumeId)
    //     router.push(`/dashboard/${resumeId}`)
    // }
    // const handleCheckboxClick = (e: React.MouseEvent) => {
    //     e.stopPropagation();
    // };
    function handleUpgrade() {
        router.push('/subscription')
    }
    function goToSetting() {
        router.push('/settings')
    }
    // const handleActionClick = async (action: string, resumeId: string) => {
    //     switch (action) {
    //         case "delete":
    //             removeResume(resumeId)
    //             break;
    //         case "duplicate":
    //             if((user?.planType == PlanType.STARTER && user?.numberOfResumes >=1) || (user?.planType == PlanType.PRO && user?.subscription.status != SubscriptionStatus.ACTIVE)){
    //                 toast.message("Upgrade to PRO")
    //                 return
    //             }
    //             const resume = resumes?.find(resume => resume.id === resumeId)
    //             const data = await fetch(resume?.pdfUrl!)
    //             const blob = await data.blob()
    //             const name = resume?.pdfName.split(".")[0]
    //             const file = new File([blob], `${name}_Copy.pdf`, { type: "application/pdf" });
    //             const dataCopy = await uploadResume(file, setProgress);
    //             refetch()
    //             const resumeData = await dataCopy.data
    //             setResumeId(resumeData!.id)
    //             router.push(`/dashboard/${resumeData!.id}`)
    //             break;
    //     }
    // };
    // const filteredResumes = useMemo(() => {
    //     const query = searchQuery.toLowerCase().trim();
    //     if (!query || query == '') return resumes;

    //     return resumes.filter(resume =>
    //         resume.pdfName.toLowerCase().includes(query) ||
    //         getRelativeTimeString(resume.updatedAt.toString()).toLowerCase().includes(query)
    //     );
    // }, [searchQuery, resumes]);
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
        setOptionOpen(true)
    };
    const handleSelection = (type: string) => {
        setOptionOpen(false)
        if (type == "create") {
            setCreateOpen(true)
        } else if (type == "upload") {
            setIsOpen(true)
        }
    }
    // const handleUploadComplete = async () => {
    //     await refetch();
    // };


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
                        {/* <UserButton
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
                        /> */}
                    </div>
                </div>

                <QRList />

            </div>

        </div>
    );


};

export default Dashboard;