import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { usePlayer } from '../context/PlayerContext';

const nav = [
  { to: '/', label: 'Request' },
  { to: '/queue', label: 'Queue' },
  { to: '/host', label: 'Host' },
];

export function AppLayout() {
  const { pathname } = useLocation();
  const { name } = usePlayer();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <QueueMusicIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            YARG Party Queue
          </Typography>
          {name ? (
            <Typography variant="body2" sx={{ mr: 2, opacity: 0.85 }}>
              {name}
            </Typography>
          ) : null}
          {nav.map((item) => (
            <Button
              key={item.to}
              component={RouterLink}
              to={item.to}
              color="inherit"
              sx={{
                opacity: pathname === item.to ? 1 : 0.7,
                fontWeight: pathname === item.to ? 700 : 400,
              }}
            >
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Outlet />
      </Container>
      <Box component="footer" sx={{ py: 2, textAlign: 'center', opacity: 0.6 }}>
        <Typography variant="caption">
          <Link component={RouterLink} to="/join" underline="hover">
            change name
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
