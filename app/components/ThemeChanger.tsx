import { IconButton } from "@radix-ui/themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

interface ThemeChangerProps {
  iconSize: number;
}

export function ThemeChanger({ iconSize }: ThemeChangerProps) {
  const { theme, setTheme } = useTheme();

  return (
    <IconButton
      size="4"
      variant="ghost"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="切换主题"
    >
      {theme === "light" ? (
        <MoonIcon width={iconSize} height={iconSize} />
      ) : (
        <SunIcon width={iconSize} height={iconSize} />
      )}
    </IconButton>
  );
}
