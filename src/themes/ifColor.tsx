import { _currentTheme } from "@/components/settings";

export const defaultBackground = () => {
  const _ = _currentTheme();
  if (_ === "dark") return "#121212";
  if (_ === "deepsea") return "#000d19";
  return "#fff";
};
