import { useState, useEffect, useRef } from "react";
import Modal from "./about.jsx";
import "./search.css";

export default function SearchModal({ isOpen, onClose, onPlay }) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const debounceRef = useRef(null);

	useEffect(() => {
		clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			if (!query.trim()) {
				setResults([]);
				setLoading(false);
				return;
			}
			setLoading(true);
			fetch(`/deezer-api/search?q=${encodeURIComponent(query)}`)
				.then((r) => r.json())
				.then((data) => setResults(data.data || []))
				.catch(console.error)
				.finally(() => setLoading(false));
		}, 400);
	
		return () => clearTimeout(debounceRef.current);
	}, [query]);

	function handleSelect(track) {
		const normalized = {
			title: track.title,
			artist: track.artist.name,
			image: track.album.cover_medium,
			preview: track.preview,
			duration: track.duration,
		};
		onPlay([normalized], 0)
		onClose();
		setQuery("");
		setResults([]);
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Search">
			<input
				type="text"
				autoFocus
				placeholder="Search for a song..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				className="search-modal-input"
			/>
			<div className="search-modal-results">
				{loading && <p>Searching...</p>}
				{!loading && results.map((track) => (
					<div
						key={track.id}
						className="search-result"
						onClick={() => handleSelect(track)}
					>
						<img src={track.album.cover_small} alt={track.title} />
						<div className="search-result-info">
							<p className="search-result-title">{track.title}</p>
							<p className="search-result-artist">{track.artist.name}</p>
						</div>
					</div>
				))}
			</div>
		</Modal>
	);
}