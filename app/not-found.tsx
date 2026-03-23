import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full mb-6 relative">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h2 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">404</h2>
      <h3 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Page Not Found</h3>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <Link 
        href="/"
        className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
      >
        <Home className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>
    </div>
  )
}
