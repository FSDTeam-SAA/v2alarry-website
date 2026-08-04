"use client";

import {
  BookOpenCheck,
  LayoutDashboard,
  LogOut,
  Settings,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import { useProfile } from "../hooks/useProfile";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/users", label: "Users", icon: UsersRound },
  {
    href: "/dashboard/knowledge-base",
    label: "Knowledge Base",
    icon: BookOpenCheck,
  },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const profile = useProfile();
  const displayName = profile.data?.fullName ?? "Demo Name";
  const role = profile.data?.role ?? "Super Admin";
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <header className="fixed inset-x-0 top-0 z-20 flex h-24 items-center bg-[#f1f5f9] px-6 lg:pl-[284px] lg:pr-11">
        <h1 className="text-[22px] font-semibold tracking-tight text-[#023337]">
          {title}
        </h1>
        <Image
          className="ml-auto size-10 rounded-full object-cover"
          src="/images/jane-cooper-avatar.png"
          alt={displayName}
          width={40}
          height={40}
        />
      </header>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col bg-[#f1f5f9] px-6 py-4 lg:flex">
        <div className="flex h-16 items-center gap-2">
          <div className="grid size-[54px] place-items-center rounded-xl bg-[#f7b626] text-[34px] font-bold tracking-[-0.1em] text-black">
            LC
          </div>
          <div>
            <p className="text-xl font-semibold tracking-tight">LeaderCoach</p>
            <p className="text-[8px] text-[#6a717f]">
              by Sticky Leadership / V2A Solutions
            </p>
          </div>
        </div>
        <nav className="mt-12 space-y-5" aria-label="Dashboard navigation">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#023337] ${pathname === href ? "bg-[#f7b626] font-semibold text-black" : "hover:bg-[#e4eaf0]"}`}
            >
              <Icon size={22} aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="mb-6 flex items-center gap-2">
            <Image
              className="size-11 rounded-full object-cover"
              src="/images/jane-cooper-avatar.png"
              alt=""
              width={44}
              height={44}
            />
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm capitalize text-[#6a717f]">{role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-[#ff4d4f] text-[#ef4444] transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef4444]"
          >
            <LogOut size={20} aria-hidden />
            Log out
          </button>
        </div>
      </aside>
      <main className="pt-24 lg:pl-[260px]">{children}</main>
    </div>
  );
}
