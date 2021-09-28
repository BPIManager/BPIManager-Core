import { createTheme,  } from "@mui/material";

export const theme = createTheme(({
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

  components: {
    MuiTextField:{
      defaultProps:{
        variant:"standard"
      }
    },
    MuiButton: {
      defaultProps:{
        color: "secondary"
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
        }
      }
    },
    MuiSelect: {
      defaultProps:{
        variant: 'standard',
      }
    },
    MuiInputLabel: {
      defaultProps:{
        variant: 'standard',
      }
    },
    MuiSwitch: {
      defaultProps:{
        color: "secondary"
      }
    },
    MuiCheckbox: {
      defaultProps:{
        color: "secondary"
      }
    },
  },
}));

export default theme;
