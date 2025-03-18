// File: platform/dashboard/src/hooks/useApplications.ts
import { useState, useEffect } from 'react';
import { applicationService } from '../services/api';

export const useApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await applicationService.getAllApplications();
      setApplications(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const restartApp = async (id: string) => {
    try {
      await applicationService.restartApplication(id);
      // Refresh the applications list
      fetchApplications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to restart application');
      console.error('Error restarting application:', err);
    }
  };

  const deleteApp = async (id: string) => {
    try {
      await applicationService.deleteApplication(id);
      // Remove the application from state
      setApplications(applications.filter(app => app.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete application');
      console.error('Error deleting application:', err);
    }
  };

  const deployApp = async (appData: any) => {
    try {
      await applicationService.deployApplication(appData);
      // Refresh the applications list
      fetchApplications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deploy application');
      console.error('Error deploying application:', err);
      throw err; // Re-throw to handle in the form component
    }
  };

  const searchApps = async (term: string, type: string) => {
    try {
      setIsLoading(true);
      setError(null);
      if (!term && (type === 'All' || !type)) {
        await fetchApplications();
      } else {
        const data = await applicationService.searchApplications(term, type);
        setApplications(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search applications');
      console.error('Error searching applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    applications,
    isLoading,
    error,
    fetchApplications,
    restartApp,
    deleteApp,
    deployApp,
    searchApps,
  };
};