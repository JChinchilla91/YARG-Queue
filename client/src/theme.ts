import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#000000', contrastText: '#ffffff' },
    secondary: { main: '#616161' },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#616161',
    },
    divider: '#2b2b2b',
    // keep distinct colors for alerts/icons
    success: { main: '#4caf50' },
    error: { main: '#f44336' },
    info: { main: '#0288d1' },
    warning: { main: '#ff9800' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export const overlayTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ffffff' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'transparent',
        },
      },
    },
  },
});
