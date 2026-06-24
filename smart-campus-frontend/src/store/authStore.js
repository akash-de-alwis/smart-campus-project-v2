import { create } from 'zustand'
import { authAPI } from '../services/api'

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),

  fetchCurrentUser: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await authAPI.getCurrentUser()
      set({ user: data, loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      return null
    }
  },

  logout: () => {
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))
