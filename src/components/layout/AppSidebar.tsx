"use client"

import { Link, useLocation } from "react-router-dom"
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Home,
  School,
  Users,
  UserCheck,
  ClipboardList,
  TrendingUp,
  Settings,
  Shield,
  UserCog,
  UsersRound,
  Calendar,
  Target,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { hasRole, ROLES } from "@/lib/permissions"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Estudiantes",
    url: "/students",
    icon: GraduationCap,
  },
  {
    title: "Docentes",
    url: "/teachers",
    icon: Users,
  },
  {
    title: "Tutores",
    url: "/tutors",
    icon: UsersRound,
  },
  {
    title: "Cursos",
    url: "/courses",
    icon: School,
  },
  {
    title: "Materias",
    url: "/subjects",
    icon: BookOpen,
  },
  {
    title: "Campos",
    url: "/campos",
    icon: Target,
  },
  {
    title: "Períodos",
    url: "/periodos",
    icon: Calendar,
  },
  {
    title: "Calificaciones",
    url: "/grades",
    icon: BarChart3,
  },
  {
    title: "Asistencia",
    url: "/attendance",
    icon: UserCheck,
  },
  {
    title: "Participación",
    url: "/participation",
    icon: ClipboardList,
  },
  {
    title: "Reportes",
    url: "/reports",
    icon: TrendingUp,
  },
]

const adminItems = [
  {
    title: "Usuarios",
    url: "/users",
    icon: UserCog,
  },
  {
    title: "Roles",
    url: "/roles",
    icon: Shield,
  },
  {
    title: "Configuración",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const isAdmin = hasRole(user, ROLES.ADMIN)

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Aula Inteligente</span>
            <span className="text-xs text-muted-foreground">Sistema Escolar</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-4">
          <div className="text-xs text-muted-foreground">Versión 1.0.0</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
