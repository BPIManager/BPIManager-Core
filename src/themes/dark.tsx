import { createTheme, adaptV4Theme } from "@mui/material";

export const theme = createTheme(adaptV4Theme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1a1a1a',
      light: '#ce6c52',
      dark: '#232323',
    },
    secondary: {
      main: '#ffa247',
    },
    background: {
      default: '#0a0a0a',
    },
  },

  props: {
    MuiTextField:{
      variant:"standard"
    },
    MuiButton: {
      color: "secondary"
    },
    MuiSelect: {
      variant: 'standard',
    },
    MuiInputLabel: {
      variant: 'standard',
    },
    MuiSwitch: {
      color: "secondary"
    },
    MuiCheckbox: {
      color: "secondary"
    }
  },

  overrides: {
    MuiButton: {
      root: {
        textTransform: 'none',
      },
    },
  },
}));

export default theme;
