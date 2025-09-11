import { DashboardLayout } from "@/components/layout/dashboard-layout"

export const metadata = {
  title: "Dashboard - Donny Hub",
  description: "AI Agent management dashboard",
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}