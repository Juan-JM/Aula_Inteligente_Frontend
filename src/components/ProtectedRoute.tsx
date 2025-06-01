"use client"

import type React from "react"

import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && !user?.groups.includes(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-destructive">No tienes permisos para acceder a esta página</div>
      </div>
    )
  }

  return <>{children}</>
}
