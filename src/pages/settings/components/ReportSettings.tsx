"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Save, FileText, Clock, Mail } from "lucide-react"

export function ReportSettings() {
  const [config, setConfig] = useState({
    defaultFormat: "pdf",
    enableScheduledReports: true,
    enableEmailReports: true,
    maxReportSize: 50,
    reportRetentionDays: 30,
    enableWatermark: true,
    watermarkText: "Confidencial - Aula Inteligente",
    enableSignature: false,
    signatureText: "Generado automáticamente por Aula Inteligente",
    defaultEmailSubject: "Reporte Académico - {fecha}",
    defaultEmailBody: "Adjunto encontrará el reporte solicitado.",
    enableReportCache: true,
    cacheExpirationHours: 24,
  })

  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Configuración de reportes guardada",
        description: "Los cambios se han aplicado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Configuración General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultFormat">Formato por Defecto</Label>
              <Select
                value={config.defaultFormat}
                onValueChange={(value) => setConfig({ ...config, defaultFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxReportSize">Tamaño Máximo (MB)</Label>
              <Input
                id="maxReportSize"
                type="number"
                min="1"
                max="500"
                value={config.maxReportSize}
                onChange={(e) => setConfig({ ...config, maxReportSize: Number.parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportRetention">Retención de Reportes (días)</Label>
              <Input
                id="reportRetention"
                type="number"
                min="1"
                max="365"
                value={config.reportRetentionDays}
                onChange={(e) => setConfig({ ...config, reportRetentionDays: Number.parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Cache de Reportes</Label>
                <p className="text-sm text-muted-foreground">Almacenar reportes en cache para mejor rendimiento</p>
              </div>
              <Switch
                checked={config.enableReportCache}
                onCheckedChange={(checked) => setConfig({ ...config, enableReportCache: checked })}
              />
            </div>

            {config.enableReportCache && (
              <div className="space-y-2">
                <Label htmlFor="cacheExpiration">Expiración Cache (horas)</Label>
                <Input
                  id="cacheExpiration"
                  type="number"
                  min="1"
                  max="168"
                  value={config.cacheExpirationHours}
                  onChange={(e) => setConfig({ ...config, cacheExpirationHours: Number.parseInt(e.target.value) })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personalización */}
        <Card>
          <CardHeader>
            <CardTitle>Personalización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Marca de Agua</Label>
                <p className="text-sm text-muted-foreground">Agregar marca de agua a los reportes</p>
              </div>
              <Switch
                checked={config.enableWatermark}
                onCheckedChange={(checked) => setConfig({ ...config, enableWatermark: checked })}
              />
            </div>

            {config.enableWatermark && (
              <div className="space-y-2">
                <Label htmlFor="watermarkText">Texto de Marca de Agua</Label>
                <Input
                  id="watermarkText"
                  value={config.watermarkText}
                  onChange={(e) => setConfig({ ...config, watermarkText: e.target.value })}
                  placeholder="Texto de la marca de agua"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Firma Digital</Label>
                <p className="text-sm text-muted-foreground">Agregar firma al final de los reportes</p>
              </div>
              <Switch
                checked={config.enableSignature}
                onCheckedChange={(checked) => setConfig({ ...config, enableSignature: checked })}
              />
            </div>

            {config.enableSignature && (
              <div className="space-y-2">
                <Label htmlFor="signatureText">Texto de Firma</Label>
                <Input
                  id="signatureText"
                  value={config.signatureText}
                  onChange={(e) => setConfig({ ...config, signatureText: e.target.value })}
                  placeholder="Texto de la firma"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reportes Programados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Reportes Programados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Habilitar Reportes Programados</Label>
              <p className="text-sm text-muted-foreground">Permitir la generación automática de reportes</p>
            </div>
            <Switch
              checked={config.enableScheduledReports}
              onCheckedChange={(checked) => setConfig({ ...config, enableScheduledReports: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Envío por Email</Label>
              <p className="text-sm text-muted-foreground">Enviar reportes automáticamente por email</p>
            </div>
            <Switch
              checked={config.enableEmailReports}
              onCheckedChange={(checked) => setConfig({ ...config, enableEmailReports: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Email */}
      {config.enableEmailReports && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configuración de Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailSubject">Asunto por Defecto</Label>
              <Input
                id="emailSubject"
                value={config.defaultEmailSubject}
                onChange={(e) => setConfig({ ...config, defaultEmailSubject: e.target.value })}
                placeholder="Asunto del email"
              />
              <p className="text-xs text-muted-foreground">
                Variables disponibles: {"{fecha}"}, {"{tipo_reporte}"}, {"{institucion}"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailBody">Cuerpo por Defecto</Label>
              <textarea
                id="emailBody"
                className="w-full p-2 border rounded-md"
                rows={4}
                value={config.defaultEmailBody}
                onChange={(e) => setConfig({ ...config, defaultEmailBody: e.target.value })}
                placeholder="Cuerpo del email"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón de Guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="min-w-32">
          {loading ? (
            <>Guardando...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
