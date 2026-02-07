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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
          {/* Premium Glassmorphism Navbar */}
          <nav className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-2xl shadow-black/20">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                    <span className="text-xl font-bold">🌍</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      GeoIntel Executive
                    </span>
                    <div className="text-xs text-slate-500">Strategic Intelligence Platform</div>
                  </div>
                </Link>
                
                <div className="flex items-center space-x-2">
                  <Link 
                    href="/" 
                    className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/events" 
                    className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  >
                    Events
                  </Link>
                  <Link 
                    href="/connections" 
                    className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  >
                    Connections
                  </Link>
                  <Link 
                    href="/regions" 
                    className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  >
                    Regions
                  </Link>
                  <Link 
                    href="/insights" 
                    className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  >
                    Insights
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          
          <footer className="border-t border-slate-800/50 mt-12 py-8 bg-slate-900/50 backdrop-blur">
            <div className="container mx-auto px-4 text-center text-sm text-slate-500">
              <p className="font-medium text-slate-400">Geopolitical Intelligence Platform • Executive Grade</p>
              <p className="mt-2 text-xs">Premium data sources: Reuters, Bloomberg, FT, CNBC, The Economist, Defense News, Lloyd's List + 10 more</p>
              <p className="mt-1 text-xs text-slate-600">Built for strategic decision-making • Auto-refreshed every hour</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
