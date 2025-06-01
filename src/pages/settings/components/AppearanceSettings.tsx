"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Save, Palette, Monitor, Sun, Moon } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

export function AppearanceSettings() {
  const { theme, toggleTheme } = useTheme()
  const [config, setConfig] = useState({
    primaryColor: "#3b82f6",
    secondaryColor: "#64748b",
    accentColor: "#10b981",
    borderRadius: "0.5rem",
    fontSize: "14px",
    fontFamily: "Inter",
    enableAnimations: true,
    enableSounds: false,
    compactMode: false,
    showAvatars: true,
    showBreadcrumbs: true,
    sidebarCollapsed: false,
  })

  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Configuración de apariencia guardada",
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

  const colorPresets = [
    { name: "Azul", primary: "#3b82f6", secondary: "#64748b", accent: "#10b981" },
    { name: "Verde", primary: "#10b981", secondary: "#64748b", accent: "#3b82f6" },
    { name: "Púrpura", primary: "#8b5cf6", secondary: "#64748b", accent: "#f59e0b" },
    { name: "Rosa", primary: "#ec4899", secondary: "#64748b", accent: "#10b981" },
    { name: "Naranja", primary: "#f97316", secondary: "#64748b", accent: "#3b82f6" },
  ]

  const fontOptions = [
    { value: "Inter", label: "Inter" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Lato", label: "Lato" },
    { value: "Poppins", label: "Poppins" },
  ]

  const applyColorPreset = (preset: (typeof colorPresets)[0]) => {
    setConfig({
      ...config,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tema y Colores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tema y Colores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tema del Sistema</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => theme === "dark" && toggleTheme()}
                  className="flex items-center gap-2"
                >
                  <Sun className="h-4 w-4" />
                  Claro
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => theme === "light" && toggleTheme()}
                  className="flex items-center gap-2"
                >
                  <Moon className="h-4 w-4" />
                  Oscuro
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Presets de Color</Label>
              <div className="grid grid-cols-2 gap-2">
                {colorPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    onClick={() => applyColorPreset(preset)}
                    className="justify-start"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                      {preset.name}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Color Primario</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Color de Acento</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={config.accentColor}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={config.accentColor}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    placeholder="#10b981"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipografía y Espaciado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Tipografía y Espaciado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Familia de Fuente</Label>
              <Select value={config.fontFamily} onValueChange={(value) => setConfig({ ...config, fontFamily: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fuente" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontSize">Tamaño de Fuente</Label>
              <Select value={config.fontSize} onValueChange={(value) => setConfig({ ...config, fontSize: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12px">Pequeño (12px)</SelectItem>
                  <SelectItem value="14px">Normal (14px)</SelectItem>
                  <SelectItem value="16px">Grande (16px)</SelectItem>
                  <SelectItem value="18px">Muy Grande (18px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="borderRadius">Radio de Bordes</Label>
              <Select
                value={config.borderRadius}
                onValueChange={(value) => setConfig({ ...config, borderRadius: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar radio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0rem">Sin redondeo</SelectItem>
                  <SelectItem value="0.25rem">Pequeño</SelectItem>
                  <SelectItem value="0.5rem">Normal</SelectItem>
                  <SelectItem value="0.75rem">Grande</SelectItem>
                  <SelectItem value="1rem">Muy Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuración de Interfaz */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Interfaz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Animaciones</Label>
                <p className="text-sm text-muted-foreground">Habilitar transiciones y animaciones</p>
              </div>
              <Switch
                checked={config.enableAnimations}
                onCheckedChange={(checked) => setConfig({ ...config, enableAnimations: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Sonidos</Label>
                <p className="text-sm text-muted-foreground">Reproducir sonidos de notificación</p>
              </div>
              <Switch
                checked={config.enableSounds}
                onCheckedChange={(checked) => setConfig({ ...config, enableSounds: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Modo Compacto</Label>
                <p className="text-sm text-muted-foreground">Reducir espaciado entre elementos</p>
              </div>
              <Switch
                checked={config.compactMode}
                onCheckedChange={(checked) => setConfig({ ...config, compactMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Mostrar Avatares</Label>
                <p className="text-sm text-muted-foreground">Mostrar fotos de perfil de usuarios</p>
              </div>
              <Switch
                checked={config.showAvatars}
                onCheckedChange={(checked) => setConfig({ ...config, showAvatars: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Mostrar Breadcrumbs</Label>
                <p className="text-sm text-muted-foreground">Mostrar navegación de migas de pan</p>
              </div>
              <Switch
                checked={config.showBreadcrumbs}
                onCheckedChange={(checked) => setConfig({ ...config, showBreadcrumbs: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Sidebar Colapsado</Label>
                <p className="text-sm text-muted-foreground">Iniciar con sidebar contraído</p>
              </div>
              <Switch
                checked={config.sidebarCollapsed}
                onCheckedChange={(checked) => setConfig({ ...config, sidebarCollapsed: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Previa */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="p-4 border rounded-lg"
            style={{
              fontFamily: config.fontFamily,
              fontSize: config.fontSize,
              borderRadius: config.borderRadius,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: config.primaryColor }} />
              <div>
                <h4 className="font-semibold">Ejemplo de Usuario</h4>
                <p className="text-sm text-muted-foreground">usuario@ejemplo.com</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button style={{ backgroundColor: config.primaryColor }} className="text-white">
                Botón Primario
              </Button>
              <Button variant="outline" style={{ borderColor: config.accentColor, color: config.accentColor }}>
                Botón Secundario
              </Button>
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
