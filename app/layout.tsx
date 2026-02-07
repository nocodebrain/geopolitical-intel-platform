import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Geopolitical Intelligence Platform",
  description: "Strategic intelligence for construction and logistics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          {/* Clean Navbar */}
          <nav className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-xl">🌍</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-100">
                      GeoIntel Executive
                    </div>
                    <div className="text-xs text-slate-500">Intelligence Platform</div>
                  </div>
                </Link>
                
                <div className="flex items-center gap-1">
                  <Link 
                    href="/" 
                    className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/events" 
                    className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    Events
                  </Link>
                  <Link 
                    href="/connections" 
                    className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    Connections
                  </Link>
                  <Link 
                    href="/regions" 
                    className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    Regions
                  </Link>
                  <Link 
                    href="/insights" 
                    className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    Insights
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          
          <main className="container mx-auto px-6 py-8">
            {children}
          </main>
          
          <footer className="border-t border-slate-800 mt-16 py-6 bg-slate-900">
            <div className="container mx-auto px-6 text-sm text-slate-400">
              <p className="font-semibold text-slate-300">Geopolitical Intelligence Platform</p>
              <p className="mt-1 text-xs">Data: Reuters, Bloomberg, FT, CNBC, The Economist, Defense News, Lloyd's List</p>
              <p className="mt-1 text-xs text-slate-500">Auto-refreshed hourly</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
