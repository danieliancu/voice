import { createContext, useContext, useState } from "react";

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const [soundOn, setSoundOn] = useState(true);
  return (
    <SoundContext.Provider value={{ soundOn, setSoundOn }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
