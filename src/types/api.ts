export interface ApiResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Student {
  ci: string
  nombre: string
  apellido: string
  email: string
  fecha_nacimiento: string
  usuario_username: string
  created_at: string
  updated_at: string
  is_active: boolean
  curso_actual?: {
    codigo: string
    nombre: string
    nivel: string
    paralelo: string
    gestion: number
  }
  tutores?: Array<{
    ci: string
    nombre_completo: string
    parentesco: string
    telefono: string
    email: string
  }>
  // Información adicional del detalle
  usuario_info?: {
    username: string
    is_active: boolean
    last_login?: string
  }
  inscripciones?: Array<{
    id: number
    codigo_curso: string
    fecha_inscripcion: string
    estado: string
    curso_nombre: string
  }>
  rendimiento_resumen?: {
    promedio_general: number
    porcentaje_asistencia: number
    total_notas: number
    total_clases: number
  }
}

export interface Teacher {
  ci: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  fecha_ingreso: string
  usuario_username: string
  created_at: string
  updated_at: string
  is_active: boolean
  especialidad?: string
  titulo?: string
  materias_asignadas?: Array<{
    materia: string
    curso: string
    nivel: string
    paralelo: string
  }>
}

export interface Tutor {
  ci: string
  nombre: string
  apellido: string
  telefono: string
  email: string
  direccion?: string
  ocupacion?: string
  created_at: string
  updated_at: string
  is_active: boolean
  estudiantes_asignados?: Array<{
    ci: string
    nombre_completo: string
    parentesco: string
    email?: string
    telefono?: string
    edad?: number
  }>
}

export interface Course {
  codigo: string
  nombre: string
  nivel: string
  paralelo: string
  gestion: number
  created_at: string
  updated_at: string
  is_active: boolean
  docente_titular?: {
    ci: string
    nombre_completo: string
  }
  total_estudiantes?: number
}

export interface Subject {
  codigo: string
  nombre: string
  descripcion?: string
  creditos: number
  horas_semanales: number
  created_at: string
  updated_at: string
  is_active: boolean
  prerequisitos?: string[]
}

export interface Role {
  id: number
  name: string
  permissions: Permission[]
  created_at: string
  updated_at: string
  user_count?: number
}

export interface Permission {
  id: number
  name: string
  codename: string
  content_type: {
    id: number
    app_label: string
    model: string
  }
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  groups: Role[]
  user_permissions: Permission[]
  date_joined: string
  last_login?: string
  profile?: {
    phone?: string
    address?: string
    birth_date?: string
    avatar?: string
  }
}


// Actualizado: Criterio ahora tiene id en lugar de código
export interface Criterio {
  id: string
  descripcion: string
  codigo_campo: string
  codigo_periodo: string
  campo_nombre: string
  periodo_nombre: string
  created_at: string
  updated_at: string
  is_active: boolean
}

// Actualizado: Grade ahora usa id_criterio en lugar de codigo_criterio
export interface Grade {
  id: number
  codigo_curso: string
  codigo_materia: string
  ci_estudiante: string
  id_criterio: string // Cambiado de codigo_criterio a id_criterio
  nota: number
  observaciones: string
  estudiante_nombre: string
  materia_nombre: string
  curso_nombre: string
  criterio_descripcion: string
  periodo_nombre: string
  created_at: string
}

export interface Attendance {
  id: number
  codigo_curso: string
  ci_estudiante: string
  fecha: string
  estado: "presente" | "ausente" | "tardanza" | "justificado"
  hora_llegada?: string
  observaciones?: string
  estudiante_nombre: string
  curso_nombre: string
  created_at: string
}

export interface Participation {
  id: number
  codigo_curso: string
  codigo_materia: string
  ci_estudiante: string
  fecha: string
  tipo_participacion: string
  calificacion: number
  observaciones?: string
  estudiante_nombre: string
  materia_nombre: string
  curso_nombre: string
  created_at: string
}

export interface Campo {
  codigo: string
  nombre: string
  valor: number
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface Periodo {
  codigo: string
  nombre: string
  created_at: string
  updated_at: string
  is_active: boolean
}


// Nuevas interfaces
export interface Asignacion {
  id: number
  codigo_curso: string
  codigo_materia: string
  ci_docente: string
  materia_nombre: string
  curso_nombre: string
  docente_nombre: string
  created_at: string
  is_active: boolean
}

export interface Inscripcion {
  id: number
  ci_estudiante: string
  codigo_curso: string
  fecha_inscripcion: string
  fecha_baja?: string
  estado: "ACTIVO" | "RETIRADO" | "TRASLADADO"
  motivo_baja?: string
  estudiante_nombre: string
  curso_nombre: string
  created_at: string
  updated_at: string
}

export interface RendimientoEstudiante {
  estudiante: {
    ci: string
    nombre: string
    apellido: string
    email: string
  }
  curso_actual: {
    codigo: string
    nombre: string
    nivel: string
    paralelo: string
    gestion: number
  }
  rendimiento_por_materia: {
    [materia: string]: {
      materia_codigo: string
      docente: string
      notas: Array<{
        criterio: string
        nota: number
        fecha: string
      }>
      promedio_notas: number
      porcentaje_asistencia: number
      promedio_participacion: number
    }
  }
}

export interface DashboardStats {
  total_students: number
  average_grade: number
  attendance_percentage: number
  total_teachers: number
  total_courses: number
  performance_data: Array<{
    month: string
    predicted: number
    actual: number
  }>
  grade_distribution: Array<{
    range: string
    count: number
  }>
}
