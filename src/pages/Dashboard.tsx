"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { PerformanceChart } from "@/components/dashboard/PerformanceChart"
import { GradeDistribution } from "@/components/dashboard/GradeDistribution"
import { dashboardApi } from "@/lib/api"
import type { DashboardStats } from "@/types/api"

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-destructive">Error al cargar los datos</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Resumen general del rendimiento académico</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-7">
        <PerformanceChart data={stats.performance_data} />
        <GradeDistribution data={stats.grade_distribution} />
      </div>
    </div>
  )
}
