"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Users } from "lucide-react"
import { DataTable } from "@/components/common/DataTable"
import { PermissionGuard } from "@/components/common/PermissionGuard"
import { AttendanceForm } from "./components/AttendanceForm"
import { AttendanceDetails } from "./components/AttendanceDetails"
import { AttendanceFilters } from "./components/AttendanceFilters"
import { BulkAttendanceForm } from "./components/BulkAttendanceForm"
import { AttendanceReport } from "./components/AttendanceReport"
import { attendanceApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { PERMISSIONS } from "@/lib/permissions"
import type { Attendance } from "@/types/api"

export function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isBulkFormOpen, setIsBulkFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [filters, setFilters] = useState({
    codigo_curso: "",
    fecha: "",
    ci_estudiante: "",
  })

  useEffect(() => {
    fetchAttendances()
  }, [filters])

  const fetchAttendances = async () => {
    try {
      const response = await attendanceApi.getAll(filters)
      setAttendances(response.results)
    } catch (error) {
      console.error("Error fetching attendances:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedAttendance(null)
    setFormMode("create")
    setIsFormOpen(true)
  }

  const handleBulkAdd = () => {
    setIsBulkFormOpen(true)
  }

  const handleEdit = (attendance: Attendance) => {
    setSelectedAttendance(attendance)
    setFormMode("edit")
    setIsFormOpen(true)
  }

  const handleView = (attendance: Attendance) => {
    setSelectedAttendance(attendance)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (attendance: Attendance) => {
    if (confirm("¿Estás seguro de que deseas eliminar este registro de asistencia?")) {
      try {
        await attendanceApi.delete(attendance.id)
        await fetchAttendances()
      } catch (error) {
        console.error("Error deleting attendance:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setIsBulkFormOpen(false)
    fetchAttendances()
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "presente":
        return <Badge variant="default">Presente</Badge>
      case "ausente":
        return <Badge variant="destructive">Ausente</Badge>
      case "tardanza":
        return <Badge variant="secondary">Tardanza</Badge>
      case "justificado":
        return <Badge variant="outline">Justificado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const columns = [
    {
      key: "fecha",
      label: "Fecha",
      render: (value: string) => formatDate(value),
      sortable: true,
    },
    {
      key: "estudiante_nombre",
      label: "Estudiante",
      render: (value: string, attendance: Attendance) => (
        <div>
          <div className="font-medium">{attendance.estudiante_nombre}</div>
          <div className="text-sm text-muted-foreground">CI: {attendance.ci_estudiante}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "curso_nombre",
      label: "Curso",
      render: (value: string) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "hora_llegada",
      label: "Hora de Llegada",
      render: (value: string) => value || "No registrada",
    },
    {
      key: "observaciones",
      label: "Observaciones",
      render: (value: string) => (
        <span className="text-sm">
          {value ? (value.length > 30 ? `${value.substring(0, 30)}...` : value) : "Sin observaciones"}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Asistencia</h2>
          <p className="text-muted-foreground">Gestiona el registro de asistencia de los estudiantes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsReportOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Reportes
          </Button>
          <PermissionGuard permission={PERMISSIONS.ADD_ATTENDANCE}>
            <Button variant="outline" onClick={handleBulkAdd}>
              <Users className="mr-2 h-4 w-4" />
              Registro Masivo
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Asistencia
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <AttendanceFilters onFiltersChange={handleFiltersChange} />

      <DataTable
        data={attendances}
        columns={columns}
        searchPlaceholder="Buscar registros de asistencia..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        editPermission={PERMISSIONS.CHANGE_ATTENDANCE}
        deletePermission={PERMISSIONS.DELETE_ATTENDANCE}
      />

      <AttendanceForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        attendance={selectedAttendance}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      <BulkAttendanceForm open={isBulkFormOpen} onOpenChange={setIsBulkFormOpen} onSuccess={handleFormSuccess} />

      <AttendanceDetails open={isDetailsOpen} onOpenChange={setIsDetailsOpen} attendance={selectedAttendance} />

      <AttendanceReport open={isReportOpen} onOpenChange={setIsReportOpen} />
    </div>
  )
}
