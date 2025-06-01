"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { hasPermission } from "@/lib/permissions"

interface PermissionGuardProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { user } = useAuth()

  if (!hasPermission(user, permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
