"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Save, GraduationCap, Plus, Trash2, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GradeScale {
  id: string
  name: string
  minScore: number
  maxScore: number
  letterGrade: string
  description: string
  color: string
}

interface AcademicConfig {
  gradingSystem: "numeric" | "letter" | "percentage"
  passingGrade: number
  maxGrade: number
  minGrade: number
  allowDecimalGrades: boolean
  enableAttendanceTracking: boolean
  enableParticipationTracking: boolean
  attendanceRequiredPercentage: number
  periodsPerYear: number
  enableGradeWeighting: boolean
  enableExtraCredit: boolean
  gradeScales: GradeScale[]
}

export function AcademicSettings() {
  const [config, setConfig] = useState<AcademicConfig>({
    gradingSystem: "numeric",
    passingGrade: 3.0,
    maxGrade: 5.0,
    minGrade: 1.0,
    allowDecimalGrades: true,
    enableAttendanceTracking: true,
    enableParticipationTracking: true,
    attendanceRequiredPercentage: 80,
    periodsPerYear: 4,
    enableGradeWeighting: true,
    enableExtraCredit: false,
    gradeScales: [
      {
        id: "1",
        name: "Excelente",
        minScore: 4.5,
        maxScore: 5.0,
        letterGrade: "A",
        description: "Desempeño superior",
        color: "bg-green-500",
      },
      {
        id: "2",
        name: "Sobresaliente",
        minScore: 4.0,
        maxScore: 4.4,
        letterGrade: "B",
        description: "Desempeño alto",
        color: "bg-blue-500",
      },
      {
        id: "3",
        name: "Aceptable",
        minScore: 3.0,
        maxScore: 3.9,
        letterGrade: "C",
        description: "Desempeño básico",
        color: "bg-yellow-500",
      },
      {
        id: "4",
        name: "Insuficiente",
        minScore: 1.0,
        maxScore: 2.9,
        letterGrade: "D",
        description: "Desempeño bajo",
        color: "bg-red-500",
      },
    ],
  })

  const [loading, setLoading] = useState(false)
  const [editingScale, setEditingScale] = useState<GradeScale | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Configuración académica guardada",
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

  const handleAddScale = () => {
    setEditingScale({
      id: Date.now().toString(),
      name: "",
      minScore: 0,
      maxScore: 0,
      letterGrade: "",
      description: "",
      color: "bg-gray-500",
    })
    setIsDialogOpen(true)
  }

  const handleEditScale = (scale: GradeScale) => {
    setEditingScale(scale)
    setIsDialogOpen(true)
  }

  const handleSaveScale = () => {
    if (!editingScale) return

    const existingIndex = config.gradeScales.findIndex((s) => s.id === editingScale.id)
    if (existingIndex >= 0) {
      const updatedScales = [...config.gradeScales]
      updatedScales[existingIndex] = editingScale
      setConfig({ ...config, gradeScales: updatedScales })
    } else {
      setConfig({ ...config, gradeScales: [...config.gradeScales, editingScale] })
    }

    setIsDialogOpen(false)
    setEditingScale(null)
  }

  const handleDeleteScale = (id: string) => {
    setConfig({
      ...config,
      gradeScales: config.gradeScales.filter((s) => s.id !== id),
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sistema de Calificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Sistema de Calificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gradingSystem">Tipo de Calificación</Label>
              <Select
                value={config.gradingSystem}
                onValueChange={(value: "numeric" | "letter" | "percentage") =>
                  setConfig({ ...config, gradingSystem: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="numeric">Numérico (1.0 - 5.0)</SelectItem>
                  <SelectItem value="letter">Letras (A, B, C, D, F)</SelectItem>
                  <SelectItem value="percentage">Porcentaje (0% - 100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minGrade">Calificación Mínima</Label>
                <Input
                  id="minGrade"
                  type="number"
                  step="0.1"
                  value={config.minGrade}
                  onChange={(e) => setConfig({ ...config, minGrade: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxGrade">Calificación Máxima</Label>
                <Input
                  id="maxGrade"
                  type="number"
                  step="0.1"
                  value={config.maxGrade}
                  onChange={(e) => setConfig({ ...config, maxGrade: Number.parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingGrade">Nota de Aprobación</Label>
              <Input
                id="passingGrade"
                type="number"
                step="0.1"
                value={config.passingGrade}
                onChange={(e) => setConfig({ ...config, passingGrade: Number.parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodsPerYear">Períodos por Año</Label>
              <Select
                value={config.periodsPerYear.toString()}
                onValueChange={(value) => setConfig({ ...config, periodsPerYear: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar períodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Semestres</SelectItem>
                  <SelectItem value="3">3 Trimestres</SelectItem>
                  <SelectItem value="4">4 Bimestres</SelectItem>
                  <SelectItem value="6">6 Períodos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Seguimiento */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Seguimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Decimales en Calificaciones</Label>
                <p className="text-sm text-muted-foreground">Permitir calificaciones con decimales</p>
              </div>
              <Switch
                checked={config.allowDecimalGrades}
                onCheckedChange={(checked) => setConfig({ ...config, allowDecimalGrades: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Seguimiento de Asistencia</Label>
                <p className="text-sm text-muted-foreground">Habilitar control de asistencia</p>
              </div>
              <Switch
                checked={config.enableAttendanceTracking}
                onCheckedChange={(checked) => setConfig({ ...config, enableAttendanceTracking: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Seguimiento de Participación</Label>
                <p className="text-sm text-muted-foreground">Habilitar registro de participación</p>
              </div>
              <Switch
                checked={config.enableParticipationTracking}
                onCheckedChange={(checked) => setConfig({ ...config, enableParticipationTracking: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ponderación de Calificaciones</Label>
                <p className="text-sm text-muted-foreground">Permitir pesos diferentes por evaluación</p>
              </div>
              <Switch
                checked={config.enableGradeWeighting}
                onCheckedChange={(checked) => setConfig({ ...config, enableGradeWeighting: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Créditos Adicionales</Label>
                <p className="text-sm text-muted-foreground">Permitir puntos extra en evaluaciones</p>
              </div>
              <Switch
                checked={config.enableExtraCredit}
                onCheckedChange={(checked) => setConfig({ ...config, enableExtraCredit: checked })}
              />
            </div>

            {config.enableAttendanceTracking && (
              <div className="space-y-2">
                <Label htmlFor="attendanceRequired">Asistencia Requerida (%)</Label>
                <Input
                  id="attendanceRequired"
                  type="number"
                  min="0"
                  max="100"
                  value={config.attendanceRequiredPercentage}
                  onChange={(e) =>
                    setConfig({ ...config, attendanceRequiredPercentage: Number.parseInt(e.target.value) })
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Escalas de Calificación */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Escalas de Calificación</CardTitle>
            <Button onClick={handleAddScale} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Escala
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.gradeScales.map((scale) => (
              <Card key={scale.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${scale.color} text-white`}>{scale.letterGrade}</Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEditScale(scale)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteScale(scale.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <h4 className="font-semibold">{scale.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {scale.minScore} - {scale.maxScore}
                  </p>
                  <p className="text-xs text-muted-foreground">{scale.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para editar escalas */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingScale?.name ? "Editar Escala" : "Nueva Escala"}</DialogTitle>
          </DialogHeader>
          {editingScale && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scaleName">Nombre</Label>
                <Input
                  id="scaleName"
                  value={editingScale.name}
                  onChange={(e) => setEditingScale({ ...editingScale, name: e.target.value })}
                  placeholder="Nombre de la escala"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minScore">Puntuación Mínima</Label>
                  <Input
                    id="minScore"
                    type="number"
                    step="0.1"
                    value={editingScale.minScore}
                    onChange={(e) => setEditingScale({ ...editingScale, minScore: Number.parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxScore">Puntuación Máxima</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    step="0.1"
                    value={editingScale.maxScore}
                    onChange={(e) => setEditingScale({ ...editingScale, maxScore: Number.parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="letterGrade">Letra</Label>
                <Input
                  id="letterGrade"
                  value={editingScale.letterGrade}
                  onChange={(e) => setEditingScale({ ...editingScale, letterGrade: e.target.value })}
                  placeholder="A, B, C, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={editingScale.description}
                  onChange={(e) => setEditingScale({ ...editingScale, description: e.target.value })}
                  placeholder="Descripción del nivel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select
                  value={editingScale.color}
                  onValueChange={(value) => setEditingScale({ ...editingScale, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-green-500">Verde</SelectItem>
                    <SelectItem value="bg-blue-500">Azul</SelectItem>
                    <SelectItem value="bg-yellow-500">Amarillo</SelectItem>
                    <SelectItem value="bg-orange-500">Naranja</SelectItem>
                    <SelectItem value="bg-red-500">Rojo</SelectItem>
                    <SelectItem value="bg-purple-500">Morado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveScale}>Guardar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
