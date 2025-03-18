'use client';

// File: platform/dashboard/src/pages/ApplicationDetail.tsx
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Heading, Subheading } from '../../../components/ui/heading';
import { Badge } from '../../../components/ui/badge';
import { Text } from '../../../components/ui/text';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '../../../components/ui/dialog';
import { Divider } from '../../../components/ui/divider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Define types for the application data
interface Port {
  port: number;
  targetPort: number;
  protocol: string;
  service: string;
}

interface ConfigFile {
  name: string;
  path: string;
  size: string;
  modified: string;
}

interface Event {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

interface Application {
  id: string;
  name: string;
  description: string;
  version: string;
  status: string;
  deployedAt: string;
  imageUrl: string;
  type: string;
  url: string;
  cpu: string;
  memory: string;
  storage: string;
  podCount: number;
  ports: Port[];
  cpuUsage: number;
  memoryUsage: number;
  uptime: string;
  lastRestart: string;
  healthStatus: string;
  events: Event[];
  configFiles: ConfigFile[];
}

// Mock applications data - in a real app, you would fetch this data from your API
const mockApplications: Application[] = [
  { 
    id: 'keycloak',
    name: 'Keycloak SSO', 
    description: 'Open Source Identity and Access Management',
    version: '22.0.1',
    status: 'Running', 
    deployedAt: 'March 15, 2025',
    imageUrl: '/apps/keycloak.svg',
    type: 'Authentication',
    url: 'https://keycloak.sakura-phoenix.com',
    cpu: '2',
    memory: '4Gi',
    storage: '10Gi',
    podCount: 3,
    ports: [
      { port: 8080, targetPort: 8080, protocol: 'TCP', service: 'HTTP' },
      { port: 8443, targetPort: 8443, protocol: 'TCP', service: 'HTTPS' }
    ],
    cpuUsage: 45, // percentage
    memoryUsage: 65, // percentage
    uptime: '30d 4h 15m',
    lastRestart: 'February 14, 2025',
    healthStatus: 'Healthy',
    events: [
      { id: 1, type: 'info', message: 'Application scaled up to 3 replicas', timestamp: 'March 14, 2025 10:32 AM' },
      { id: 2, type: 'info', message: 'Configuration updated', timestamp: 'March 10, 2025 2:15 PM' },
      { id: 3, type: 'warning', message: 'High memory usage detected (85%)', timestamp: 'March 8, 2025 7:22 PM' },
      { id: 4, type: 'info', message: 'Application updated to version 22.0.1', timestamp: 'March 5, 2025 9:00 AM' },
      { id: 5, type: 'error', message: 'Pod keycloak-2 crashed - OOMKilled', timestamp: 'March 2, 2025 3:45 AM' }
    ],
    configFiles: [
      { name: 'keycloak.conf', path: '/opt/keycloak/conf/keycloak.conf', size: '12 KB', modified: 'March 15, 2025' },
      { name: 'standalone.xml', path: '/opt/keycloak/standalone/configuration/standalone.xml', size: '156 KB', modified: 'March 15, 2025' },
      { name: 'environment', path: '/opt/keycloak/env', size: '2 KB', modified: 'March 15, 2025' }
    ]
  },
  // Add other applications similar to the one above
];

export default function ApplicationDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch the application data from your API
    if (id) {
      setIsLoading(true);
      // Simulate API request
      setTimeout(() => {
        const app = mockApplications.find(app => app.id === id);
        setApplication(app || null);
        setIsLoading(false);
      }, 500);
    }
  }, [id]);

  const handleDeleteApplication = () => {
    // Here you would integrate with the backend API to delete the application
    console.log('Deleting application:', id);
    setIsDeleteDialogOpen(false);
    router.push('/applications');
  };

  const handleRestartApplication = () => {
    // Here you would integrate with the backend API to restart the application
    console.log('Restarting application:', id);
    setIsRestartDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-500" />
        <Heading>Application Not Found</Heading>
        <Text className="mt-4">The application you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</Text>
        <Button className="mt-6" onClick={() => router.push('/applications')}>
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Applications
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button outline onClick={() => router.push('/applications')} className="mr-4">
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <Heading>{application.name}</Heading>
            <div className="flex items-center mt-1">
              <Badge color={application.status === 'Running' ? 'green' : application.status === 'Pending' ? 'yellow' : 'red'}>
                {application.status}
              </Badge>
              <Text className="ml-4 text-zinc-500 dark:text-zinc-400">
                Version {application.version}
              </Text>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button outline onClick={() => setIsRestartDialogOpen(true)}>
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Restart
          </Button>
          <Button outline onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600 border-red-200 hover:bg-red-50">
            <TrashIcon className="w-5 h-5 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Divider className="my-6" />

      {/* Application overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">CPU Usage</div>
          <div className="mt-2 flex items-end">
            <div className="text-2xl font-semibold">{application.cpuUsage}%</div>
            <div className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">of {application.cpu} cores</div>
          </div>
          <div className="mt-2 w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-2">
            <div 
              className={`${
                application.cpuUsage > 80 ? 'bg-red-500' : application.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              } h-2 rounded-full`} 
              style={{ width: `${application.cpuUsage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Memory Usage</div>
          <div className="mt-2 flex items-end">
            <div className="text-2xl font-semibold">{application.memoryUsage}%</div>
            <div className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">of {application.memory}</div>
          </div>
          <div className="mt-2 w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-2">
            <div 
              className={`${
                application.memoryUsage > 80 ? 'bg-red-500' : application.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              } h-2 rounded-full`} 
              style={{ width: `${application.memoryUsage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Uptime</div>
          <div className="mt-2 flex items-end">
            <div className="text-2xl font-semibold">{application.uptime}</div>
          </div>
          <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Last restart: {application.lastRestart}
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Health Status</div>
          <div className="mt-2 flex items-center">
            <div className={`w-3 h-3 rounded-full ${
              application.healthStatus === 'Healthy' 
                ? 'bg-green-500' 
                : application.healthStatus === 'Warning' 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`}></div>
            <div className="text-2xl font-semibold ml-2">{application.healthStatus}</div>
          </div>
          <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {application.podCount} active pods
          </div>
        </div>
      </div>

      {/* Application detail tabs */}
      <Tabs defaultValue="overview" className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">
            <InformationCircleIcon className="w-5 h-5 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="monitor">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="config">
            <Cog6ToothIcon className="w-5 h-5 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="logs">
            <CommandLineIcon className="w-5 h-5 mr-2" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="events">
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
                <Subheading>Application Information</Subheading>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Type</div>
                    <div className="mt-1">{application.type}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Version</div>
                    <div className="mt-1">{application.version}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Deployed At</div>
                    <div className="mt-1">{application.deployedAt}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">URL</div>
                    <div className="mt-1">
                      <a 
                        href={application.url.startsWith('http') ? application.url : `https://${application.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        {application.url}
                      </a>
                    </div>
                  </div>
                </div>

                <Divider className="my-6" />
                
                <Subheading>Resource Allocation</Subheading>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">CPU</div>
                    <div className="mt-1">{application.cpu} cores</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Memory</div>
                    <div className="mt-1">{application.memory}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Storage</div>
                    <div className="mt-1">{application.storage}</div>
                  </div>
                </div>

                <Divider className="my-6" />
                
                <Subheading>Exposed Ports</Subheading>
                <div className="mt-4">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeader>Service</TableHeader>
                        <TableHeader>Port</TableHeader>
                        <TableHeader>Target Port</TableHeader>
                        <TableHeader>Protocol</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {application.ports.map((port: Port, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{port.service}</TableCell>
                          <TableCell>{port.port}</TableCell>
                          <TableCell>{port.targetPort}</TableCell>
                          <TableCell>{port.protocol}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
                <Subheading>Description</Subheading>
                <Text className="mt-2">{application.description}</Text>
                
                <Divider className="my-6" />

                <Subheading>Quick Actions</Subheading>
                <div className="mt-4 space-y-3">
                  <Button outline className="w-full justify-start">
                    <ArrowPathIcon className="w-5 h-5 mr-2" />
                    Restart Application
                  </Button>
                  <Button outline className="w-full justify-start">
                    <Cog6ToothIcon className="w-5 h-5 mr-2" />
                    Edit Configuration
                  </Button>
                  <Button outline className="w-full justify-start">
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    View Metrics
                  </Button>
                  <Button outline className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                    <TrashIcon className="w-5 h-5 mr-2" />
                    Delete Application
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="mt-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <Subheading>Performance Metrics</Subheading>
            <div className="mt-4">
              <div className="text-center text-zinc-500 dark:text-zinc-400 py-12">
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700">
                  <ChartBarIcon className="w-8 h-8" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">Monitoring Dashboard</h3>
                <p className="mt-2 text-sm">
                  In a production environment, you would see real-time metrics charts here.<br />
                  This would include CPU usage, memory consumption, disk I/O, and network traffic.
                </p>
                <Button className="mt-4">Open Grafana Dashboard</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <Subheading>Configuration Files</Subheading>
            <div className="mt-4">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Path</TableHeader>
                    <TableHeader>Size</TableHeader>
                    <TableHeader>Last Modified</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {application.configFiles.map((file: ConfigFile, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell className="font-mono text-sm">{file.path}</TableCell>
                      <TableCell>{file.size}</TableCell>
                      <TableCell>{file.modified}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button outline className="text-xs py-1 px-2">View</Button>
                          <Button outline className="text-xs py-1 px-2">Edit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <Subheading>Application Logs</Subheading>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <select className="rounded-md border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900">
                    <option>All Pods</option>
                    <option>keycloak-0</option>
                    <option>keycloak-1</option>
                    <option>keycloak-2</option>
                  </select>
                  <select className="rounded-md border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900">
                    <option>Last 15 minutes</option>
                    <option>Last hour</option>
                    <option>Last 12 hours</option>
                    <option>Last 24 hours</option>
                    <option>Last 7 days</option>
                  </select>
                </div>
                <Button outline className="text-xs py-1 px-2">
                  Download Logs
                </Button>
              </div>
              <div className="bg-zinc-900 text-zinc-100 p-4 rounded-md font-mono text-sm h-96 overflow-auto">
                <div className="whitespace-pre-wrap">
                  2025-03-16 10:15:42,123 INFO [org.keycloak.services] (ServerService Thread Pool -- 55) KC-SERVICES0035: Using hybrid-id provider
                  <br/>
                  2025-03-16 10:15:43,456 INFO [org.keycloak.connections.jpa.DefaultJpaConnectionProviderFactory] (ServerService Thread Pool -- 55) Database vendor: PostgreSQL
                  <br/>
                  2025-03-16 10:15:45,789 INFO [org.keycloak.connections.jpa.updater.liquibase.LiquibaseJpaUpdaterProvider] (ServerService Thread Pool -- 55) Updating database
                  <br/>
                  2025-03-16 10:15:47,123 INFO [org.keycloak.models.map.storage.jpa.JpaMapStorageProviderFactory] (ServerService Thread Pool -- 55) Initialized Realm entities with JPA
                  <br/>
                  2025-03-16 10:15:48,456 INFO [org.keycloak.services] (ServerService Thread Pool -- 55) KC-SERVICES0009: Added user &apos;admin&apos; to realm &apos;master&apos;
                  <br/>
                  2025-03-16 10:15:49,789 INFO [org.keycloak.quarkus.runtime.hostname.DefaultHostnameProvider] (main) Hostname settings: Base URL: https://keycloak.sakura-phoenix.com, Hostname: &lt;request&gt;, Strict HTTPS: true, Path: &lt;request&gt;, Strict BackChannel: false
                  <br/>
                  2025-03-16 10:15:50,123 INFO [io.quarkus] (main) Keycloak 22.0.1 on JVM started in 8.42s
                  <br/>
                  ... (more log entries would appear here) ...
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <Subheading>Recent Events</Subheading>
            <div className="mt-4 space-y-4">
              {application.events.map((event: Event) => (
                <div 
                  key={event.id} 
                  className="flex items-start p-4 rounded-lg border border-zinc-100 dark:border-zinc-700"
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    event.type === 'info' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : event.type === 'warning'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {event.type === 'info' && <InformationCircleIcon className="w-5 h-5" />}
                    {event.type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5" />}
                    {event.type === 'error' && <ExclamationTriangleIcon className="w-5 h-5" />}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-zinc-900 dark:text-white">
                      {event.message}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {event.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Application Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Application</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {application.name}? This action cannot be undone.
        </DialogDescription>
        
        <DialogBody>
          <Text>
            Deleting this application will remove all associated resources, data, and configurations.
            If you want to keep your data, please make sure to create a backup before proceeding.
          </Text>
        </DialogBody>
        
        <DialogActions>
          <Button 
            outline 
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            color="red" 
            onClick={handleDeleteApplication}
          >
            Delete Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restart Application Confirmation Dialog */}
      <Dialog open={isRestartDialogOpen} onClose={() => setIsRestartDialogOpen(false)}>
        <DialogTitle>Restart Application</DialogTitle>
        <DialogDescription>
          Are you sure you want to restart {application.name}?
        </DialogDescription>
        
        <DialogBody>
          <Text>
            Restarting the application will cause a brief downtime. All active sessions will be terminated.
            The application will be unavailable until it starts up again.
          </Text>
        </DialogBody>
        
        <DialogActions>
          <Button 
            outline 
            onClick={() => setIsRestartDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRestartApplication}
          >
            Restart Application
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}