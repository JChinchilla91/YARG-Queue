import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { usePlayer } from '../context/PlayerContext';
import { fetchHealth } from '../api/client';
import type { JoinUrl } from '../api/types';

export function JoinPage() {
	const { name, setName } = usePlayer();
	const [input, setInput] = useState(name);
	const [joinUrls, setJoinUrls] = useState<JoinUrl[]>([]);
	const [mode, setMode] = useState<string>('');
	const navigate = useNavigate();

	useEffect(() => {
		fetchHealth()
			.then((h) => {
				setJoinUrls(h.joinUrls ?? []);
				setMode(h.mode ?? '');
			})
			.catch(() => {});
	}, []);

	const submit = () => {
		if (!input.trim()) return;
		setName(input);
		navigate('/');
	};

	const preferred = joinUrls.filter((u) => u.preferred);
	const others = joinUrls.filter((u) => !u.preferred);
	const show = preferred.length > 0 ? preferred : joinUrls;

	return (
		<Paper sx={{ p: 3, maxWidth: 480, mx: 'auto' }}>
			<Typography variant="h5" gutterBottom>
				Join the queue
			</Typography>
			<Typography color="text.secondary" paragraph>
				Enter a display name so others can see who requested each song.
			</Typography>
			<TextField
				label="Your name"
				fullWidth
				autoFocus
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={(e) => e.key === 'Enter' && submit()}
				sx={{ mb: 2 }}
			/>
			<Button variant="contained" fullWidth onClick={submit} disabled={!input.trim()}>
				Continue
			</Button>
		</Paper>
	);
}
