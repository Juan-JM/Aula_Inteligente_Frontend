import type { User } from "@/types/auth"

export const PERMISSIONS = {
  // Estudiantes
  VIEW_STUDENT: "students.view_estudiante",
  ADD_STUDENT: "students.add_estudiante",
  CHANGE_STUDENT: "students.change_estudiante",
  DELETE_STUDENT: "students.delete_estudiante",

  // Docentes
  VIEW_TEACHER: "teachers.view_docente",
  ADD_TEACHER: "teachers.add_docente",
  CHANGE_TEACHER: "teachers.change_docente",
  DELETE_TEACHER: "teachers.delete_docente",

  // Tutores
  VIEW_TUTOR: "tutors.view_tutor",
  ADD_TUTOR: "tutors.add_tutor",
  CHANGE_TUTOR: "tutors.change_tutor",
  DELETE_TUTOR: "tutors.delete_tutor",

  // Cursos
  VIEW_COURSE: "courses.view_curso",
  ADD_COURSE: "courses.add_curso",
  CHANGE_COURSE: "courses.change_curso",
  DELETE_COURSE: "courses.delete_curso",

  // Materias
  VIEW_SUBJECT: "subjects.view_materia",
  ADD_SUBJECT: "subjects.add_materia",
  CHANGE_SUBJECT: "subjects.change_materia",
  DELETE_SUBJECT: "subjects.delete_materia",

  // Calificaciones
  VIEW_GRADE: "grades.view_nota",
  ADD_GRADE: "grades.add_nota",
  CHANGE_GRADE: "grades.change_nota",
  DELETE_GRADE: "grades.delete_nota",

  // Asistencia
  VIEW_ATTENDANCE: "attendance.view_asistencia",
  ADD_ATTENDANCE: "attendance.add_asistencia",
  CHANGE_ATTENDANCE: "attendance.change_asistencia",
  DELETE_ATTENDANCE: "attendance.delete_asistencia",

  // Participación
  VIEW_PARTICIPATION: "participation.view_participacion",
  ADD_PARTICIPATION: "participation.add_participacion",
  CHANGE_PARTICIPATION: "participation.change_participacion",
  DELETE_PARTICIPATION: "participation.delete_participacion",

  // Reportes
  VIEW_REPORTS: "reports.view_reporte",
  GENERATE_REPORTS: "reports.generate_reporte",
  EXPORT_REPORTS: "reports.export_reporte",

  // Usuarios
  VIEW_USER: "auth.view_user",
  ADD_USER: "auth.add_user",
  CHANGE_USER: "auth.change_user",
  DELETE_USER: "auth.delete_user",

  // Grupos/Roles
  VIEW_GROUP: "auth.view_group",
  ADD_GROUP: "auth.add_group",
  CHANGE_GROUP: "auth.change_group",
  DELETE_GROUP: "auth.delete_group",

  // Configuraciones
  VIEW_SETTINGS: "settings.view_configuracion",
  CHANGE_SETTINGS: "settings.change_configuracion",
  MANAGE_ACADEMIC_SETTINGS: "settings.manage_academic",
  MANAGE_NOTIFICATION_SETTINGS: "settings.manage_notifications",
  MANAGE_SECURITY_SETTINGS: "settings.manage_security",
  MANAGE_BACKUP_SETTINGS: "settings.manage_backup",

  // Administración
  VIEW_ADMIN: "admin.view_admin",
  MANAGE_USERS: "auth.change_user",
  MANAGE_GROUPS: "auth.change_group",
} as const

export const ROLES = {
  ADMIN: "Administrador",
  TEACHER: "Docente",
  STUDENT: "Estudiante",
  COORDINATOR: "Coordinador",
  TUTOR: "Tutor",
} as const

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false

  // Super admin tiene todos los permisos
  if (user.groups.includes(ROLES.ADMIN)) return true

  // Verificar permisos específicos
  return user.user_permissions?.includes(permission) || false
}

export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false
  return user.groups.includes(role)
}

// Funciones helper para estudiantes
export function canViewStudents(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.VIEW_STUDENT) || hasRole(user, ROLES.ADMIN)
}

export function canManageStudents(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.CHANGE_STUDENT) || hasRole(user, ROLES.ADMIN)
}

export function canAddStudents(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.ADD_STUDENT) || hasRole(user, ROLES.ADMIN)
}

export function canDeleteStudents(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.DELETE_STUDENT) || hasRole(user, ROLES.ADMIN)
}

// Funciones helper para docentes
export function canViewTeachers(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.VIEW_TEACHER) || hasRole(user, ROLES.ADMIN)
}

export function canManageTeachers(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.CHANGE_TEACHER) || hasRole(user, ROLES.ADMIN)
}

export function canAddTeachers(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.ADD_TEACHER) || hasRole(user, ROLES.ADMIN)
}

export function canDeleteTeachers(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.DELETE_TEACHER) || hasRole(user, ROLES.ADMIN)
}

// Funciones helper para tutores
export function canViewTutors(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.VIEW_TUTOR) || hasRole(user, ROLES.ADMIN)
}

export function canManageTutors(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.CHANGE_TUTOR) || hasRole(user, ROLES.ADMIN)
}

export function canAddTutors(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.ADD_TUTOR) || hasRole(user, ROLES.ADMIN)
}

export function canDeleteTutors(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.DELETE_TUTOR) || hasRole(user, ROLES.ADMIN)
}

// Funciones helper para cursos
export function canViewCourses(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.VIEW_COURSE) || hasRole(user, ROLES.ADMIN)
}

export function canManageCourses(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.CHANGE_COURSE) || hasRole(user, ROLES.ADMIN)
}

export function canAddCourses(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.ADD_COURSE) || hasRole(user, ROLES.ADMIN)
}

export function canDeleteCourses(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.DELETE_COURSE) || hasRole(user, ROLES.ADMIN)
}

// Funciones helper para materias
export function canViewSubjects(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.VIEW_SUBJECT) || hasRole(user, ROLES.ADMIN)
}

export function canManageSubjects(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.CHANGE_SUBJECT) || hasRole(user, ROLES.ADMIN)
}

export function canAddSubjects(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.ADD_SUBJECT) || hasRole(user, ROLES.ADMIN)
}

export function canDeleteSubjects(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.DELETE_SUBJECT) || hasRole(user, ROLES.ADMIN)
}

// Funciones helper para calificaciones
export function canViewGrades(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.VIEW_GRADE) || hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.TEACHER)
}

export function canManageGrades(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.CHANGE_GRADE) || hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.TEACHER)
}

export function canAddGrades(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.ADD_GRADE) || hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.TEACHER)
}

export function canDeleteGrades(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.DELETE_GRADE) || hasRole(user, ROLES.ADMIN)
}

// Funciones helper para asistencia
export function canViewAttendance(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.VIEW_ATTENDANCE) || hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.TEACHER)
}

export function canManageAttendance(user: User | null): boolean {
  return (
    hasPermission(user, PERMISSIONS.CHANGE_ATTENDANCE) || hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.TEACHER)
  )
}

export function canAddAttendance(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.ADD_ATTENDANCE) || hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.TEACHER)
}

export function canDeleteAttendance(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.DELETE_ATTENDANCE) || hasRole(user, ROLES.ADMIN)
}

// Funciones helper para participación
export function canViewParticipation(user: User | null): boolean {
  return (
    hasPermission(user, PERMISSIONS.VIEW_PARTICIPATION) || hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.TEACHER)
  )
}

export function canManageParticipation(user: User | null): boolean {
  return (
    hasPermission(user, PERMISSIONS.CHANGE_PARTICIPATION) || hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.TEACHER)
  )
}

export function canAddParticipation(user: User | null): boolean {
  return (
    hasPermission(user, PERMISSIONS.ADD_PARTICIPATION) || hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.TEACHER)
  )
}

export function canDeleteParticipation(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.DELETE_PARTICIPATION) || hasRole(user, ROLES.ADMIN)
}

// Funciones helper para reportes
export function canViewReports(user: User | null): boolean {
  return (
    hasPermission(user, PERMISSIONS.VIEW_REPORTS) ||
    hasRole(user, ROLES.ADMIN) ||
    hasRole(user, ROLES.COORDINATOR) ||
    hasRole(user, ROLES.TEACHER)
  )
}

export function canGenerateReports(user: User | null): boolean {
  return (
    hasPermission(user, PERMISSIONS.GENERATE_REPORTS) || hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.COORDINATOR)
  )
}

export function canExportReports(user: User | null): boolean {
  return (
    hasPermission(user, PERMISSIONS.EXPORT_REPORTS) || hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.COORDINATOR)
  )
}

// Funciones helper para usuarios
export function canViewUsers(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.VIEW_USER) || hasRole(user, ROLES.ADMIN)
}

export function canManageUsers(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.CHANGE_USER) || hasRole(user, ROLES.ADMIN)
}

export function canAddUsers(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.ADD_USER) || hasRole(user, ROLES.ADMIN)
}

export function canDeleteUsers(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.DELETE_USER) || hasRole(user, ROLES.ADMIN)
}

// Funciones helper para roles/grupos
export function canViewGroups(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.VIEW_GROUP) || hasRole(user, ROLES.ADMIN)
}

export function canManageGroups(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.CHANGE_GROUP) || hasRole(user, ROLES.ADMIN)
}

export function canAddGroups(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.ADD_GROUP) || hasRole(user, ROLES.ADMIN)
}

export function canDeleteGroups(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.DELETE_GROUP) || hasRole(user, ROLES.ADMIN)
}

// Funciones helper para configuraciones
export function canViewSettings(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.VIEW_SETTINGS) || hasRole(user, ROLES.ADMIN)
}

export function canManageSettings(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.CHANGE_SETTINGS) || hasRole(user, ROLES.ADMIN)
}

export function canManageAcademicSettings(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.MANAGE_ACADEMIC_SETTINGS) || hasRole(user, ROLES.ADMIN)
}

export function canManageNotificationSettings(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.MANAGE_NOTIFICATION_SETTINGS) || hasRole(user, ROLES.ADMIN)
}

export function canManageSecuritySettings(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.MANAGE_SECURITY_SETTINGS) || hasRole(user, ROLES.ADMIN)
}

export function canManageBackupSettings(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.MANAGE_BACKUP_SETTINGS) || hasRole(user, ROLES.ADMIN)
}
