import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { appTheme } from './theme';
import { PlayerProvider } from './context/PlayerContext';
import { AppLayout } from './components/AppLayout';
import { JoinPage } from './pages/JoinPage';
import { RequestPage } from './pages/RequestPage';
import { QueuePage } from './pages/QueuePage';
import { HostPage } from './pages/HostPage';
import { OverlayPage } from './pages/OverlayPage';

export default function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <PlayerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/overlay" element={<OverlayPage />} />
            <Route element={<AppLayout />}>
              <Route path="/join" element={<JoinPage />} />
              <Route path="/" element={<RequestPage />} />
              <Route path="/queue" element={<QueuePage />} />
              <Route path="/host" element={<HostPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PlayerProvider>
    </ThemeProvider>
  );
}
