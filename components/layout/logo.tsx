import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";

export default function Logo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Link href="/dashboard/default" className="flex items-center justify-center">
      {isCollapsed ? (
        <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-lg">
          <span className="text-white text-lg">🌾</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 transition-all duration-300">
          <div className="flex items-center justify-center w-9 h-9 bg-green-600 rounded-lg">
            <span className="text-white text-lg">🌾</span>
          </div>
          <span className="font-bold text-lg text-green-800 dark:text-green-400">Farm Management</span>
        </div>
      )}
    </Link>
  );
}
