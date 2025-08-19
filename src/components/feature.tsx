'use client';
import React, { useState } from "react";
import { QrCode, Shield, BarChart3, RefreshCcw } from "lucide-react";

const Feature = () => {
    const [qrMode, setQrMode] = useState<'static' | 'dynamic'>('static')
    const features =
        qrMode === "static"
            ? [
                {
                    id: "01",
                    icon: <Shield className="h-8 w-8" />,
                    title: "Privacy First",
                    text: "Generated locally on your device — never uploaded.",
                },
                {
                    id: "02",
                    icon: <QrCode className="h-8 w-8" />,
                    title: "Multiple Formats",
                    text: "Export as PNG, JPG, or SVG with print-ready quality.",
                },
                {
                    id: "03",
                    icon: <RefreshCcw className="h-8 w-8" />,
                    title: "Always Free",
                    text: "No registration. No hidden costs. Just create.",
                },
                 {
                    id: "04",
                    icon: <RefreshCcw className="h-8 w-8" />,
                    title: "Pixel Perfect", text: "Sharp, scalable graphics ready for print or web." }
                
            ]
            : [
                {
                    id: "01",
                    icon: <RefreshCcw className="h-8 w-8" />,
                    title: "Real-Time Updates",
                    text: "Change destinations without reprinting codes.",
                },
                {
                    id: "02",
                    icon: <BarChart3 className="h-8 w-8" />,
                    title: "Analytics",
                    text: "Track scans, devices, and locations in detail.",
                },
                {
                    id: "03",
                    icon: <QrCode className="h-8 w-8" />,
                    title: "Campaign Ready",
                    text: "Organize & optimize with full campaign tools.",
                },
                {
                    id: "04",
                    icon: <QrCode className="h-8 w-8" />,
                    title: "Short Links", text: "Short links for quick sharing." 
                }
            ];

    return (
        <section className="relative bg-transparent text-gray-800 py-24 sm:py-32">
            <div className="max-w-6xl mx-auto px-6 text-center">

                {/* QR Mode Switcher */}
                <div className="flex justify-center mb-8 sm:mb-12">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 border border-gray-200/50 shadow-lg">
                        <div className="flex">
                            <button
                                onClick={() => setQrMode('static')}
                                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 ${qrMode === 'static'
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                Static QR
                            </button>
                            <button
                                onClick={() => setQrMode('dynamic')}
                                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 ${qrMode === 'dynamic'
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                Dynamic QR
                            </button>
                        </div>
                    </div>
                </div>
                <div className="text-center mb-8 sm:mb-12">
                    <div className="max-w-3xl mx-auto px-4">
                        {qrMode === 'static' ? (
                            <div className="bg-blue-50/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-200/50">
                                <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2">Static QR Codes</h3>
                                <p className="text-sm sm:text-base text-blue-700">
                                    Perfect for permanent content like URLs, contact info, or WiFi credentials.
                                    Once generated, the content cannot be changed, but they work forever.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-purple-50/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-200/50">
                                <h3 className="text-lg sm:text-xl font-semibold text-purple-900 mb-2">Dynamic QR Codes</h3>
                                <p className="text-sm sm:text-base text-purple-700">
                                    Ideal for campaigns and changing content. Update the destination URL anytime without reprinting.
                                    Includes analytics, tracking, and the ability to modify content after creation.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Features */}
                <div className="grid sm:grid-cols-2 gap-8 sm:gap-20">
                    {features.map((feature) => (
                        <div key={feature.id} className="group relative flex">


                            <span><svg viewBox="0 0 200 200" className="w-24 h-24">
                                <text
                                    x="50%"
                                    y="50%"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="120"
                                    fontWeight="700"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="3"
                                >
                                    {feature.id}
                                </text>
                                <defs>
                                    <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#f97316" />   {/* orange-500 */}
                                        <stop offset="50%" stopColor="#ec4899" />  {/* pink-500 */}
                                        <stop offset="100%" stopColor="#9333ea" /> {/* purple-600 */}
                                    </linearGradient>
                                </defs>
                            </svg></span>
                            <div>
                                <h4 className="mt-4 text-xl text-left font-semibold text-gray-900 group-hover:text-gradient-to-r group-hover:from-orange-500 group-hover:to-purple-600 transition-all">
                                    {feature.title}
                                </h4>
                                <p className=" text-left text-md text-gray-500 max-w-md">{feature.text}</p>
                                <div className="mt-4 h-px w-24 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                        </div>

                    ))}
                </div>
            </div>
        </section>
    );
};

export default Feature;
