import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#217373",
    },
    secondary: {
      main: "#36c6f5",
    },
    error: {
      main: "#f44336",
    },
    info: {
      main: "#9FABB7",
    },
    background: {
      default: "#121212",
    },
  },

  components: {
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
