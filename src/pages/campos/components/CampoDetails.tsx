"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Campo } from "@/types/api"

interface CampoDetailsProps {
  campo: Campo
}

export function CampoDetails({ campo }: CampoDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Información del Campo</span>
            <Badge variant={campo.is_active ? "default" : "secondary"}>{campo.is_active ? "Activo" : "Inactivo"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Código</h4>
              <p className="text-sm font-mono">{campo.codigo}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Valor</h4>
              <p className="text-sm">
                <span className="text-lg font-semibold">{campo.valor}%</span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Nombre</h4>
            <p className="text-sm">{campo.nombre}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <h4 className="font-medium">Fecha de Creación</h4>
              <p>{new Date(campo.created_at).toLocaleString()}</p>
            </div>
            <div>
              <h4 className="font-medium">Última Actualización</h4>
              <p>{new Date(campo.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
