import AdminGuard from '@/components/AdminGuard'
import AdminDashboard from '@/components/AdminDashboard'
import './admin.css'

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  )
}