'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Heading } from '../../components/ui/heading';
import { Input, InputGroup } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '../../components/ui/dialog';
import { Field, FieldGroup, Label } from '../../components/ui/fieldset';
import { Select } from '../../components/ui/select';
import { Text } from '../../components/ui/text';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '../../components/ui/dropdown';
import { Textarea } from '../../components/ui/textarea';
import { 
  EllipsisVerticalIcon, 
  MagnifyingGlassIcon, 
  PlusIcon,
  ArrowPathIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api';

// Define Application type
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
}

// Application type options for filtering and form selection
const applicationTypes = [
  'All',
  'Authentication',
  'Integration',
  'Command & Control',
  'Database',
  'Search & Analytics',
  'Monitoring',
  'Visualization',
  'Medical'
];

export default function Applications() {
  const { isAuthenticated, hasRole } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newAppForm, setNewAppForm] = useState({
    name: '',
    type: 'Authentication',
    version: '',
    description: '',
    cpu: '1',
    memory: '2Gi',
    storage: '10Gi',
    url: ''
  });

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get('/applications');
        setApplications(response.data);
      } catch (err: any) {
        console.error('Error fetching applications:', err);
        setError(err.response?.data?.message || 'Failed to load applications');
        // Fallback to mock data for development purposes
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated]);

  // Filter applications based on search term and type
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || app.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAppForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeployApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await apiClient.post('/applications', {
        name: newAppForm.name,
        description: newAppForm.description,
        type: newAppForm.type,
        version: newAppForm.version,
        cpu: newAppForm.cpu,
        memory: newAppForm.memory,
        storage: newAppForm.storage,
        url: newAppForm.url
      });
      
      // Add the newly created application to state
      setApplications(prev => [...prev, response.data]);
      
      // Reset form and close dialog
      setNewAppForm({
        name: '',
        type: 'Authentication',
        version: '',
        description: '',
        cpu: '1',
        memory: '2Gi',
        storage: '10Gi',
        url: ''
      });
      setIsDeployDialogOpen(false);
    } catch (err: any) {
      console.error('Error deploying application:', err);
      setError(err.response?.data?.message || 'Failed to deploy application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!selectedApp) return;
    
    setIsLoading(true);
    
    try {
      await apiClient.delete(`/applications/${selectedApp.id}`);
      
      // Remove the deleted application from state
      setApplications(prev => prev.filter(app => app.id !== selectedApp.id));
      setIsDeleteDialogOpen(false);
      setSelectedApp(null);
    } catch (err: any) {
      console.error('Error deleting application:', err);
      setError(err.response?.data?.message || 'Failed to delete application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartApplication = async (app: Application) => {
    setIsLoading(true);
    
    try {
      await apiClient.post(`/applications/${app.id}/restart`);
      
      // Update the application status in state
      setApplications(prev => 
        prev.map(a => 
          a.id === app.id ? { ...a, status: 'Pending' } : a
        )
      );
      
      // Refetch applications after a delay to get updated status
      setTimeout(async () => {
        try {
          const response = await apiClient.get('/applications');
          setApplications(response.data);
        } catch (err) {
          console.error('Error refreshing applications:', err);
        } finally {
          setIsLoading(false);
        }
      }, 2000);
    } catch (err: any) {
      console.error('Error restarting application:', err);
      setError(err.response?.data?.message || 'Failed to restart application');
      setIsLoading(false);
    }
  };

  // Check if user has permission to deploy new applications
  const canDeployApps = hasRole('admin') || hasRole('deployer');

  return (
    <div>
      <div className="flex justify-between items-center">
        <Heading>Applications</Heading>
        {canDeployApps && (
          <Button onClick={() => setIsDeployDialogOpen(true)}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Deploy New App
          </Button>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="mt-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <InputGroup>
            <MagnifyingGlassIcon className="w-5 h-5 text-zinc-500" data-slot="icon" />
            <Input 
              type="text" 
              placeholder="Search applications" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="w-full md:w-64">
          <Select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
          >
            {applicationTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Applications Grid View */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((app) => (
              <div 
                key={app.id}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                          {app.name.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{app.name}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{app.type}</p>
                      </div>
                    </div>
                    <Dropdown>
                      <DropdownButton>
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </DropdownButton>
                      <DropdownMenu>
                        <DropdownItem href={`/applications/${app.id}`}>View Details</DropdownItem>
                        <DropdownItem href={app.url} target="_blank">Open App</DropdownItem>
                        <DropdownItem onClick={() => handleRestartApplication(app)}>
                          <ArrowPathIcon className="w-4 h-4 mr-2" />
                          Restart
                        </DropdownItem>
                        {hasRole('admin') && (
                          <DropdownItem 
                            onClick={() => {
                              setSelectedApp(app);
                              setIsDeleteDialogOpen(true);
                            }} 
                            className="text-red-600 dark:text-red-400"
                          >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownItem>
                        )}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  
                  <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">
                    {app.description}
                  </p>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <Badge color={
                      app.status === 'Running' 
                        ? 'green' 
                        : app.status === 'Pending' 
                          ? 'yellow' 
                          : app.status === 'Error' 
                            ? 'red' 
                            : 'zinc'
                    }>
                      {app.status}
                    </Badge>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">v{app.version}</span>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400">
                    <div>CPU: {app.cpu}</div>
                    <div>Memory: {app.memory}</div>
                    <div>Storage: {app.storage}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <div className="mt-8 text-center p-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
              <div className="text-lg font-medium text-zinc-900 dark:text-white">No applications found</div>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                {searchTerm || filterType !== 'All' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Deploy your first application to get started'}
              </p>
              {(!searchTerm && filterType === 'All' && canDeployApps) && (
                <Button onClick={() => setIsDeployDialogOpen(true)} className="mt-4">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Deploy New App
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Deploy New Application Dialog */}
      <Dialog open={isDeployDialogOpen} onClose={() => setIsDeployDialogOpen(false)}>
        <DialogTitle>Deploy New Application</DialogTitle>
        <DialogDescription>
          Fill in the details below to deploy a new application to your platform.
        </DialogDescription>
        
        <form onSubmit={handleDeployApplication}>
          <DialogBody>
            <FieldGroup>
              <Field>
                <Label htmlFor="name">Application Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newAppForm.name}
                  onChange={handleInputChange}
                  required
                />
              </Field>
              
              <Field>
                <Label htmlFor="type">Application Type</Label>
                <Select
                  id="type"
                  name="type"
                  value={newAppForm.type}
                  onChange={handleInputChange}
                  required
                >
                  {applicationTypes.filter(type => type !== 'All').map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </Field>
              
              <Field>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  name="version"
                  value={newAppForm.version}
                  onChange={handleInputChange}
                  required
                />
              </Field>
              
              <Field>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newAppForm.description}
                  onChange={handleInputChange}
                  required
                />
              </Field>
              
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <Label htmlFor="cpu">CPU (cores)</Label>
                  <Select
                    id="cpu"
                    name="cpu"
                    value={newAppForm.cpu}
                    onChange={handleInputChange}
                  >
                    <option value="0.5">0.5</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="4">4</option>
                    <option value="8">8</option>
                  </Select>
                </Field>
                
                <Field>
                  <Label htmlFor="memory">Memory</Label>
                  <Select
                    id="memory"
                    name="memory"
                    value={newAppForm.memory}
                    onChange={handleInputChange}
                  >
                    <option value="512Mi">512Mi</option>
                    <option value="1Gi">1Gi</option>
                    <option value="2Gi">2Gi</option>
                    <option value="4Gi">4Gi</option>
                    <option value="8Gi">8Gi</option>
                    <option value="16Gi">16Gi</option>
                  </Select>
                </Field>
                
                <Field>
                  <Label htmlFor="storage">Storage</Label>
                  <Select
                    id="storage"
                    name="storage"
                    value={newAppForm.storage}
                    onChange={handleInputChange}
                  >
                    <option value="1Gi">1Gi</option>
                    <option value="5Gi">5Gi</option>
                    <option value="10Gi">10Gi</option>
                    <option value="20Gi">20Gi</option>
                    <option value="50Gi">50Gi</option>
                    <option value="100Gi">100Gi</option>
                  </Select>
                </Field>
              </div>
              
              <Field>
                <Label htmlFor="url">
                  Custom URL (optional)
                </Label>
                <Input
                  id="url"
                  name="url"
                  placeholder="app-name.sakura-phoenix.com"
                  value={newAppForm.url}
                  onChange={handleInputChange}
                />
                <Text className="text-xs mt-1">
                  Leave blank for default URL: {newAppForm.name 
                    ? `${newAppForm.name.toLowerCase().replace(/\s+/g, '-')}.sakura-phoenix.com` 
                    : 'app-name.sakura-phoenix.com'}
                </Text>
              </Field>
            </FieldGroup>
          </DialogBody>
          
          <DialogActions>
            <Button 
              outline={true} 
              onClick={() => setIsDeployDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Deploying...' : 'Deploy Application'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Application Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Application</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {selectedApp?.name}? This action cannot be undone.
        </DialogDescription>
        
        <DialogBody>
          <Text>
            Deleting this application will remove all associated resources, data, and configurations.
            If you want to keep your data, please make sure to create a backup before proceeding.
          </Text>
        </DialogBody>
        
        <DialogActions>
          <Button 
            outline={true} 
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            color="red" 
            onClick={handleDeleteApplication}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}