import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import { fetchSongs, submitRequest } from '../api/client';
import type { Song } from '../api/types';
import { usePlayer } from '../context/PlayerContext';
import { useQueue } from '../hooks/useQueue';
import { QueueList } from '../components/QueueList';

export function RequestPage() {
	const { name } = usePlayer();
	const [query, setQuery] = useState('');
	const [songs, setSongs] = useState<Song[]>([]);
	const [searching, setSearching] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const { queue, refresh } = useQueue(3000);

	const search = useCallback(async (q: string) => {
		setSearching(true);
		try {
			const { songs: results } = await fetchSongs(q);
			setSongs(results);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Search failed');
		} finally {
			setSearching(false);
		}
	}, []);

	useEffect(() => {
		const id = window.setTimeout(() => search(query), 300);
		return () => window.clearTimeout(id);
	}, [query, search]);

	const requestSong = async (song: Song) => {
		setError(null);
		try {
			await submitRequest(song.id, name);
			setMessage(`Added "${song.title}" to the queue`);
			refresh();
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Request failed');
		}
	};

	if (!name) return <Navigate to="/join" replace />;

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Paper sx={{ p: 2 }}>
				<Typography variant="h6" gutterBottom>
					Request a song
				</Typography>
				<TextField
					label="Search your library"
					fullWidth
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Title or artist…"
				/>
				{searching ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
						<CircularProgress size={28} />
					</Box>
				) : (
					<List>
						{songs.map((song) => (
							<ListItem key={song.id} disablePadding divider>
								<ListItemButton onClick={() => requestSong(song)} disabled={song.queued}>
									<ListItemText
										primary={song.title}
										secondary={[song.artist, song.album].filter(Boolean).join(' · ')}
									/>
									{song.queued ? (
										<Chip label="In queue" size="small" />
									) : (
										<Button size="small" variant="outlined">
											Request
										</Button>
									)}
								</ListItemButton>
							</ListItem>
						))}
						{!searching && songs.length === 0 ? (
							<Typography color="text.secondary" sx={{ py: 2, px: 2 }}>
								No songs found. Run <code>npm run index-songs</code> on the host PC.
							</Typography>
						) : null}
					</List>
				)}
			</Paper>

			<Paper sx={{ p: 2 }}>
				<Typography variant="h6" gutterBottom>
					Up next
				</Typography>
				{queue ? (
					<QueueList nowPlaying={queue.nowPlaying} queue={queue.queue} />
				) : (
					<CircularProgress size={24} />
				)}
			</Paper>

			<Snackbar
				open={Boolean(message)}
				autoHideDuration={4000}
				message={message}
				onClose={() => setMessage(null)}
			/>
			<Snackbar open={Boolean(error)} message={error} onClose={() => setError(null)} />
		</Box>
	);
}
