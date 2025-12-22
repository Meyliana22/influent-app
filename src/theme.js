import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6E00BE',
      dark: '#5a009e',
      light: '#f3e5f5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6E00BE',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6E00BE',
          },
        },
      },
    },
    // Ensure Select components also pick up the styling if they aren't fully covered by OutlinedInput
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: '#6E00BE',
        },
      },
    },
  },
});

export default theme;
