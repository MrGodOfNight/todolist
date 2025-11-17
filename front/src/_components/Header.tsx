import { Settings } from "lucide-react";
import Link from "next/link";


export default function Header() {
  return (
    <header className="bg-blue-600 dark:bg-gray-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <Link 
            href="/" 
            className="text-xl font-bold hover:text-blue-100 transition-colors"
            >
            ToDo
          </Link>
        </div>
        
        <nav>
          <Link 
            href="/settings"
            className="text-xl font-bold hover:text-blue-100 transition-colors"
            >
            <Settings  />
          </Link>
        </nav>
      </div>
    </header>
  )
}