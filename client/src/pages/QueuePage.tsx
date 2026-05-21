import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { QueueList } from '../components/QueueList';
import { useQueue } from '../hooks/useQueue';

export function QueuePage() {
  const { queue, error, loading } = useQueue(1500);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Party queue
      </Typography>
      <Typography color="text.secondary" paragraph>
        First in, first out — the top song is next after the current one finishes.
      </Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading && !queue ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : null}
      {queue ? <QueueList nowPlaying={queue.nowPlaying} queue={queue.queue} /> : null}
    </Paper>
  );
}
