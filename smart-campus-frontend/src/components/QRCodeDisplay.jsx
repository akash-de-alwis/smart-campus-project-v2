import { useState } from 'react'
import { QrCode, Download, CheckCircle } from 'lucide-react'

export default function QRCodeDisplay({ booking }) {
  const [showQR, setShowQR] = useState(false)

  if (!booking.qrCode || booking.status !== 'APPROVED') {
    return null
  }

  const downloadQRCode = () => {
    const link = document.createElement('a')
    link.href = booking.qrCode
    link.download = `booking-qr-${booking.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <CheckCircle className="text-green-600 mr-2" size={20} />
          <h3 className="text-lg font-semibold text-green-800">Check-in QR Code</h3>
        </div>
        <button
          onClick={() => setShowQR(!showQR)}
          className="text-green-600 hover:text-green-800 text-sm font-medium"
        >
          {showQR ? 'Hide' : 'Show'} QR Code
        </button>
      </div>

      {showQR && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg text-center">
            <img 
              src={booking.qrCode} 
              alt="Booking QR Code" 
              className="w-48 h-48 mx-auto border border-gray-200 rounded"
            />
            <p className="text-sm text-gray-600 mt-2">
              Booking ID: {booking.id}
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={downloadQRCode}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={16} className="mr-2" />
              Download QR Code
            </button>
          </div>

          <div className="text-sm text-green-700 bg-green-100 p-3 rounded">
            <p className="font-medium mb-1">How to use this QR code:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Show this QR code at the venue entrance</li>
              <li>Admin will scan it to verify your booking</li>
              <li>You can also download it for easy access</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
