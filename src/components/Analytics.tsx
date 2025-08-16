import { useState, useEffect } from 'react';

interface QRCodeData {
  id: string;
  name: string;
  shortCode: string;
  destinationUrl: string;
  description?: string;
  scanCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsProps {
  qrCodes: QRCodeData[];
}

interface AnalyticsData {
  totalQRCodes: number;
  totalScans: number;
  averageScans: number;
  topPerformers: QRCodeData[];
  recentlyCreated: QRCodeData[];
  zeroScans: number;
}

export default function Analytics({ qrCodes }: AnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    calculateAnalytics();
  }, [qrCodes, timeRange]);

  const calculateAnalytics = () => {
    if (!qrCodes || qrCodes.length === 0) {
      setAnalyticsData({
        totalQRCodes: 0,
        totalScans: 0,
        averageScans: 0,
        topPerformers: [],
        recentlyCreated: [],
        zeroScans: 0,
      });
      return;
    }

    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'all':
        cutoffDate.setFullYear(2000); // Far in the past
        break;
    }

    const filteredQRs = timeRange === 'all' ? qrCodes : 
      qrCodes.filter(qr => new Date(qr.createdAt) >= cutoffDate);

    const totalQRCodes = filteredQRs.length;
    const totalScans = filteredQRs.reduce((sum, qr) => sum + qr.scanCount, 0);
    const averageScans = totalQRCodes > 0 ? Math.round(totalScans / totalQRCodes * 100) / 100 : 0;
    
    const topPerformers = [...filteredQRs]
      .sort((a, b) => b.scanCount - a.scanCount)
      .slice(0, 5);

    const recentlyCreated = [...filteredQRs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const zeroScans = filteredQRs.filter(qr => qr.scanCount === 0).length;

    setAnalyticsData({
      totalQRCodes,
      totalScans,
      averageScans,
      topPerformers,
      recentlyCreated,
      zeroScans,
    });
  };

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case 'all': return 'All Time';
      default: return 'Last 30 Days';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Total QR Codes</p>
              <p className="text-2xl font-bold text-blue-900">{analyticsData.totalQRCodes}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Total Scans</p>
              <p className="text-2xl font-bold text-green-900">{analyticsData.totalScans.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600">Average Scans</p>
              <p className="text-2xl font-bold text-purple-900">{analyticsData.averageScans}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-red-600">Zero Scans</p>
              <p className="text-2xl font-bold text-red-900">{analyticsData.zeroScans}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing QR Codes ({getTimeRangeLabel()})
          </h3>
          <div className="space-y-3">
            {analyticsData.topPerformers.length === 0 ? (
              <p className="text-gray-500 text-sm">No QR codes found for this time period.</p>
            ) : (
              analyticsData.topPerformers.map((qr, index) => (
                <div key={qr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{qr.name}</p>
                      <p className="text-xs text-gray-500 truncate">{qr.destinationUrl}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{qr.scanCount}</p>
                    <p className="text-xs text-gray-500">scans</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Created */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recently Created ({getTimeRangeLabel()})
          </h3>
          <div className="space-y-3">
            {analyticsData.recentlyCreated.length === 0 ? (
              <p className="text-gray-500 text-sm">No QR codes created in this time period.</p>
            ) : (
              analyticsData.recentlyCreated.map((qr) => (
                <div key={qr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{qr.name}</p>
                    <p className="text-xs text-gray-500 truncate">{qr.destinationUrl}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{qr.scanCount} scans</p>
                    <p className="text-xs text-gray-500">
                      {new Date(qr.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-2">Insights</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {analyticsData.totalQRCodes === 0 ? (
            <p>• Get started by creating your first QR code!</p>
          ) : (
            <>
              <p>• You have {analyticsData.totalQRCodes} QR codes with a total of {analyticsData.totalScans.toLocaleString()} scans</p>
              {analyticsData.averageScans > 0 && (
                <p>• Average of {analyticsData.averageScans} scans per QR code</p>
              )}
              {analyticsData.zeroScans > 0 && (
                <p>• {analyticsData.zeroScans} QR codes haven't been scanned yet - consider promoting them more</p>
              )}
              {analyticsData.topPerformers.length > 0 && (
                <p>• Top performer: "{analyticsData.topPerformers[0].name}" with {analyticsData.topPerformers[0].scanCount} scans</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}