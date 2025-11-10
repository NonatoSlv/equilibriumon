import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="h-[calc(100vh-64px)]">
        <Sidebar />
        <div className="lg:pl-64 h-full flex flex-col">
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="container py-8 max-w-7xl">
              <div className="fade-in">
                {children}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}