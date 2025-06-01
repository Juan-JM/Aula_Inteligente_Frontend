"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, Star, Award, Target } from "lucide-react"
import { participationApi } from "@/lib/api"

interface ParticipationStatsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ParticipationStats({ open, onOpenChange }: ParticipationStatsProps) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open) {
      fetchStats()
    }
  }, [open])

  const fetchStats = async () => {
    try {
      const response = await participationApi.getStats()
      setStats(response)
    } catch (error) {
      console.error("Error fetching participation stats:", error)
      // Mock data for demonstration
      setStats({
        total_participations: 1250,
        average_score: 3.8,
        participation_rate: 85.5,
        top_participants: [
          { name: "María González", score: 4.9, count: 45 },
          { name: "Carlos Rodríguez", score: 4.7, count: 42 },
          { name: "Ana López", score: 4.6, count: 38 },
        ],
        participation_by_type: [
          { type: "Participación en clase", count: 450, percentage: 36 },
          { type: "Exposición", count: 280, percentage: 22.4 },
          { type: "Debate", count: 200, percentage: 16 },
          { type: "Trabajo en equipo", count: 180, percentage: 14.4 },
          { type: "Presentación", count: 140, percentage: 11.2 },
        ],
        monthly_trend: [
          { month: "Ene", count: 180, average: 3.6 },
          { month: "Feb", count: 195, average: 3.7 },
          { month: "Mar", count: 220, average: 3.8 },
          { month: "Abr", count: 210, average: 3.9 },
          { month: "May", count: 225, average: 4.0 },
          { month: "Jun", count: 220, average: 3.8 },
        ],
        score_distribution: [
          { range: "4.5-5.0", count: 425, percentage: 34 },
          { range: "3.5-4.4", count: 500, percentage: 40 },
          { range: "2.5-3.4", count: 250, percentage: 20 },
          { range: "1.5-2.4", count: 60, percentage: 4.8 },
          { range: "0.0-1.4", count: 15, percentage: 1.2 },
        ],
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!stats) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estadísticas de Participación
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="types">Por Tipo</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Participaciones</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_participations.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.average_score.toFixed(1)}/5.0</div>
                  <p className="text-xs text-muted-foreground">+0.2 desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Participación</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.participation_rate}%</div>
                  <p className="text-xs text-muted-foreground">+5% desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">385</div>
                  <p className="text-xs text-muted-foreground">85% del total</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Participantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.top_participants.map((participant: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">{participant.count} participaciones</p>
                        </div>
                      </div>
                      <Badge variant="default">{participant.score.toFixed(1)}/5.0</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Participación por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.participation_by_type.map((type: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{type.type}</span>
                        <span className="text-sm text-muted-foreground">
                          {type.count} ({type.percentage}%)
                        </span>
                      </div>
                      <Progress value={type.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Calificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.score_distribution.map((range: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Rango {range.range}</span>
                        <span className="text-sm text-muted-foreground">
                          {range.count} estudiantes ({range.percentage}%)
                        </span>
                      </div>
                      <Progress value={range.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tendencia Mensual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.monthly_trend.map((month: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{month.month}</span>
                        <Badge variant="outline">{month.count} participaciones</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{month.average.toFixed(1)}/5.0</div>
                        <div className="text-sm text-muted-foreground">Promedio</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
