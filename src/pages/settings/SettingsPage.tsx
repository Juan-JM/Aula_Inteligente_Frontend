"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, GraduationCap, Bell, Users, Database, FileText, Shield, Palette } from "lucide-react"
import { GeneralSettings } from "./components/GeneralSettings"
import { AcademicSettings } from "./components/AcademicSettings"
import { NotificationSettings } from "./components/NotificationSettings"
import { UserSettings } from "./components/UserSettings"
import { BackupSettings } from "./components/BackupSettings"
import { ReportSettings } from "./components/ReportSettings"
import { SecuritySettings } from "./components/SecuritySettings"
import { AppearanceSettings } from "./components/AppearanceSettings"
import { useAuth } from "@/contexts/AuthContext"
import {
  canViewSettings,
  canManageAcademicSettings,
  canManageNotificationSettings,
  canManageSecuritySettings,
  canManageBackupSettings,
  PERMISSIONS,
  canManageUsers,
  canGenerateReports,
} from "@/lib/permissions"

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const { user } = useAuth()

  const settingsTabs = [
    {
      id: "general",
      label: "General",
      icon: Settings,
      component: GeneralSettings,
      permission: PERMISSIONS.VIEW_SETTINGS,
      canAccess: canViewSettings(user),
    },
    {
      id: "academic",
      label: "Académico",
      icon: GraduationCap,
      component: AcademicSettings,
      permission: PERMISSIONS.MANAGE_ACADEMIC_SETTINGS,
      canAccess: canManageAcademicSettings(user),
    },
    {
      id: "notifications",
      label: "Notificaciones",
      icon: Bell,
      component: NotificationSettings,
      permission: PERMISSIONS.MANAGE_NOTIFICATION_SETTINGS,
      canAccess: canManageNotificationSettings(user),
    },
    {
      id: "users",
      label: "Usuarios",
      icon: Users,
      component: UserSettings,
      permission: PERMISSIONS.MANAGE_USERS,
      canAccess: canManageUsers(user),
    },
    {
      id: "security",
      label: "Seguridad",
      icon: Shield,
      component: SecuritySettings,
      permission: PERMISSIONS.MANAGE_SECURITY_SETTINGS,
      canAccess: canManageSecuritySettings(user),
    },
    {
      id: "appearance",
      label: "Apariencia",
      icon: Palette,
      component: AppearanceSettings,
      permission: PERMISSIONS.VIEW_SETTINGS,
      canAccess: canViewSettings(user),
    },
    {
      id: "reports",
      label: "Reportes",
      icon: FileText,
      component: ReportSettings,
      permission: PERMISSIONS.MANAGE_REPORTS,
      canAccess: canGenerateReports(user),
    },
    {
      id: "backup",
      label: "Respaldos",
      icon: Database,
      component: BackupSettings,
      permission: PERMISSIONS.MANAGE_BACKUP_SETTINGS,
      canAccess: canManageBackupSettings(user),
    },
  ]

  // Filtrar pestañas a las que el usuario tiene acceso
  const accessibleTabs = settingsTabs.filter((tab) => tab.canAccess)

  // Si no hay pestañas accesibles, mostrar mensaje
  if (accessibleTabs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
            <p className="text-muted-foreground">Administra la configuración del sistema escolar</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground">No tienes permisos para acceder a la configuración del sistema.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si el tab activo no está en las pestañas accesibles, seleccionar el primero
  if (!accessibleTabs.find((tab) => tab.id === activeTab) && accessibleTabs.length > 0) {
    setActiveTab(accessibleTabs[0].id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
          <p className="text-muted-foreground">Administra la configuración del sistema escolar</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Panel de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              {accessibleTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {accessibleTabs.map((tab) => {
              const Component = tab.component
              return (
                <TabsContent key={tab.id} value={tab.id}>
                  <Component />
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
