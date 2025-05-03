import { create } from "zustand";

// Create Zustand store for theme
const useThemeStore = create((set) => ({
    theme: localStorage.getItem("theme") || "light", // Load theme from localStorage
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === "light" ? "dark" : "light";
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        localStorage.setItem("theme", newTheme);
        return { theme: newTheme };
    })
}));

export default useThemeStore;
