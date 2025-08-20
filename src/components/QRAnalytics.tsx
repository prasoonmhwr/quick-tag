'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Calendar, Smartphone, Globe, TrendingUp } from 'lucide-react'

interface AnalyticsData {
  totalScans: number
  recentScans: number
  scansByDate: Record<string, number>
  deviceStats: Array<{ name: string; value: number }>
  browserStats: Array<{ name: string; value: number }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export function QRAnalytics({ qrId }: { qrId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/qr/${qrId}/analytics`)
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [qrId])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading analytics...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load analytics data.</p>
      </div>
    )
  }

  // Prepare chart data
  const chartData = Object.entries(analytics.scansByDate)
    .map(([date, scans]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      scans
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14) // Last 14 days

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{analytics.totalScans}</div>
          <div className="text-sm text-blue-700">Total Scans</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{analytics.recentScans}</div>
          <div className="text-sm text-green-700">Last 30 Days</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Smartphone className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {analytics.deviceStats.find(d => d.name === 'Mobile')?.value || 0}
          </div>
          <div className="text-sm text-purple-700">Mobile Scans</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Globe className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {analytics.deviceStats.find(d => d.name === 'Desktop')?.value || 0}
          </div>
          <div className="text-sm text-orange-700">Desktop Scans</div>
        </div>
      </div>

      {/* Scans Over Time Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Scans Over Time</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="scans" stroke="#8884d8" />
              
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device and Browser Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Device Stats */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h4>
          {analytics.deviceStats.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.deviceStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.deviceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No device data available</p>
          )}
        </div>

        {/* Browser Stats */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Browsers</h4>
          {analytics.browserStats.length > 0 ? (
            <div className="space-y-3">
              {analytics.browserStats.map((browser, index) => (
                <div key={browser.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{browser.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{browser.value} scans</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No browser data available</p>
          )}
        </div>
      </div>
    </div>
  )
}