"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Upload } from "lucide-react"
import { DataTable } from "@/components/common/DataTable"
import { PermissionGuard } from "@/components/common/PermissionGuard"
import { GradeForm } from "./components/GradeForm"
import { GradeDetails } from "./components/GradeDetails"
import { GradeFilters } from "./components/GradeFilters"
import { BulkGradeForm } from "./components/BulkGradeForm"
import { StudentGrades } from "./components/StudentGrades"
import { gradesApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { PERMISSIONS } from "@/lib/permissions"
import type { Grade } from "@/types/api"

export function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isBulkFormOpen, setIsBulkFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isStudentGradesOpen, setIsStudentGradesOpen] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [selectedStudentCI, setSelectedStudentCI] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [filters, setFilters] = useState({
    codigo_curso: "",
    codigo_materia: "",
    ci_estudiante: "",
    codigo_criterio: "",
  })

  useEffect(() => {
    fetchGrades()
  }, [filters])

  const fetchGrades = async () => {
    try {
      const response = await gradesApi.getAll(filters)
      setGrades(response.results)
    } catch (error) {
      console.error("Error fetching grades:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedGrade(null)
    setFormMode("create")
    setIsFormOpen(true)
  }

  const handleBulkAdd = () => {
    setIsBulkFormOpen(true)
  }

  const handleEdit = (grade: Grade) => {
    setSelectedGrade(grade)
    setFormMode("edit")
    setIsFormOpen(true)
  }

  const handleView = (grade: Grade) => {
    setSelectedGrade(grade)
    setIsDetailsOpen(true)
  }

  const handleViewStudentGrades = (ci_estudiante: string) => {
    setSelectedStudentCI(ci_estudiante)
    setIsStudentGradesOpen(true)
  }

  const handleDelete = async (grade: Grade) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta calificación?")) {
      try {
        await gradesApi.delete(grade.id)
        await fetchGrades()
      } catch (error) {
        console.error("Error deleting grade:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setIsBulkFormOpen(false)
    fetchGrades()
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const columns = [
    {
      key: "estudiante_nombre",
      label: "Estudiante",
      render: (value: string, grade: Grade) => (
        <div>
          <div className="font-medium">{grade.estudiante_nombre}</div>
          <div className="text-sm text-muted-foreground">CI: {grade.ci_estudiante}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "materia_nombre",
      label: "Materia",
      render: (value: string, grade: Grade) => (
        <div>
          <div className="font-medium">{grade.materia_nombre}</div>
          <div className="text-sm text-muted-foreground">{grade.curso_nombre}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "criterio_descripcion",
      label: "Criterio",
      render: (value: string, grade: Grade) => (
        <div>
          <div className="font-medium">{grade.criterio_descripcion}</div>
          <div className="text-sm text-muted-foreground">{grade.periodo_nombre}</div>
        </div>
      ),
    },
    {
      key: "nota",
      label: "Calificación",
      render: (value: number) => (
        <Badge variant={value >= 70 ? "default" : value >= 50 ? "secondary" : "destructive"} className="font-mono">
          {value.toFixed(1)}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "observaciones",
      label: "Observaciones",
      render: (value: string) => (
        <span className="text-sm">
          {value ? (value.length > 50 ? `${value.substring(0, 50)}...` : value) : "Sin observaciones"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Fecha de Registro",
      render: (value: string) => formatDate(value),
      sortable: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calificaciones</h2>
          <p className="text-muted-foreground">Gestiona las calificaciones de los estudiantes</p>
        </div>
        <div className="flex gap-2">
          <PermissionGuard permission={PERMISSIONS.ADD_GRADE}>
            <Button variant="outline" onClick={handleBulkAdd}>
              <Upload className="mr-2 h-4 w-4" />
              Registro Masivo
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Calificación
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <GradeFilters onFiltersChange={handleFiltersChange} />

      <DataTable
        data={grades}
        columns={columns}
        searchPlaceholder="Buscar calificaciones..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        editPermission={PERMISSIONS.CHANGE_GRADE}
        deletePermission={PERMISSIONS.DELETE_GRADE}
        customActions={(grade: Grade) => (
          <Button variant="ghost" size="sm" onClick={() => handleViewStudentGrades(grade.ci_estudiante)}>
            <FileText className="h-4 w-4 mr-1" />
            Ver Todas
          </Button>
        )}
      />

      <GradeForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        grade={selectedGrade}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      <BulkGradeForm open={isBulkFormOpen} onOpenChange={setIsBulkFormOpen} onSuccess={handleFormSuccess} />

      <GradeDetails open={isDetailsOpen} onOpenChange={setIsDetailsOpen} grade={selectedGrade} />

      <StudentGrades
        open={isStudentGradesOpen}
        onOpenChange={setIsStudentGradesOpen}
        ci_estudiante={selectedStudentCI}
      />
    </div>
  )
}
