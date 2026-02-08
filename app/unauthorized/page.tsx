import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Access Denied
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            You don't have permission to access this page.
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            This area is restricted to administrators only. If you believe this is an error, please contact your system administrator.
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Homepage
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Need admin access? Contact: admin@atlasgentleman.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
