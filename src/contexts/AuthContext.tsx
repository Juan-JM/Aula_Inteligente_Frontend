"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { authApi } from "@/lib/api"
import type { AuthState, User, LoginRequest } from "@/types/auth"

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "SET_LOADING"; payload: boolean }

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case "UPDATE_USER":
      return { ...state, user: action.payload }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token")
      if (token) {
        try {
          const user = await authApi.getProfile()
          dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } })
        } catch (error) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          dispatch({ type: "LOGIN_FAILURE" })
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    dispatch({ type: "LOGIN_START" })
    try {
      const response = await authApi.login(credentials)
      localStorage.setItem("access_token", response.access)
      localStorage.setItem("refresh_token", response.refresh)
      dispatch({ type: "LOGIN_SUCCESS", payload: { user: response.user, token: response.access } })
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" })
      throw error
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      dispatch({ type: "LOGOUT" })
    }
  }

  const updateUser = (user: User) => {
    dispatch({ type: "UPDATE_USER", payload: user })
  }

  return <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
