export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this resource. Only administrators can access this page.
        </p>
        <a href="/" className="btn-primary">
          Go Back to Dashboard
        </a>
      </div>
    </div>
  )
}
