import { DashboardLayout } from '../../components/layouts/DashboardLayout';

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 