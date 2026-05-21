import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { overlayTheme } from '../theme';
import { useQueue } from '../hooks/useQueue';

/**
 * Transparent-friendly view for the Electron overlay window.
 * Route: /overlay
 */
export function OverlayPage() {
  const { queue } = useQueue(1000);

  const upNext = queue?.queue ?? [];
  const nowPlaying = queue?.nowPlaying;

  return (
    <ThemeProvider theme={overlayTheme}>
      <CssBaseline />
      <Box
        sx={{
          p: 1.5,
          minWidth: 280,
          maxWidth: 360,
          bgcolor: 'transparent',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 1.5,
            bgcolor: 'rgba(18, 18, 18, 0.88)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: 'secondary.main', letterSpacing: 2, fontWeight: 700 }}
          >
            YARG Party Queue
          </Typography>

          {nowPlaying ? (
            <Box sx={{ mt: 1, mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                NOW PLAYING
              </Typography>
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                {nowPlaying.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {nowPlaying.artist} · @{nowPlaying.requestedBy}
              </Typography>
            </Box>
          ) : null}

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            UP NEXT
          </Typography>

          {upNext.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Queue empty
            </Typography>
          ) : (
            upNext.slice(0, 8).map((entry, i) => (
              <Box key={entry.id} sx={{ display: 'flex', gap: 1, py: 0.35 }}>
                <Typography
                  variant="body2"
                  sx={{ minWidth: 18, opacity: i === 0 ? 1 : 0.55, fontWeight: i === 0 ? 700 : 400 }}
                >
                  {i + 1}.
                </Typography>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" fontWeight={i === 0 ? 700 : 500} noWrap>
                    {entry.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    @{entry.requestedBy}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
