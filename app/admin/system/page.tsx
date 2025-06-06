"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import {
  Settings,
  Server,
  Database,
  Shield,
  HardDrive,
  Cpu,
  MemoryStickIcon as Memory,
  Network,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react"

const systemMetrics = {
  server: {
    uptime: "15 days, 4 hours",
    cpu: 67,
    memory: 45,
    storage: 78,
    network: 23,
  },
  database: {
    status: "healthy",
    connections: 45,
    queries: 1247,
    size: "2.3 GB",
  },
  services: [
    { name: "API Gateway", status: "running", uptime: "99.9%" },
    { name: "Authentication", status: "running", uptime: "99.8%" },
    { name: "AI Service", status: "warning", uptime: "98.5%" },
    { name: "File Storage", status: "running", uptime: "99.9%" },
    { name: "Email Service", status: "running", uptime: "99.7%" },
    { name: "Analytics", status: "running", uptime: "99.6%" },
  ],
  settings: {
    maintenanceMode: false,
    registrationOpen: true,
    aiEnabled: true,
    backupEnabled: true,
    loggingLevel: "info",
  },
}

export default function SystemPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "error":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="p-4 lg:p-8 lg:pt-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">System Management</h1>
        <p className="text-muted-foreground">Monitor system health, manage settings, and control platform operations</p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CPU Usage</p>
                <p className="text-2xl font-bold">{systemMetrics.server.cpu}%</p>
              </div>
              <Cpu className="w-8 h-8 text-blue-400" />
            </div>
            <Progress value={systemMetrics.server.cpu} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Memory Usage</p>
                <p className="text-2xl font-bold">{systemMetrics.server.memory}%</p>
              </div>
              <Memory className="w-8 h-8 text-green-400" />
            </div>
            <Progress value={systemMetrics.server.memory} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Storage Usage</p>
                <p className="text-2xl font-bold">{systemMetrics.server.storage}%</p>
              </div>
              <HardDrive className="w-8 h-8 text-orange-400" />
            </div>
            <Progress value={systemMetrics.server.storage} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="glass-card futuristic-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Network I/O</p>
                <p className="text-2xl font-bold">{systemMetrics.server.network}%</p>
              </div>
              <Network className="w-8 h-8 text-purple-400" />
            </div>
            <Progress value={systemMetrics.server.network} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Services Status */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-blue-400" />
                <span>Service Status</span>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemMetrics.services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">Uptime: {service.uptime}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(service.status)} border-current`}>
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-green-400" />
                <span>Database Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="font-medium text-green-400">Healthy</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Connections</p>
                    <p className="text-xl font-bold">{systemMetrics.database.connections}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Queries/min</p>
                    <p className="text-xl font-bold">{systemMetrics.database.queries}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Database Size</p>
                    <p className="text-xl font-bold">{systemMetrics.database.size}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Settings */}
        <div className="space-y-6">
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>System Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Disable user access</p>
                </div>
                <Switch checked={systemMetrics.settings.maintenanceMode} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Registration Open</p>
                  <p className="text-sm text-muted-foreground">Allow new signups</p>
                </div>
                <Switch checked={systemMetrics.settings.registrationOpen} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">AI Services</p>
                  <p className="text-sm text-muted-foreground">Enable Lex AI</p>
                </div>
                <Switch checked={systemMetrics.settings.aiEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Backup</p>
                  <p className="text-sm text-muted-foreground">Daily backups</p>
                </div>
                <Switch checked={systemMetrics.settings.backupEnabled} />
              </div>
            </CardContent>
          </Card>

          {/* System Actions */}
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle>System Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Backup
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Restore Backup
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart Services
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Security Scan
              </Button>
            </CardContent>
          </Card>

          {/* Server Info */}
          <Card className="glass-card futuristic-border">
            <CardHeader>
              <CardTitle>Server Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uptime:</span>
                <span className="font-semibold">{systemMetrics.server.uptime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-semibold">v2.1.4</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Environment:</span>
                <span className="font-semibold">Production</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Backup:</span>
                <span className="font-semibold">2 hours ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
