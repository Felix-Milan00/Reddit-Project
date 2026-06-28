import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="min-h-screen bg-[#dae0e6] dark:bg-[#030303]">
      <Navbar />
      <div className="flex justify-center max-w-[1600px] mx-auto w-full">
        <Sidebar />
        <main className="flex-1 max-w-[960px] w-full mx-auto md:px-6 py-4 md:py-6 flex justify-center">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
