import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

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

interface QRCodeListProps {
  qrCodes: QRCodeData[];
  onRefresh: () => void;
  onEdit: (qr: QRCodeData) => void;
  onDelete: (id: string) => void;
}

export default function QRCodeList({ qrCodes, onRefresh, onEdit, onDelete }: QRCodeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'scanCount' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filteredQRs, setFilteredQRs] = useState<QRCodeData[]>(qrCodes);

  useEffect(() => {
    let filtered = qrCodes.filter(qr =>
      qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.destinationUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (qr.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'scanCount':
          comparison = a.scanCount - b.scanCount;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredQRs(filtered);
  }, [qrCodes, searchTerm, sortBy, sortOrder]);

  const copyShortUrl = async (shortCode: string) => {
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/r/${shortCode}`;
    
    try {
      await navigator.clipboard.writeText(shortUrl);
      alert('Short URL copied to clipboard!');
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = shortUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Short URL copied to clipboard!');
    }
  };

  const downloadQR = (qr: QRCodeData) => {
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/r/${qr.shortCode}`;
    
    // Create a temporary SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '512');
    svg.setAttribute('height', '512');
    svg.innerHTML = `<rect width="100%" height="100%" fill="white"/>`;
    
    // Use QR code library to generate path
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;
    
    // This is a simplified version - in a real app, you'd use the QR library directly
    const qrElement = document.createElement('div');
    qrElement.innerHTML = `<div id="temp-qr"></div>`;
    document.body.appendChild(qrElement);
    
    // Clean up and download would happen here
    document.body.removeChild(qrElement);
  };

  const handleDelete = async (qr: QRCodeData) => {
    if (!confirm(`Are you sure you want to delete "${qr.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/qr/${qr.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete QR code');
      }

      onDelete(qr.id);
    } catch (error) {
      alert(`Error deleting QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">QR Code Management</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search QR codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'scanCount' | 'createdAt')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Sort by Created Date</option>
            <option value="name">Sort by Name</option>
            <option value="scanCount">Sort by Scans</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            title={`Currently: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* QR Codes Grid */}
      {filteredQRs.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No QR codes found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first QR code to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQRs.map((qr) => (
            <div key={qr.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{qr.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{qr.destinationUrl}</p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <QRCode
                    value={`${process.env.NEXT_PUBLIC_BASE_URL}/r/${qr.shortCode}`}
                    size={60}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
              </div>

              {qr.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{qr.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Scans: {qr.scanCount}</span>
                <span>Created: {new Date(qr.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded truncate block">
                    /r/{qr.shortCode}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onEdit(qr)}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => copyShortUrl(qr.shortCode)}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => handleDelete(qr)}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500 text-center">
        Showing {filteredQRs.length} of {qrCodes.length} QR codes
      </div>
    </div>
  );
}