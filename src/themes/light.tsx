import { createTheme, adaptV4Theme } from "@mui/material";

export const theme = createTheme(adaptV4Theme({
  palette: {
    mode: 'light',
    primary: {
      '50': '#ebe3e2',
      '100': '#cdb9b8',
      '200': '#ac8b88',
      '300': '#8b5d58',
      '400': '#723a35',
      '500': '#591711',
      '600': '#51140f',
      '700': '#48110c',
      '800': '#3e0d0a',
      '900': '#2e0705',
      'A100': '#ff6d68',
      'A200': '#ff3c35',
      'A400': '#ff0b02',
      'A700': '#e70800',
    },
    secondary: {
      50: '#e5e1e1',
      100: '#beb4b4',
      200: '#938383',
      300: '#675151',
      400: '#472b2b',
      500: '#260606',
      600: '#220505',
      700: '#1c0404',
      800: '#170303',
      900: '#0d0202',
      A100: '#ff5151',
      A200: '#ff1e1e',
      A400: '#ea0000',
      A700: '#d00000',
    },
    text:{
      primary:"#222"
    },
    background: {
      paper: '#fefefe',
      default: "#fff"
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
