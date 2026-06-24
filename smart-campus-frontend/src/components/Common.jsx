export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  )
}

export function ErrorAlert({ message }) {
  return (
    <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
      {message}
    </div>
  )
}

export function SuccessAlert({ message }) {
  return (
    <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl">
      {message}
    </div>
  )
}

export function Badge({ children, variant = 'primary' }) {
  const variants = {
    primary: 'bg-orange-100 text-orange-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
