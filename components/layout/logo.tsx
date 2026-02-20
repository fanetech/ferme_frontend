import Image from "next/image";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";

export default function Logo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Link href="/dashboard/default" className="flex items-center justify-center">
      {isCollapsed ? (
        <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
          <span className="text-primary-foreground font-bold text-lg">AP</span>
        </div>
      ) : (
        <Image
          src="/logo_v1.png"
          width={140}
          height={60}
          className="transition-all duration-300"
          alt="AvePay TPE logo"
          unoptimized
          priority
        />
      )}
    </Link>
  );
}
