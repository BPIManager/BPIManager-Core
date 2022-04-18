import { _currentTheme } from "@/components/settings";

export const defaultBackground = () => {
  const _ = _currentTheme();
  if (_ === "dark") return "#0a0a0a";
  if (_ === "deepsea") return "#000d19";
  return "#fff";
};
