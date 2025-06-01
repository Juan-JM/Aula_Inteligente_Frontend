"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Save, Building, Globe, Clock } from "lucide-react"

interface GeneralConfig {
  schoolName: string
  schoolCode: string
  address: string
  phone: string
  email: string
  website: string
  description: string
  timezone: string
  language: string
  currency: string
  academicYearStart: string
  academicYearEnd: string
  enableMaintenanceMode: boolean
  enableRegistration: boolean
  enableGuestAccess: boolean
}

export function GeneralSettings() {
  const [config, setConfig] = useState<GeneralConfig>({
    schoolName: "Institución Educativa Ejemplo",
    schoolCode: "IE001",
    address: "Calle Principal 123, Ciudad",
    phone: "+1 234 567 8900",
    email: "info@escuela.edu",
    website: "https://www.escuela.edu",
    description: "Institución educativa comprometida con la excelencia académica",
    timezone: "America/Bogota",
    language: "es",
    currency: "COP",
    academicYearStart: "2024-02-01",
    academicYearEnd: "2024-11-30",
    enableMaintenanceMode: false,
    enableRegistration: true,
    enableGuestAccess: false,
  })

  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simular llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Configuración guardada",
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

  const timezones = [
    { value: "America/Bogota", label: "Bogotá (UTC-5)" },
    { value: "America/Mexico_City", label: "Ciudad de México (UTC-6)" },
    { value: "America/Lima", label: "Lima (UTC-5)" },
    { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (UTC-3)" },
    { value: "America/Santiago", label: "Santiago (UTC-3)" },
  ]

  const languages = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
    { value: "pt", label: "Português" },
    { value: "fr", label: "Français" },
  ]

  const currencies = [
    { value: "COP", label: "Peso Colombiano (COP)" },
    { value: "USD", label: "Dólar Americano (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "MXN", label: "Peso Mexicano (MXN)" },
    { value: "PEN", label: "Sol Peruano (PEN)" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información de la Institución */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Información de la Institución
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName">Nombre de la Institución</Label>
              <Input
                id="schoolName"
                value={config.schoolName}
                onChange={(e) => setConfig({ ...config, schoolName: e.target.value })}
                placeholder="Nombre completo de la institución"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolCode">Código de la Institución</Label>
              <Input
                id="schoolCode"
                value={config.schoolCode}
                onChange={(e) => setConfig({ ...config, schoolCode: e.target.value })}
                placeholder="Código único"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                placeholder="Dirección completa"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={config.phone}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  placeholder="info@escuela.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={config.website}
                onChange={(e) => setConfig({ ...config, website: e.target.value })}
                placeholder="https://www.escuela.edu"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                placeholder="Descripción de la institución"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración Regional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Configuración Regional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Select value={config.timezone} onValueChange={(value) => setConfig({ ...config, timezone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select value={config.language} onValueChange={(value) => setConfig({ ...config, language: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar idioma" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={config.currency} onValueChange={(value) => setConfig({ ...config, currency: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar moneda" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academicYearStart">Inicio Año Académico</Label>
                <Input
                  id="academicYearStart"
                  type="date"
                  value={config.academicYearStart}
                  onChange={(e) => setConfig({ ...config, academicYearStart: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYearEnd">Fin Año Académico</Label>
                <Input
                  id="academicYearEnd"
                  type="date"
                  value={config.academicYearEnd}
                  onChange={(e) => setConfig({ ...config, academicYearEnd: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuración del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configuración del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="maintenanceMode">Modo Mantenimiento</Label>
                <p className="text-sm text-muted-foreground">Desactiva el acceso al sistema temporalmente</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={config.enableMaintenanceMode}
                onCheckedChange={(checked) => setConfig({ ...config, enableMaintenanceMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="registration">Registro Abierto</Label>
                <p className="text-sm text-muted-foreground">Permite el registro de nuevos usuarios</p>
              </div>
              <Switch
                id="registration"
                checked={config.enableRegistration}
                onCheckedChange={(checked) => setConfig({ ...config, enableRegistration: checked })}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="guestAccess">Acceso de Invitados</Label>
                <p className="text-sm text-muted-foreground">Permite acceso limitado sin autenticación</p>
              </div>
              <Switch
                id="guestAccess"
                checked={config.enableGuestAccess}
                onCheckedChange={(checked) => setConfig({ ...config, enableGuestAccess: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
