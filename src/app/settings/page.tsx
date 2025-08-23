'use client'
import { useAuth, UserButton } from '@clerk/nextjs';
import { ChevronRight, CreditCard, FileText, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Head from 'next/head';
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { useBillings } from '@/hooks/useBillings';
import { useUser } from '@/hooks/useUser';


type Invoices = {
    id: string
    amount: number
    currency: string
    status: string
    paymentDate: string
    checkoutUrl?: string
}
const Settings = () => {
    const [activeTab, setActiveTab] = useState('subscription');
    const { user, fetchUser } = useUser()
    const { invoices, invoicesLoading } = useBillings()
    const router = useRouter()
    const { userId } = useAuth()
    const [cancelling, setCancelling] = useState(false)
    const tabs = [
        { id: 'subscription', name: 'Subscription', icon: <CreditCard className="w-5 h-5" /> },
        { id: 'billing', name: 'Billing', icon: <FileText className="w-5 h-5" /> },
    ];
    useEffect(() => {
        console.log("userId", userId);
        if(!userId) return;
        (async () => {
            const res = await fetch(`/api/access-check?userId=${userId}`);
            const allowed = await res.json();
            if (!allowed.allowed) {
                // toast.error("You need to upgrade your plan to access this feature.");
                router.push("/pricing");
            }else{
                await fetchUser()
            }
        })();
    }, [userId]);
    
    async function cancleSubscribe() {
        setCancelling(true)
        const response = await fetch('/api/cancelSubscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subscriptionId: user?.subscriptionId,
            }),
        });
        if (response.ok) {
            await fetchUser()
        }
        setCancelling(false)
    }
    return (
        <>
            <Head>
                <title>Account Settings</title>
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className='flex items-center justify-between mb-8' >
                            <div className='flex items-center cursor-pointer' onClick={(e:any) => {e.stopPropagation(); router.push("/dashboard")}}>
                                <img src="/logo.svg" alt="Logo" width={40} height={40} />
                                <h1 className="text-xl sm:text-2xl font-bold bg-gray-900 bg-clip-text text-transparent ml-2">
                                    <span className='font-[kantithin]'>Quick</span><span className='font-[doto]'>Tag</span>
                                </h1>
                            </div>
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
                        <header>
                            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                            <p className="mt-2 text-sm text-zinc-400">Manage your account preferences and subscription details</p>
                        </header>

                        <div className="mt-8 flex flex-col md:flex-row gap-8">
                            {/* Sidebar Navigation */}
                            <nav className="w-full md:w-64 flex-shrink-0">
                                <div className="bg-white rounded-lg shadow">
                                    <ul className="divide-y divide-zinc-600">
                                        {tabs.map((tab) => (
                                            <li key={tab.id}>
                                                <button
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`flex items-center w-full px-4 py-3 text-left ${activeTab === tab.id
                                                        ? 'bg-gray-900 text-white font-medium'
                                                        : 'text-gray-900 hover:bg-zinc-100 bg-white'
                                                        }`}
                                                >
                                                    <span className={`mr-3 ${activeTab === tab.id ? 'text-white' : 'text-gray-900'}`}>
                                                        {tab.icon}
                                                    </span>
                                                    <span>{tab.name}</span>
                                                    {activeTab === tab.id && <ChevronRight className="ml-auto h-5 w-5 text-white" />}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>


                            </nav>

                            {/* Main Content */}
                            <main className="flex-1 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow">
                                {/* Subscription Tab */}
                                {activeTab === 'subscription' && (
                                    <div className="p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Plan</h2>

                                        <div className="bg-gray-100 rounded-lg p-4 ">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
                                                        {(user?.status == "active") ? 'Dynamic ' : 'Free '}Plan
                                                    </span>
                                                    {(user?.status == "active") && <p className="mt-2 text-gray-800">$5/month</p>}
                                                    {(user?.status == "active") && <p className="text-sm text-gray-400">{user?.currentPeriodEnd && user?.cancel_at_period_end ? 'Expires' : 'Renews'} on {new Date(user?.currentPeriodEnd!).toDateString()}</p>}
                                                </div>


                                            </div>
                                        </div>


                                        {(user?.status == "active" && !user?.cancel_at_period_end) && <div className="mt-4 pt-4 ">
                                            <button className="text-sm text-zinc-100 bg-red-600 p-2 rounded-md hover:text-zinc-200 font-medium disabled:bg-gray-500" onClick={cancleSubscribe} disabled={cancelling}>
                                                {cancelling ? 'Cancelling' : 'Cancel Subscription'}
                                            </button>
                                        </div>}
                                    </div>
                                )}

                                {/* Billing Tab */}


                                {activeTab === 'billing' && (
                                    <Card className="shadow-md border-none">
                                        <CardHeader>
                                            <h2 className="text-lg font-semibold">Transactions</h2>
                                        </CardHeader>
                                        <CardContent>
                                            {invoicesLoading ? (
                                                <div className="flex items-center justify-center py-10">
                                                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                                                </div>
                                            ) : invoices.length === 0 ? (
                                                <p className="text-sm text-gray-500">No invoices found.</p>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>ID</TableHead>
                                                            <TableHead>Amount</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead>Date</TableHead>
                                                            <TableHead>Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {invoices.map((inv: Invoices) => (
                                                            <TableRow key={inv.id}>
                                                                <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                                                                <TableCell>
                                                                    {(inv.amount / 100).toFixed(2)} $
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span
                                                                        className={`px-2 py-1 rounded-full text-xs ${inv.status === "paid"
                                                                            ? "bg-green-100 text-green-700"
                                                                            : inv.status === "pending"
                                                                                ? "bg-yellow-100 text-yellow-700"
                                                                                : "bg-red-100 text-red-700"
                                                                            }`}
                                                                    >
                                                                        {inv.status}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {new Date(inv.paymentDate).toLocaleDateString()}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {inv.checkoutUrl ? (
                                                                        <a
                                                                            href={inv.checkoutUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 hover:underline text-sm"
                                                                        >
                                                                            View
                                                                        </a>
                                                                    ) : (
                                                                        "-"
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Account Tab */}
                                {activeTab === 'account' && (
                                    <div className="p-6">
                                        <h2 className="text-xl font-semibold text-zinc-300 mb-4">Account Information</h2>

                                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            <div className="sm:col-span-3">
                                                <label htmlFor="first-name" className="block text-sm font-medium text-zinc-400">
                                                    First name
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        name="first-name"
                                                        id="first-name"
                                                        defaultValue="John"
                                                        className="shadow-sm p-2 focus:ring-orange-500 bg-zinc-900 focus:border-orange-500 block w-full sm:text-sm border-zinc-300 rounded-md"
                                                    />
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label htmlFor="last-name" className="block text-sm font-medium text-zinc-400">
                                                    Last name
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        name="last-name"
                                                        id="last-name"
                                                        defaultValue="Doe"
                                                        className="shadow-sm p-2 focus:ring-orange-500 bg-zinc-900 focus:border-orange-500 block w-full sm:text-sm border-zinc-300 rounded-md"
                                                    />
                                                </div>
                                            </div>

                                            <div className="sm:col-span-6">
                                                <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
                                                    Email address
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        defaultValue="john.doe@example.com"
                                                        className="shadow-sm p-2 focus:ring-orange-500 bg-zinc-900 focus:border-orange-500 block w-full sm:text-sm border-zinc-300 rounded-md"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 border-t border-zinc-200 pt-6">
                                            <h3 className="text-lg font-medium text-zinc-300">Delete Account</h3>
                                            <p className="mt-1 text-sm text-zinc-400">
                                                Once you delete your account, you will lose all data associated with it.
                                            </p>
                                            <div className="mt-4">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center px-4 py-2  shadow-sm text-sm font-medium rounded-md text-zinc-200 bg-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <Trash2 className="-ml-1 mr-2 h-5 w-5 text-zinc-200" aria-hidden="true" />
                                                    Delete Account
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <button
                                                type="button"
                                                className="bg-white py-2 px-4 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}

export default Settings