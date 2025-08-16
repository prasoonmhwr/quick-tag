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

interface QRCodeEditorProps {
  qrId: string;
  onUpdate: (updatedQR: QRCodeData) => void;
  onClose: () => void;
}

export default function QRCodeEditor({ qrId, onUpdate, onClose }: QRCodeEditorProps) {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    destinationUrl: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    fetchQRData();
  }, [qrId]);

  const fetchQRData = async () => {
    try {
      setIsLoadingData(true);
      const response = await fetch(`/api/qr/${qrId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch QR code data');
      }
      
      const data = await response.json();
      setQrData(data);
      setFormData({
        name: data.name,
        destinationUrl: data.destinationUrl,
        description: data.description || ''
      });
    } catch (error) {
      setErrors({ fetch: error instanceof Error ? error.message : 'Failed to fetch QR data' });
    } finally {
      setIsLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'QR code name is required';
    }

    if (!formData.destinationUrl.trim()) {
      newErrors.destinationUrl = 'Destination URL is required';
    } else {
      try {
        new URL(formData.destinationUrl);
      } catch {
        newErrors.destinationUrl = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const response = await fetch(`/api/qr/${qrId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update QR code');
      }

      onUpdate(data);
      onClose();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update QR code' });
    } finally {
      setLoading(false);
    }
  };

  const copyShortUrl = async () => {
    if (!qrData) return;
    
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/r/${qrData.shortCode}`;
    
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

  if (isLoadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading QR code data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (errors.fetch || !qrData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading QR Code</h3>
            <p className="text-gray-600 mb-4">{errors.fetch || 'Failed to load QR code data'}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/r/${qrData.shortCode}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Current QR Code</h3>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <QRCode
                  value={shortUrl}
                  size={150}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
                <div className="mt-3 text-sm text-gray-600">
                  <p className="font-mono break-all">{shortUrl}</p>
                  <button
                    onClick={copyShortUrl}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-xs"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">QR Code Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Total Scans:</span>
                  <p className="text-gray-900 text-xl font-bold">{qrData.scanCount}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p className="text-gray-900">{new Date(qrData.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Updated:</span>
                  <p className="text-gray-900">{new Date(qrData.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Short Code:</span>
                  <p className="text-gray-900 font-mono">{qrData.shortCode}</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Name *
              </label>
              <input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="edit-url" className="block text-sm font-medium text-gray-700 mb-2">
                Destination URL *
              </label>
              <input
                id="edit-url"
                type="url"
                value={formData.destinationUrl}
                onChange={(e) => setFormData({...formData, destinationUrl: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.destinationUrl ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.destinationUrl && <p className="mt-1 text-sm text-red-600">{errors.destinationUrl}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Note: Changing this URL will redirect all future scans to the new destination. The QR code image remains the same.
              </p>
            </div>

            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="edit-description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update QR Code'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}