import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#500000",
      light: "#ce6c52",
      dark: "#232323",
    },
    secondary: {
      main: "#ff5b5c",
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
