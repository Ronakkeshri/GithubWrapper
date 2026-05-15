import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 space-y-6 flex flex-col items-center max-w-lg">
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-blue-500">
          404
        </h1>
        
        <h2 className="text-3xl font-bold text-white">
          Lost in the Open Source Space
        </h2>
        
        <p className="text-gray-400 text-lg">
          The page or user you are looking for doesn't exist, has been deleted, or is private.
        </p>

        <Link 
          href="/"
          className="mt-8 flex items-center justify-center gap-2 py-4 px-8 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-transform hover:scale-105"
        >
          <Search className="w-5 h-5" />
          Find another user
        </Link>
      </div>
    </div>
  );
}
