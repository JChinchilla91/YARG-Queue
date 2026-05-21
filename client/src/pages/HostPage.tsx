import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { hostAction } from '../api/client';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../hooks/useQueue';

export function HostPage() {
  const { hostPin, setHostPin } = usePlayer();
  const { queue, error, refresh } = useQueue(1500);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pinRequired, setPinRequired] = useState(false);

  const run = async (path: string, method: 'POST' | 'DELETE') => {
    setActionError(null);
    try {
      await hostAction(path, method, hostPin || undefined);
      refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Action failed';
      setActionError(msg);
      if (msg.toLowerCase().includes('pin')) setPinRequired(true);
    }
  };

  const allEntries = [
    ...(queue?.nowPlaying ? [queue.nowPlaying] : []),
    ...(queue?.queue ?? []),
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Host controls
        </Typography>
        <Typography color="text.secondary" paragraph>
          Mark what is playing in YARG, then clear it when the song ends. Add the top
          queued song to YARG&apos;s setlist manually.
        </Typography>
        <TextField
          label="Host PIN (optional)"
          type="password"
          fullWidth
          value={hostPin}
          onChange={(e) => setHostPin(e.target.value)}
          helperText={
            pinRequired
              ? 'Server requires HOST_PIN — set the same value when starting the server'
              : 'Set HOST_PIN on the server to protect these actions'
          }
          sx={{ mb: 2 }}
        />
        <Button
          variant="outlined"
          color="warning"
          onClick={() => run('/api/queue/clear', 'POST')}
        >
          Clear queue
        </Button>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {actionError ? <Alert severity="error">{actionError}</Alert> : null}

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Manage entries
        </Typography>
        <List>
          {allEntries.map((entry) => (
            <ListItem
              key={entry.id}
              secondaryAction={
                <Box>
                  <IconButton
                    title="Set as now playing"
                    onClick={() => run(`/api/queue/${entry.id}/playing`, 'POST')}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                  <IconButton
                    title="Mark played"
                    onClick={() => run(`/api/queue/${entry.id}/played`, 'POST')}
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    title="Remove"
                    color="error"
                    onClick={() => run(`/api/queue/${entry.id}`, 'DELETE')}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={entry.title}
                secondary={`${entry.artist} · @${entry.requestedBy} · ${entry.status}`}
              />
            </ListItem>
          ))}
          {allEntries.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Queue is empty.
            </Typography>
          ) : null}
        </List>
      </Paper>
    </Box>
  );
}
