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
          <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold">🌍</span>
                  </div>
                  <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    GeoIntel Platform
                  </span>
                </Link>
                
                <div className="flex items-center space-x-6">
                  <Link 
                    href="/" 
                    className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/events" 
                    className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    Events
                  </Link>
                  <Link 
                    href="/connections" 
                    className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    Connections
                  </Link>
                  <Link 
                    href="/regions" 
                    className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    Regions
                  </Link>
                  <Link 
                    href="/insights" 
                    className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    Insights
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
          
          <footer className="border-t border-slate-800 mt-12 py-6">
            <div className="container mx-auto px-4 text-center text-sm text-slate-500">
              <p>Geopolitical Intelligence Platform • Built for strategic decision-making</p>
              <p className="mt-1 text-xs">Data sources: Reuters, BBC, Al Jazeera, NewsAPI, ACLED</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
