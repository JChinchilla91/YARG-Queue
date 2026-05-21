import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import type { QueueEntry } from '../api/types';

interface QueueListProps {
  nowPlaying: QueueEntry | null;
  queue: QueueEntry[];
  showPosition?: boolean;
  dense?: boolean;
}

export function QueueList({
  nowPlaying,
  queue,
  showPosition = true,
  dense = false,
}: QueueListProps) {
  if (!nowPlaying && queue.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No songs in the queue yet. Be the first to request one!
      </Typography>
    );
  }

  return (
    <List dense={dense} disablePadding>
      {nowPlaying ? (
        <ListItem
          sx={{
            bgcolor: 'primary.dark',
            borderRadius: 1,
            mb: 1,
          }}
        >
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Now playing" size="small" color="secondary" />
                <Typography fontWeight={700}>{nowPlaying.title}</Typography>
              </Box>
            }
            secondary={`${nowPlaying.artist || 'Unknown artist'} · @${nowPlaying.requestedBy}`}
          />
        </ListItem>
      ) : null}
      {queue.map((entry, index) => (
        <ListItem key={entry.id} divider={index < queue.length - 1}>
          <ListItemText
            primary={
              <Typography fontWeight={index === 0 ? 700 : 500}>
                {showPosition ? `${index + 1}. ` : ''}
                {entry.title}
              </Typography>
            }
            secondary={`${entry.artist || 'Unknown artist'} · @${entry.requestedBy}`}
          />
        </ListItem>
      ))}
    </List>
  );
}
