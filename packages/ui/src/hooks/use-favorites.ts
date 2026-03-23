import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { createElement } from "react";
import { useApiClient } from "../lib/api-context";
import { useAuth } from "../lib/auth-context";

// --- Types ---

type FavoritesContextValue = {
  favorites: Set<string>;
  isLoaded: boolean;
  toggle: (skillId: string) => void;
  checkFavorites: (ids: string[]) => Promise<void>;
};

// --- Context ---

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: new Set(),
  isLoaded: false,
  toggle: () => {},
  checkFavorites: async () => {},
});

// --- Provider ---

export function FavoritesProvider({
  children,
  initialSkillIds,
}: {
  children: ReactNode;
  initialSkillIds?: string[];
}) {
  const api = useApiClient();
  const auth = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const checkedRef = useRef<Set<string>>(new Set());

  // Check auth and do initial batch check
  useEffect(() => {
    auth.isAuthenticated().then((authed) => {
      if (authed) {
        setIsAuthed(true);
        if (initialSkillIds && initialSkillIds.length > 0) {
          doCheck(initialSkillIds);
        } else {
          setIsLoaded(true);
        }
      } else {
        setIsLoaded(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doCheck(ids: string[]) {
    // Filter out already-checked IDs
    const newIds = ids.filter((id) => !checkedRef.current.has(id));
    if (newIds.length === 0) {
      setIsLoaded(true);
      return;
    }

    // Mark as checked
    newIds.forEach((id) => checkedRef.current.add(id));

    const res = await api.post<{ favorited: string[] }>("/api/favorites/check", {
      skillIds: newIds,
    });

    if (res.ok) {
      setFavorites((prev) => {
        const next = new Set(prev);
        for (const id of res.data.favorited) {
          next.add(id);
        }
        return next;
      });
    }
    setIsLoaded(true);
  }

  const checkFavorites = useCallback(
    async (ids: string[]) => {
      if (!isAuthed || ids.length === 0) return;
      await doCheck(ids);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthed]
  );

  const toggle = useCallback(
    (skillId: string) => {
      if (!isAuthed) {
        // Redirect to sign-in via auth adapter
        auth.signIn("github", window.location.pathname);
        return;
      }

      const wasFavorited = favorites.has(skillId);

      // Optimistic update
      setFavorites((prev) => {
        const next = new Set(prev);
        if (wasFavorited) {
          next.delete(skillId);
        } else {
          next.add(skillId);
        }
        return next;
      });

      // Fire API call
      const request = wasFavorited
        ? api.delete(`/api/favorites/${encodeURIComponent(skillId)}`)
        : api.post("/api/favorites", { skillId });

      request.then((res) => {
        if (!res.ok) {
          // Revert on error
          setFavorites((prev) => {
            const next = new Set(prev);
            if (wasFavorited) {
              next.add(skillId);
            } else {
              next.delete(skillId);
            }
            return next;
          });
        }
      });
    },
    [isAuthed, favorites, api, auth]
  );

  return createElement(
    FavoritesContext.Provider,
    { value: { favorites, isLoaded, toggle, checkFavorites } },
    children
  );
}

// --- Hook ---

export function useFavorites() {
  return useContext(FavoritesContext);
}
