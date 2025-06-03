import axios from "axios"
import type { LoginRequest, LoginResponse, User } from "@/types/auth"
import type {
  ApiResponse,
  Student,
  Teacher,
  Tutor,
  Course,
  Subject,
  Role,
  Permission,
  Grade,
  Campo,
  Periodo,
  DashboardStats,
} from "@/types/api"
import type { Attendance, Participation } from "@/types/api"

const API_BASE_URL = "http://127.0.0.1:8000"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
            refresh: refreshToken,
          })

          const { access } = response.data
          localStorage.setItem("access_token", access)

          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  },
)

// Helper function to get all paginated data
async function getAllPaginatedData<T>(url: string, params?: any): Promise<T[]> {
  let allData: T[] = []
  let nextUrl: string | null = url

  while (nextUrl) {
    const response: { data: any } = await api.get(nextUrl, { params: nextUrl === url ? params : undefined })
    const data: { results?: T[]; next?: string | null } = response.data

    if (data.results) {
      allData = [...allData, ...data.results]
      nextUrl = data.next || null
    } else {
      // Si no hay paginación, devolver los datos directamente
      const directData: any = response.data
      return Array.isArray(directData) ? directData : [directData]
    }
  }

  return allData
}

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post("/api/auth/login/", credentials)
    return response.data
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/api/auth/logout/", { refresh: refreshToken })
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get("/api/auth/profile/")
    return response.data
  },

  // Perfil personal completo
  getMyProfile: async (): Promise<User> => {
    const response = await api.get("/api/auth/profile/me/")
    return response.data
  },

  // Actualizar mi perfil
  updateMyProfile: async (data: any): Promise<User> => {
    const response = await api.put("/api/auth/profile/update_profile/", data)
    return response.data.user
  },

  // Cambiar mi contraseña
  changeMyPassword: async (data: any): Promise<void> => {
    await api.post("/api/auth/profile/change_password/", data)
  },

  // Ver mis permisos
  getMyPermissions: async (): Promise<any> => {
    const response = await api.get("/api/auth/profile/my_permissions/")
    return response.data
  },

  register: async (userData: any): Promise<User> => {
    const response = await api.post("/api/auth/register/", userData)
    return response.data
  },

  // Obtener usuarios disponibles para asignación
  getAvailableUsers: async (role?: string) => {
    const params = new URLSearchParams()
    if (role) params.append("groups", role)
    params.append("is_active", "true")

    const response = await api.get(`/api/auth/users/?${params.toString()}`)
    return response.data
  },

  // Obtener usuarios sin asignar (que no tengan estudiante o docente asociado)
  getUnassignedUsers: async (role?: string) => {
    const params = new URLSearchParams()
    if (role) params.append("groups", role)
    params.append("is_active", "true")
    params.append("unassigned", "true")

    const response = await api.get(`/api/auth/users/?${params.toString()}`)
    return response.data
  },
}

// Users Admin API (para administradores)
export const usersAdminApi = {
  getAll: async (params?: any): Promise<ApiResponse<User>> => {
    const response = await api.get("/api/auth/users-admin/", { params })
    return response.data
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/api/auth/users-admin/${id}/`)
    return response.data
  },

  update: async (id: number, data: any): Promise<User> => {
    const response = await api.put(`/api/auth/users-admin/${id}/`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/auth/users-admin/${id}/`)
  },

  changePassword: async (id: number, data: any): Promise<void> => {
    await api.post(`/api/auth/users-admin/${id}/change_password/`, data)
  },

  toggleActive: async (id: number): Promise<any> => {
    const response = await api.post(`/api/auth/users-admin/${id}/toggle_active/`)
    return response.data
  },

  getStatistics: async (): Promise<any> => {
    const response = await api.get("/api/auth/users-admin/statistics/")
    return response.data
  },
}

// Students API - Actualizado según nueva documentación
export const studentsApi = {
  getAll: async (params?: any): Promise<ApiResponse<Student>> => {
    const response = await api.get("/api/students/estudiantes/", { params })
    return response.data
  },

  getById: async (ci: string): Promise<Student> => {
    const response = await api.get(`/api/students/estudiantes/${ci}/`)
    return response.data
  },

  create: async (data: any): Promise<Student> => {
    // Ahora solo crear el estudiante, sin usuario automático
    const studentData = {
      ci: data.ci,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      fecha_nacimiento: data.fecha_nacimiento,
      codigo_curso: data.codigo_curso,
    }

    const response = await api.post("/api/students/estudiantes/", studentData)
    return response.data
  },

  update: async (ci: string, data: any): Promise<Student> => {
    const response = await api.put(`/api/students/estudiantes/${ci}/`, data)
    return response.data
  },

  delete: async (ci: string): Promise<void> => {
    await api.delete(`/api/students/estudiantes/${ci}/`)
  },

  // Nuevos métodos para asignación de usuarios
  assignUser: async (ci: string, userId: number): Promise<any> => {
    const response = await api.post(`/api/students/estudiantes/${ci}/asignar_usuario/`, {
      usuario_id: userId,
    })
    return response.data
  },

  unassignUser: async (ci: string): Promise<any> => {
    const response = await api.post(`/api/students/estudiantes/${ci}/desasignar_usuario/`)
    return response.data
  },
}

// Teachers API - Actualizado según nueva documentación
export const teachersApi = {
  getAll: async (params?: any): Promise<ApiResponse<Teacher>> => {
    const response = await api.get("/api/teachers/docentes/", { params })
    return response.data
  },

  getById: async (ci: string): Promise<Teacher> => {
    const response = await api.get(`/api/teachers/docentes/${ci}/`)
    return response.data
  },

  create: async (data: any): Promise<Teacher> => {
    // Ahora solo crear el docente, sin usuario automático
    const teacherData = {
      ci: data.ci,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      telefono: data.telefono,
      fecha_ingreso: data.fecha_ingreso,
      especialidad: data.especialidad,
      titulo: data.titulo,
    }

    const response = await api.post("/api/teachers/docentes/", teacherData)
    return response.data
  },

  update: async (ci: string, data: any): Promise<Teacher> => {
    const response = await api.put(`/api/teachers/docentes/${ci}/`, data)
    return response.data
  },

  delete: async (ci: string): Promise<void> => {
    await api.delete(`/api/teachers/docentes/${ci}/`)
  },

  // Nuevos métodos para asignación de usuarios
  assignUser: async (ci: string, userId: number): Promise<any> => {
    const response = await api.post(`/api/teachers/docentes/${ci}/asignar_usuario/`, {
      usuario_id: userId,
    })
    return response.data
  },

  unassignUser: async (ci: string): Promise<any> => {
    const response = await api.post(`/api/teachers/docentes/${ci}/desasignar_usuario/`)
    return response.data
  },
}

// Tutors API
export const tutorsApi = {
  getAll: async (params?: any): Promise<ApiResponse<Tutor>> => {
    const response = await api.get("/api/tutors/", { params })
    return response.data
  },

  getById: async (ci: string): Promise<Tutor> => {
    const response = await api.get(`/api/tutors/${ci}/`)
    return response.data
  },

  create: async (data: any): Promise<Tutor> => {
    const response = await api.post("/api/tutors/", data)
    return response.data
  },

  update: async (ci: string, data: any): Promise<Tutor> => {
    const response = await api.put(`/api/tutors/${ci}/`, data)
    return response.data
  },

  delete: async (ci: string): Promise<void> => {
    await api.delete(`/api/tutors/${ci}/`)
  },
  // Nuevo método para asignar estudiante a tutor
  assignStudent: async (ci: string, data: { ci_estudiante: string; parentesco: string }): Promise<any> => {
    const response = await api.post(`/api/tutors/${ci}/asignar_estudiante/`, data)
    return response.data
  },

  // Método para desasignar estudiante (si existe en el backend)
  unassignStudent: async (ci: string, data: { ci_estudiante: string }): Promise<any> => {
    const response = await api.delete(`/api/tutors/${ci}/desasignar_estudiante/`, { data })
    return response.data
  },
}

// Courses API
export const coursesApi = {
  getAll: async (params?: any): Promise<ApiResponse<Course>> => {
    const response = await api.get("/api/courses/cursos/", { params })
    return response.data
  },

  getById: async (codigo: string): Promise<Course> => {
    const response = await api.get(`/api/courses/cursos/${codigo}/`)
    return response.data
  },

  create: async (data: any): Promise<Course> => {
    const response = await api.post("/api/courses/cursos/", data)
    return response.data
  },

  update: async (codigo: string, data: any): Promise<Course> => {
    const response = await api.put(`/api/courses/cursos/${codigo}/`, data)
    return response.data
  },

  delete: async (codigo: string): Promise<void> => {
    await api.delete(`/api/courses/cursos/${codigo}/`)
  },

  getStudents: async (codigo: string): Promise<Student[]> => {
    const response = await api.get(`/api/courses/cursos/${codigo}/estudiantes/`)
    return response.data
  },

  getCriteria: async (): Promise<any[]> => {
    return await getAllPaginatedData("/api/courses/criterios/")
  },

  getPeriods: async (): Promise<any[]> => {
    return await getAllPaginatedData("/api/courses/periodos/")
  },
}

// Subjects API
export const subjectsApi = {
  getAll: async (params?: any): Promise<ApiResponse<Subject>> => {
    const response = await api.get("/api/subjects/", { params })
    return response.data
  },

  getById: async (codigo: string): Promise<Subject> => {
    const response = await api.get(`/api/subjects/${codigo}/`)
    return response.data
  },

  create: async (data: any): Promise<Subject> => {
    const response = await api.post("/api/subjects/", data)
    return response.data
  },

  update: async (codigo: string, data: any): Promise<Subject> => {
    const response = await api.put(`/api/subjects/${codigo}/`, data)
    return response.data
  },

  delete: async (codigo: string): Promise<void> => {
    await api.delete(`/api/subjects/${codigo}/`)
  },
}

// Roles API
export const rolesApi = {
  getAll: async (params?: any): Promise<ApiResponse<Role>> => {
    const response = await api.get("/api/auth/groups/", { params })
    return response.data
  },

  getById: async (id: number): Promise<Role> => {
    const response = await api.get(`/api/auth/groups/${id}/`)
    return response.data
  },

  create: async (data: any): Promise<Role> => {
    const response = await api.post("/api/auth/groups/", data)
    return response.data
  },

  update: async (id: number, data: any): Promise<Role> => {
    const response = await api.put(`/api/auth/groups/${id}/`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/auth/groups/${id}/`)
  },

  getPermissions: async (): Promise<Permission[]> => {
    return await getAllPaginatedData("/api/auth/permissions/")
  },
}

// Users API (solo lectura)
export const usersApi = {
  getAll: async (params?: any): Promise<ApiResponse<User>> => {
    const response = await api.get("/api/auth/users/", { params })
    return response.data
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/api/auth/users/${id}/`)
    return response.data
  },

  // Para compatibilidad, redirigir a usersAdminApi
  create: async (data: any): Promise<User> => {
    return await authApi.register(data)
  },

  update: async (id: number, data: any): Promise<User> => {
    return await usersAdminApi.update(id, data)
  },

  delete: async (id: number): Promise<void> => {
    return await usersAdminApi.delete(id)
  },
}

// Grades API
export const gradesApi = {
  getAll: async (params?: any): Promise<ApiResponse<Grade>> => {
    const response = await api.get("/api/grades/notas/", { params })
    return response.data
  },

  create: async (data: any): Promise<Grade> => {
    const response = await api.post("/api/grades/notas/", data)
    return response.data
  },

  update: async (id: number, data: any): Promise<Grade> => {
    const response = await api.put(`/api/grades/notas/${id}/`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/grades/notas/${id}/`)
  },

  createBulk: async (data: any): Promise<void> => {
    await api.post("/api/grades/notas/registro_masivo/", data)
  },

  getStudentPerformance: async (ci_estudiante: string): Promise<any> => {
    const response = await api.get(`/api/grades/rendimiento_estudiante/${ci_estudiante}/`)
    return response.data
  },

  getStats: async (params?: any): Promise<any> => {
    const response = await api.get("/api/grades/estadisticas/", { params })
    return response.data
  },

  exportReport: async (params?: any): Promise<Blob> => {
    const response = await api.get("/api/grades/reporte/", {
      params,
      responseType: "blob",
    })
    return response.data
  },
}

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    return {
      total_students: 450,
      average_grade: 78.5,
      attendance_percentage: 92.3,
      total_teachers: 25,
      total_courses: 12,
      performance_data: [
        { month: "Ene", predicted: 75, actual: 78 },
        { month: "Feb", predicted: 77, actual: 76 },
        { month: "Mar", predicted: 79, actual: 82 },
        { month: "Abr", predicted: 81, actual: 79 },
        { month: "May", predicted: 83, actual: 85 },
        { month: "Jun", predicted: 85, actual: 83 },
      ],
      grade_distribution: [
        { range: "90-100", count: 85 },
        { range: "80-89", count: 120 },
        { range: "70-79", count: 150 },
        { range: "60-69", count: 70 },
        { range: "0-59", count: 25 },
      ],
    }
  },
}

// Attendance API
export const attendanceApi = {
  getAll: async (params?: any): Promise<ApiResponse<Attendance>> => {
    const response = await api.get("/api/attendance/", { params })
    return response.data
  },

  getById: async (id: number): Promise<Attendance> => {
    const response = await api.get(`/api/attendance/${id}/`)
    return response.data
  },

  create: async (data: any): Promise<Attendance> => {
    const response = await api.post("/api/attendance/", data)
    return response.data
  },

  update: async (id: number, data: any): Promise<Attendance> => {
    const response = await api.put(`/api/attendance/${id}/`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/attendance/${id}/`)
  },

  createBulk: async (data: any): Promise<void> => {
    await api.post("/api/attendance/registro_masivo/", data)
  },

  getStats: async (params?: any): Promise<any> => {
    const response = await api.get("/api/attendance/estadisticas/", { params })
    return response.data
  },

  exportReport: async (params?: any): Promise<Blob> => {
    const response = await api.get("/api/attendance/reporte/", {
      params,
      responseType: "blob",
    })
    return response.data
  },
}

// Participation API
export const participationApi = {
  getAll: async (params?: any): Promise<ApiResponse<Participation>> => {
    const response = await api.get("/api/participation/", { params })
    return response.data
  },

  getById: async (id: number): Promise<Participation> => {
    const response = await api.get(`/api/participation/${id}/`)
    return response.data
  },

  create: async (data: any): Promise<Participation> => {
    const response = await api.post("/api/participation/", data)
    return response.data
  },

  update: async (id: number, data: any): Promise<Participation> => {
    const response = await api.put(`/api/participation/${id}/`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/participation/${id}/`)
  },

  createBulk: async (data: any): Promise<void> => {
    await api.post("/api/participation/registro_masivo/", data)
  },

  getStats: async (params?: any): Promise<any> => {
    const response = await api.get("/api/participation/estadisticas/", { params })
    return response.data
  },
}

// Campos API
export const camposApi = {
  getAll: async (params?: any): Promise<ApiResponse<Campo>> => {
    const response = await api.get("/api/courses/campos/", { params })
    return response.data
  },

  getById: async (codigo: string): Promise<Campo> => {
    const response = await api.get(`/api/courses/campos/${codigo}/`)
    return response.data
  },

  create: async (data: any): Promise<Campo> => {
    const response = await api.post("/api/courses/campos/", data)
    return response.data
  },

  update: async (codigo: string, data: any): Promise<Campo> => {
    const response = await api.put(`/api/courses/campos/${codigo}/`, data)
    return response.data
  },

  delete: async (codigo: string): Promise<void> => {
    await api.delete(`/api/courses/campos/${codigo}/`)
  },
}

// Períodos API
export const periodosApi = {
  getAll: async (params?: any): Promise<ApiResponse<Periodo>> => {
    const response = await api.get("/api/courses/periodos/", { params })
    return response.data
  },

  getById: async (codigo: string): Promise<Periodo> => {
    const response = await api.get(`/api/courses/periodos/${codigo}/`)
    return response.data
  },

  create: async (data: any): Promise<Periodo> => {
    const response = await api.post("/api/courses/periodos/", data)
    return response.data
  },

  update: async (codigo: string, data: any): Promise<Periodo> => {
    const response = await api.put(`/api/courses/periodos/${codigo}/`, data)
    return response.data
  },

  delete: async (codigo: string): Promise<void> => {
    await api.delete(`/api/courses/periodos/${codigo}/`)
  },
}


export default api
