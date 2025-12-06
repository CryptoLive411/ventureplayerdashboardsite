import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { FileText } from 'lucide-react';

export const AdminDocuments: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Documents</h1>
          <p className="text-muted-foreground">View and manage all player documents</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Documents Coming Soon</h3>
          <p className="text-muted-foreground">
            Document management will be available here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDocuments;
