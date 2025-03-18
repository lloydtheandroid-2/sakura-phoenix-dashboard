// File: platform/dashboard/src/pages/Dashboard.tsx
import React from 'react';
import { Heading, Subheading } from '../../components/ui/heading';
import { Select } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Avatar } from '../../components/ui/avatar';

// Create a Stat component similar to the example
const Stat = ({ title, value, change }: { title: string; value: string; change: string }) => {
  return (
    <div>
      <div className="border-t border-zinc-200 dark:border-zinc-700"></div>
      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{title}</div>
      <div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{value}</div>
      <div className="mt-3 text-sm/6 sm:text-xs/6">
        <Badge color={change.startsWith('+') ? 'lime' : 'pink'}>{change}</Badge>{' '}
        <span className="text-zinc-500 dark:text-zinc-400">from last month</span>
      </div>
    </div>
  );
};

// Mock data for applications
const mockApplications = [
  { 
    id: 1, 
    name: 'Keycloak SSO', 
    status: 'Running', 
    deployedAt: 'March 15, 2025', 
    version: '22.0.1',
    healthStatus: 'Healthy'
  },
  { 
    id: 2, 
    name: 'NiFi', 
    status: 'Running', 
    deployedAt: 'March 10, 2025', 
    version: '1.20.0',
    healthStatus: 'Healthy'
  },
  { 
    id: 3, 
    name: 'TAK Server', 
    status: 'Running', 
    deployedAt: 'March 5, 2025', 
    version: '4.8.0',
    healthStatus: 'Warning'
  },
  { 
    id: 4, 
    name: 'PostgreSQL', 
    status: 'Running', 
    deployedAt: 'February 20, 2025', 
    version: '15.2',
    healthStatus: 'Healthy'
  },
  { 
    id: 5, 
    name: 'ElasticSearch', 
    status: 'Pending', 
    deployedAt: 'March 16, 2025', 
    version: '8.7.1',
    healthStatus: 'Pending'
  }
];

export default function Dashboard() {
  return (
    <>
      <Heading>Welcome to Sakura Phoenix</Heading>
      <div className="mt-8 flex items-end justify-between">
        <Subheading>System Overview</Subheading>
        <div>
          <Select name="period">
            <option value="last_day">Last 24 hours</option>
            <option value="last_week">Last week</option>
            <option value="last_month">Last month</option>
            <option value="last_quarter">Last quarter</option>
          </Select>
        </div>
      </div>
      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Active Applications" value="5" change="+1" />
        <Stat title="System Uptime" value="99.9%" change="+0.1%" />
        <Stat title="Resource Usage" value="68%" change="+2.5%" />
        <Stat title="API Requests" value="15,432" change="+12.7%" />
      </div>
      
      <Subheading className="mt-14">Deployed Applications</Subheading>
      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeader>Application</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Last Deployed</TableHeader>
            <TableHeader>Version</TableHeader>
            <TableHeader>Health</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockApplications.map((app) => (
            <TableRow key={app.id} href={`/applications/${app.id}`} title={`View ${app.name} details`}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar initials={app.name.substring(0, 2)} className="size-6 bg-indigo-600 text-white" />
                  <span>{app.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge color={app.status === 'Running' ? 'lime' : app.status === 'Pending' ? 'amber' : 'red'}>
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell className="text-zinc-500 dark:text-zinc-400">{app.deployedAt}</TableCell>
              <TableCell>{app.version}</TableCell>
              <TableCell>
                <Badge color={
                  app.healthStatus === 'Healthy' 
                    ? 'lime' 
                    : app.healthStatus === 'Warning' 
                      ? 'amber' 
                      : app.healthStatus === 'Pending' 
                        ? 'blue' 
                        : 'red'
                }>
                  {app.healthStatus}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="text-lg font-medium">Recent Deployments</h3>
          <ul className="mt-4 space-y-4">
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge color="lime" className="h-2 w-2 rounded-full p-0"></Badge>
                <span>TAK Server v4.8.0</span>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Today, 9:15 AM</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge color="lime" className="h-2 w-2 rounded-full p-0"></Badge>
                <span>NiFi v1.20.0</span>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">March 10, 2025</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge color="amber" className="h-2 w-2 rounded-full p-0"></Badge>
                <span>Keycloak SSO v22.0.1</span>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">March 15, 2025</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge color="lime" className="h-2 w-2 rounded-full p-0"></Badge>
                <span>PostgreSQL v15.2</span>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">February 20, 2025</span>
            </li>
          </ul>
        </div>
        
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="text-lg font-medium">System Alerts</h3>
          <ul className="mt-4 space-y-4">
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge color="amber" className="h-2 w-2 rounded-full p-0"></Badge>
                <span>TAK Server CPU usage above 75%</span>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">10 minutes ago</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge color="lime" className="h-2 w-2 rounded-full p-0"></Badge>
                <span>ElasticSearch deployment initiated</span>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">1 hour ago</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge color="red" className="h-2 w-2 rounded-full p-0"></Badge>
                <span>Storage usage reaching threshold (85%)</span>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">2 hours ago</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge color="lime" className="h-2 w-2 rounded-full p-0"></Badge>
                <span>Automatic backup completed</span>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">6 hours ago</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}