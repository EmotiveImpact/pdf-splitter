'use client';

import { analyticsManager } from './analyticsManager';

export interface DashboardStats {
  pdfsProcessed: number;
  emailsSent: number;
  activeClients: number;
  timeSavedHours: number;
  pdfsGrowth: number;
  emailsGrowth: number;
  clientsGrowth: number;
  efficiencyGain: number;
  // CRM metrics
  totalRevenue?: number;
  monthlyRevenue?: number;
  outstandingInvoices?: number;
  pendingTasks?: number;
  recentCommunications?: number;
  revenueGrowth?: number;
  invoiceGrowth?: number;
  taskCompletionRate?: number;
}

export class DashboardDataService {
  static getDashboardStats(): DashboardStats {
    // Only run on client side
    if (typeof window === 'undefined') {
      return {
        pdfsProcessed: 0,
        emailsSent: 0,
        activeClients: 0,
        timeSavedHours: 0,
        pdfsGrowth: 0,
        emailsGrowth: 0,
        clientsGrowth: 0,
        efficiencyGain: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        outstandingInvoices: 0,
        pendingTasks: 0,
        recentCommunications: 0,
        revenueGrowth: 0,
        invoiceGrowth: 0,
        taskCompletionRate: 0
      };
    }

    try {
      const data = analyticsManager.getData();

      // Calculate real statistics from analytics data
      const pdfsProcessed = data.totalPDFsProcessed;
      const emailsSent = data.totalEmailsSent;
      const activeClients = data.customers.size;

      // Calculate time saved (assuming 2 minutes saved per PDF processed)
      const timeSavedMinutes = pdfsProcessed * 2;
      const timeSavedHours = Math.round((timeSavedMinutes / 60) * 10) / 10;

      // Calculate growth percentages (mock for now, could be enhanced with historical data)
      const pdfsGrowth =
        pdfsProcessed > 0
          ? Math.min(Math.round((pdfsProcessed / 10) * 100) / 100, 25)
          : 0;
      const emailsGrowth =
        emailsSent > 0
          ? Math.min(Math.round((emailsSent / 15) * 100) / 100, 20)
          : 0;
      const clientsGrowth =
        activeClients > 0
          ? Math.min(Math.round((activeClients / 5) * 100) / 100, 15)
          : 0;
      const efficiencyGain =
        timeSavedHours > 0
          ? Math.min(Math.round((timeSavedHours / 2) * 100) / 100, 30)
          : 0;

      // Mock CRM data for demonstration
      const totalRevenue = 284765; // $2,847.65 in cents
      const monthlyRevenue = 23458; // $234.58 in cents
      const outstandingInvoices = 156;
      const pendingTasks = 45;
      const recentCommunications = 89;
      const revenueGrowth = 12.5;
      const invoiceGrowth = -5.2;
      const taskCompletionRate = 78.5;

      return {
        pdfsProcessed,
        emailsSent,
        activeClients,
        timeSavedHours,
        pdfsGrowth,
        emailsGrowth,
        clientsGrowth,
        efficiencyGain,
        totalRevenue,
        monthlyRevenue,
        outstandingInvoices,
        pendingTasks,
        recentCommunications,
        revenueGrowth,
        invoiceGrowth,
        taskCompletionRate
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        pdfsProcessed: 0,
        emailsSent: 0,
        activeClients: 0,
        timeSavedHours: 0,
        pdfsGrowth: 0,
        emailsGrowth: 0,
        clientsGrowth: 0,
        efficiencyGain: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        outstandingInvoices: 0,
        pendingTasks: 0,
        recentCommunications: 0,
        revenueGrowth: 0,
        invoiceGrowth: 0,
        taskCompletionRate: 0
      };
    }
  }

  static getRecentActivity() {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const data = analyticsManager.getData();
      const activities = [];

      // Add recent PDF processing activities
      if (data.totalPDFsProcessed > 0) {
        activities.push({
          type: 'pdf_processing',
          description: `Processed ${data.totalPDFsProcessed} PDF${data.totalPDFsProcessed > 1 ? 's' : ''}`,
          timestamp: new Date().toISOString(),
          icon: 'FileText'
        });
      }

      // Add recent email activities
      if (data.totalEmailsSent > 0) {
        activities.push({
          type: 'email_sent',
          description: `Sent ${data.totalEmailsSent} email${data.totalEmailsSent > 1 ? 's' : ''}`,
          timestamp: new Date().toISOString(),
          icon: 'Mail'
        });
      }

      // Add client activities
      if (data.customers.size > 0) {
        activities.push({
          type: 'client_management',
          description: `Managing ${data.customers.size} active client${data.customers.size > 1 ? 's' : ''}`,
          timestamp: new Date().toISOString(),
          icon: 'Users'
        });
      }

      return activities.slice(0, 5); // Return last 5 activities
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  static getProcessingTrends() {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const data = analyticsManager.getData();
      const trends = [];

      // Generate trend data based on actual usage
      const days = 30;
      const baseProcessing = Math.max(
        1,
        Math.floor(data.totalPDFsProcessed / days)
      );

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Add some realistic variation
        const variation = Math.random() * 0.4 - 0.2; // ±20% variation
        const value = Math.max(0, Math.round(baseProcessing * (1 + variation)));

        trends.push({
          date: date.toISOString().split('T')[0],
          value: value,
          label: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        });
      }

      return trends;
    } catch (error) {
      console.error('Error getting processing trends:', error);
      return [];
    }
  }

  static getClientStats() {
    if (typeof window === 'undefined') {
      return {
        total: 0,
        active: 0,
        withEmail: 0,
        withPhone: 0
      };
    }

    try {
      const data = analyticsManager.getData();
      const total = data.customers.size;

      // For now, assume all clients are active and have contact info
      // This could be enhanced with real client data structure
      return {
        total: total,
        active: Math.max(0, total - 1), // Assume 1 might be inactive
        withEmail: total, // Assume all have email
        withPhone: total // Assume all have phone
      };
    } catch (error) {
      console.error('Error getting client stats:', error);
      return {
        total: 0,
        active: 0,
        withEmail: 0,
        withPhone: 0
      };
    }
  }
}
