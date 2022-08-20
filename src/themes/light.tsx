import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#D8CCBE",
      light: "#ce6c52",
      dark: "#232323",
    },
    secondary: {
      main: "#B8906D",
    },
    error: {
      main: "#f44336",
    },
    info: {
      main: "#9FABB7",
    },
  },

  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          color: "inherit",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "standard",
      },
    },
    MuiButton: {
      defaultProps: {
        color: "secondary",
      },
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: "standard",
      },
    },
    MuiInputLabel: {
      defaultProps: {
        variant: "standard",
      },
    },
    MuiSwitch: {
      defaultProps: {
        color: "secondary",
      },
    },
    MuiCheckbox: {
      defaultProps: {
        color: "secondary",
      },
    },
  },
});

export default theme;
