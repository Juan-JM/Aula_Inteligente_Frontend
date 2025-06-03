"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Periodo } from "@/types/api"

interface PeriodoDetailsProps {
  periodo: Periodo
}

export function PeriodoDetails({ periodo }: PeriodoDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Información del Período</span>
            <Badge variant={periodo.is_active ? "default" : "secondary"}>
              {periodo.is_active ? "Activo" : "Inactivo"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Código</h4>
              <p className="text-sm font-mono">{periodo.codigo}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Estado</h4>
              <Badge variant={periodo.is_active ? "default" : "secondary"}>
                {periodo.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Nombre</h4>
            <p className="text-sm">{periodo.nombre}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <h4 className="font-medium">Fecha de Creación</h4>
              <p>{new Date(periodo.created_at).toLocaleString()}</p>
            </div>
            <div>
              <h4 className="font-medium">Última Actualización</h4>
              <p>{new Date(periodo.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
