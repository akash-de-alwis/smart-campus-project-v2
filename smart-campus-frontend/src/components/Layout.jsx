import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  if (isLoginPage) {
    return <Outlet />
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
