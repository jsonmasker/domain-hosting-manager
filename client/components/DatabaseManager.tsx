import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  HardDrive,
  Shield,
  Settings,
  FileText,
  Clock,
  Archive,
  Server,
  Activity
} from "lucide-react";
import { databaseService } from "@/services/databaseService";

interface DatabaseStats {
  totalRecords: number;
  tableStats: Record<string, number>;
  databaseSize: string;
  lastBackup: string;
  connectionStatus: 'connected' | 'disconnected' | 'error';
}

export function DatabaseManager() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [backupHistory, setBackupHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [backupProgress, setBackupProgress] = useState(0);
  const [selectedTables, setSelectedTables] = useState<string[]>(['clients', 'domains', 'hosting', 'payments']);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'sql'>('json');

  useEffect(() => {
    loadDatabaseStats();
    loadBackupHistory();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      setIsLoading(true);
      
      // Initialize database service if needed
      await databaseService.initialize();
      
      // Get dashboard stats to calculate totals
      const dashboardResult = await databaseService.getDashboardStats();
      
      if (dashboardResult.success) {
        const data = dashboardResult.data!;
        const mockStats: DatabaseStats = {
          totalRecords: data.totalClients + data.totalDomains + data.totalHosting + (data.unpaidInvoices || 0),
          tableStats: {
            clients: data.totalClients,
            domains: data.totalDomains,
            hosting: data.totalHosting,
            payments: data.unpaidInvoices || 0
          },
          databaseSize: "2.4 MB",
          lastBackup: "2024-01-30 15:30:00",
          connectionStatus: 'connected'
        };
        setStats(mockStats);
      }
    } catch (error) {
      setError(`Failed to load database stats: ${error.message}`);
      setStats({
        totalRecords: 0,
        tableStats: {},
        databaseSize: "Unknown",
        lastBackup: "Never",
        connectionStatus: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBackupHistory = async () => {
    try {
      const result = await databaseService.getBackupHistory();
      if (result.success) {
        setBackupHistory(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load backup history:', error);
    }
  };

  const handleBackup = async (type: 'full' | 'incremental' = 'full') => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      setBackupProgress(0);

      // Simulate backup progress
      const progressInterval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await databaseService.createBackup(type);
      
      clearInterval(progressInterval);
      setBackupProgress(100);

      if (result.success) {
        setSuccess(`${type} backup completed successfully: ${result.data}`);
        loadBackupHistory();
      } else {
        setError(result.error || 'Backup failed');
      }
    } catch (error) {
      setError(`Backup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setBackupProgress(0), 2000);
    }
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const result = await databaseService.exportData(
        selectedTables as any[],
        exportFormat
      );

      if (result.success) {
        // Create download
        const blob = new Blob([result.data!], { 
          type: exportFormat === 'json' ? 'application/json' : 'text/plain' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `domainhub_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSuccess(`Data exported successfully in ${exportFormat.toUpperCase()} format`);
      } else {
        setError(result.error || 'Export failed');
      }
    } catch (error) {
      setError(`Export failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableSelection = (table: string, checked: boolean) => {
    if (checked) {
      setSelectedTables(prev => [...prev, table]);
    } else {
      setSelectedTables(prev => prev.filter(t => t !== table));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-success text-success-foreground';
      case 'disconnected': return 'bg-warning text-warning-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading database information...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Database Management</h1>
          <p className="text-muted-foreground">Manage database operations, backups, and exports</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(stats.connectionStatus)}>
            <Database className="h-3 w-3 mr-1" />
            {stats.connectionStatus}
          </Badge>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-success/50 text-success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Database Size</p>
                <p className="text-2xl font-bold">{stats.databaseSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Last Backup</p>
                <p className="text-sm font-medium">{stats.lastBackup}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={getStatusColor(stats.connectionStatus)}>
                  {stats.connectionStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="operations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          <TabsTrigger value="export">Data Export</TabsTrigger>
          <TabsTrigger value="tables">Table Statistics</TabsTrigger>
        </TabsList>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Database Operations
              </CardTitle>
              <CardDescription>
                Perform maintenance and administrative operations on the database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => loadDatabaseStats()} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Statistics
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => handleBackup('full')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Create Full Backup
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => handleBackup('incremental')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Incremental Backup
                </Button>

                <Button 
                  variant="outline" 
                  disabled
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Backup
                </Button>
              </div>

              {backupProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Backup Progress</span>
                    <span>{backupProgress}%</span>
                  </div>
                  <Progress value={backupProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Backup History
              </CardTitle>
              <CardDescription>
                View and manage database backups
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backupHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No backups found</p>
                  <p className="text-sm">Create your first backup to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>File Path</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backupHistory.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell>
                          <Badge variant="outline">{backup.backup_type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{backup.file_path}</TableCell>
                        <TableCell>{backup.file_size ? formatFileSize(backup.file_size) : '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(backup.status === 'success' ? 'connected' : 'error')}>
                            {backup.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{backup.started_at}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Export
              </CardTitle>
              <CardDescription>
                Export database tables in various formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Tables to Export</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['clients', 'domains', 'hosting', 'payments'].map((table) => (
                      <div key={table} className="flex items-center space-x-2">
                        <Checkbox
                          id={table}
                          checked={selectedTables.includes(table)}
                          onCheckedChange={(checked) => handleTableSelection(table, checked as boolean)}
                        />
                        <label htmlFor={table} className="text-sm capitalize">{table}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Export Format</label>
                  <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleExport} 
                  disabled={isLoading || selectedTables.length === 0}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tables Tab */}
        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Table Statistics
              </CardTitle>
              <CardDescription>
                Overview of records in each database table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead>Record Count</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(stats.tableStats).map(([tableName, count]) => {
                    const percentage = stats.totalRecords > 0 ? (count / stats.totalRecords) * 100 : 0;
                    return (
                      <TableRow key={tableName}>
                        <TableCell className="font-medium capitalize">{tableName}</TableCell>
                        <TableCell>{count.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="w-16" />
                            <span className="text-sm">{percentage.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-success/10 text-success">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
