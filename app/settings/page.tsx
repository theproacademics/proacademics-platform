"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/layout/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { AnimatedCard } from "@/components/ui/animated-card"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Volume2,
  Moon,
  Sun,
  Monitor,
  Save,
  Key,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    // Profile settings
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    lessonReminders: true,
    homeworkDeadlines: true,
    achievementAlerts: true,
    weeklyProgress: true,
    
    // Appearance settings
    theme: "system", // light, dark, system
    language: "en",
    timezone: "UTC",
    
    // Privacy settings
    profileVisibility: "public", // public, friends, private
    dataSharing: false,
    analyticsTracking: true,
    
    // Study settings
    studyReminders: true,
    focusMode: false,
    soundEffects: true,
    volume: [75],
    autoSave: true,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      setSettings(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }))
    }
  }, [session])

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <Navigation />
        <main className="lg:ml-72 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </main>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
  }

  const handleExportData = () => {
    // Simulate data export
    const data = {
      profile: { name: settings.name, email: settings.email },
      settings: settings,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'proacademics-data-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Navigation />

      <main className="lg:ml-72 min-h-screen relative z-10">
        <ResponsiveContainer padding="lg" animated>
          <PageHeader
            title="Settings"
            description="Customize your ProAcademics experience and manage your account preferences"
            actions={
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save All Changes
                  </>
                )}
              </Button>
            }
          />

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <AnimatedCard delay={100}>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                <Tabs defaultValue="profile" className="w-full">
                  <div className="border-b border-white/10 p-6">
                    <TabsList className="bg-white/10 backdrop-blur-xl border border-white/20 grid grid-cols-5 w-full h-auto p-1 rounded-xl">
                      {[
                        { value: "profile", icon: User, label: "Profile" },
                        { value: "notifications", icon: Bell, label: "Notifications" },
                        { value: "appearance", icon: Palette, label: "Appearance" },
                        { value: "privacy", icon: Shield, label: "Privacy" },
                        { value: "advanced", icon: Settings, label: "Advanced" },
                      ].map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/30 data-[state=active]:to-purple-500/30 data-[state=active]:text-white rounded-lg transition-all duration-300 flex flex-col items-center gap-2 py-3"
                        >
                          <tab.icon className="w-4 h-4" />
                          <span className="text-xs">{tab.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {/* Profile Settings */}
                  <TabsContent value="profile" className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name" className="text-white">Full Name</Label>
                            <Input
                              id="name"
                              value={settings.name}
                              onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                              className="mt-1 bg-white/10 border-white/20 text-white focus:border-blue-500/50"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-white">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={settings.email}
                              onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                              className="mt-1 bg-white/10 border-white/20 text-white focus:border-blue-500/50"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="timezone" className="text-white">Timezone</Label>
                            <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                              <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="UTC">UTC</SelectItem>
                                <SelectItem value="EST">Eastern Time</SelectItem>
                                <SelectItem value="PST">Pacific Time</SelectItem>
                                <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="language" className="text-white">Language</Label>
                            <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                              <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              value={settings.currentPassword}
                              onChange={(e) => setSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="mt-1 bg-white/10 border-white/20 text-white focus:border-blue-500/50 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="newPassword" className="text-white">New Password</Label>
                          <Input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            value={settings.newPassword}
                            onChange={(e) => setSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="mt-1 bg-white/10 border-white/20 text-white focus:border-blue-500/50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            value={settings.confirmPassword}
                            onChange={(e) => setSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="mt-1 bg-white/10 border-white/20 text-white focus:border-blue-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Notification Settings */}
                  <TabsContent value="notifications" className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                      <div className="space-y-4">
                        {[
                          { key: "emailNotifications", label: "Email Notifications", description: "Receive notifications via email" },
                          { key: "pushNotifications", label: "Push Notifications", description: "Browser push notifications" },
                          { key: "lessonReminders", label: "Lesson Reminders", description: "Get reminded about upcoming lessons" },
                          { key: "homeworkDeadlines", label: "Homework Deadlines", description: "Alerts for homework due dates" },
                          { key: "achievementAlerts", label: "Achievement Alerts", description: "Notifications when you earn achievements" },
                          { key: "weeklyProgress", label: "Weekly Progress Reports", description: "Weekly summary of your progress" },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <div>
                              <div className="text-white font-medium">{item.label}</div>
                              <div className="text-gray-400 text-sm">{item.description}</div>
                            </div>
                            <Switch
                              checked={settings[item.key as keyof typeof settings] as boolean}
                              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, [item.key]: checked }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Appearance Settings */}
                  <TabsContent value="appearance" className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Theme & Appearance</h3>
                      <div className="space-y-6">
                        <div>
                          <Label className="text-white mb-3 block">Theme</Label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { value: "light", icon: Sun, label: "Light" },
                              { value: "dark", icon: Moon, label: "Dark" },
                              { value: "system", icon: Monitor, label: "System" },
                            ].map((theme) => (
                              <button
                                key={theme.value}
                                onClick={() => setSettings(prev => ({ ...prev, theme: theme.value }))}
                                className={cn(
                                  "p-4 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-2",
                                  settings.theme === theme.value
                                    ? "border-blue-500 bg-blue-500/20"
                                    : "border-white/20 bg-white/5 hover:bg-white/10"
                                )}
                              >
                                <theme.icon className="w-6 h-6 text-white" />
                                <span className="text-white text-sm">{theme.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-white mb-3 block">Volume Level</Label>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-4">
                              <Volume2 className="w-5 h-5 text-gray-400" />
                              <Slider
                                value={settings.volume}
                                onValueChange={(value) => setSettings(prev => ({ ...prev, volume: value }))}
                                max={100}
                                step={5}
                                className="flex-1"
                              />
                              <span className="text-white text-sm w-12">{settings.volume[0]}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Sound Effects</span>
                              <Switch
                                checked={settings.soundEffects}
                                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEffects: checked }))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Privacy Settings */}
                  <TabsContent value="privacy" className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Privacy & Security</h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white mb-3 block">Profile Visibility</Label>
                          <Select value={settings.profileVisibility} onValueChange={(value) => setSettings(prev => ({ ...prev, profileVisibility: value }))}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public - Everyone can see your profile</SelectItem>
                              <SelectItem value="friends">Friends - Only friends can see your profile</SelectItem>
                              <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-4">
                          {[
                            { key: "dataSharing", label: "Data Sharing", description: "Share anonymized data to improve the platform" },
                            { key: "analyticsTracking", label: "Analytics Tracking", description: "Allow tracking for analytics and performance improvements" },
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                              <div>
                                <div className="text-white font-medium">{item.label}</div>
                                <div className="text-gray-400 text-sm">{item.description}</div>
                              </div>
                              <Switch
                                checked={settings[item.key as keyof typeof settings] as boolean}
                                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, [item.key]: checked }))}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Advanced Settings */}
                  <TabsContent value="advanced" className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Advanced Settings</h3>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          {[
                            { key: "studyReminders", label: "Study Reminders", description: "Automatic reminders to maintain study habits" },
                            { key: "focusMode", label: "Focus Mode", description: "Minimize distractions during study sessions" },
                            { key: "autoSave", label: "Auto-save Progress", description: "Automatically save your progress" },
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                              <div>
                                <div className="text-white font-medium">{item.label}</div>
                                <div className="text-gray-400 text-sm">{item.description}</div>
                              </div>
                              <Switch
                                checked={settings[item.key as keyof typeof settings] as boolean}
                                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, [item.key]: checked }))}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-white/10 pt-6">
                          <h4 className="text-lg font-semibold text-white mb-4">Data Management</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                              onClick={handleExportData}
                              variant="outline"
                              className="border-white/20 hover:bg-white/10 text-white"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export Data
                            </Button>
                            <Button
                              variant="outline"
                              className="border-white/20 hover:bg-white/10 text-white"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Import Data
                            </Button>
                          </div>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                          <h4 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h4>
                          <div className="space-y-3">
                            <Button
                              variant="outline"
                              className="border-red-500/50 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Reset All Settings
                            </Button>
                            <Button
                              variant="outline"
                              className="border-red-500/50 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </AnimatedCard>
          </div>
        </ResponsiveContainer>
      </main>
    </div>
  )
}
