import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const NAME_KEY = 'yarg-party-player-name';
const PIN_KEY = 'yarg-party-host-pin';

interface PlayerContextValue {
  name: string;
  setName: (name: string) => void;
  hostPin: string;
  setHostPin: (pin: string) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [name, setNameState] = useState(() => localStorage.getItem(NAME_KEY) ?? '');
  const [hostPin, setHostPinState] = useState(() => localStorage.getItem(PIN_KEY) ?? '');

  const setName = useCallback((value: string) => {
    const trimmed = value.trim();
    setNameState(trimmed);
    if (trimmed) localStorage.setItem(NAME_KEY, trimmed);
    else localStorage.removeItem(NAME_KEY);
  }, []);

  const setHostPin = useCallback((value: string) => {
    setHostPinState(value);
    if (value) localStorage.setItem(PIN_KEY, value);
    else localStorage.removeItem(PIN_KEY);
  }, []);

  const value = useMemo(
    () => ({ name, setName, hostPin, setHostPin }),
    [name, hostPin, setName, setHostPin]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
