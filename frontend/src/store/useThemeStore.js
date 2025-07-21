import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chhavinity-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("chhavinity-theme", theme);
    set({ theme });
  },
}));
