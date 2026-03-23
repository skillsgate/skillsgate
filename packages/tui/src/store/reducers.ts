import type { AppState, Action } from "./types.js"

export const initialState: AppState = {
  activeView: "home",
  previousView: null,
  auth: null,
  detectedAgents: [],
  selectedAgentFilter: "all",
  installedSkills: [],
  installedLoading: true,
  installedFilter: "",
  searchQuery: "",
  searchResults: [],
  searchLoading: false,
  favorites: [],
  favoritesLoading: false,
  selectedSkill: null,
  notification: null,
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "NAVIGATE":
      return {
        ...state,
        previousView: state.activeView,
        activeView: action.view,
      }

    case "GO_BACK":
      if (!state.previousView) return state
      return {
        ...state,
        activeView: state.previousView,
        previousView: null,
      }

    case "SET_AUTH":
      return { ...state, auth: action.auth }

    case "SET_DETECTED_AGENTS":
      return { ...state, detectedAgents: action.agents }

    case "SET_AGENT_FILTER":
      return { ...state, selectedAgentFilter: action.filter }

    case "SET_INSTALLED_SKILLS":
      return { ...state, installedSkills: action.skills, installedLoading: false }

    case "SET_INSTALLED_LOADING":
      return { ...state, installedLoading: action.loading }

    case "SET_INSTALLED_FILTER":
      return { ...state, installedFilter: action.filter }

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.query }

    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.results, searchLoading: false }

    case "SET_SEARCH_LOADING":
      return { ...state, searchLoading: action.loading }

    case "SET_FAVORITES":
      return { ...state, favorites: action.favorites, favoritesLoading: false }

    case "SET_FAVORITES_LOADING":
      return { ...state, favoritesLoading: action.loading }

    case "SELECT_SKILL":
      return {
        ...state,
        selectedSkill: action.skill,
        previousView: state.activeView,
        activeView: "detail",
      }

    case "CLEAR_SKILL":
      return { ...state, selectedSkill: null }

    case "SHOW_NOTIFICATION":
      return { ...state, notification: action.notification }

    case "CLEAR_NOTIFICATION":
      return { ...state, notification: null }

    default:
      return state
  }
}
