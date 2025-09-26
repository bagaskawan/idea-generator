import { useMemo } from "react";
import { useTheme } from "next-themes";
import { darkDefaultTheme, lightDefaultTheme, Theme } from "@blocknote/mantine";

// Membuat tema terang dengan latar belakang transparan
const transparentLightTheme: Theme = {
  ...lightDefaultTheme,
  colors: {
    ...lightDefaultTheme.colors,
    editor: {
      ...lightDefaultTheme.colors.editor,
      background: "transparent",
    },
  },
};

// Membuat tema gelap dengan latar belakang transparan
const transparentDarkTheme: Theme = {
  ...darkDefaultTheme,
  colors: {
    ...darkDefaultTheme.colors,
    editor: {
      ...darkDefaultTheme.colors.editor,
      background: "transparent",
    },
  },
};

/**
 * Hook untuk mendapatkan tema BlockNote dengan latar belakang transparan
 * yang beradaptasi dengan mode terang/gelap aplikasi.
 */
export function useBlocknoteTheme() {
  const { resolvedTheme } = useTheme();

  // Gunakan useMemo agar tema tidak dibuat ulang pada setiap render
  const theme = useMemo(() => {
    return resolvedTheme === "dark"
      ? transparentDarkTheme
      : transparentLightTheme;
  }, [resolvedTheme]);

  return theme;
}
