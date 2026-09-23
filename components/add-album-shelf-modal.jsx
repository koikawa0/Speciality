import { useState, useEffect, useRef } from "react";
import Modal from "./about.jsx";
import "./search-modal.css";

export default function AddAlbumShelfModal({ isOpen, onClose, onAddShelf }) {
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
			fetch(`/deezer-api/search/album?q=${encodeURIComponent(query)}`)
				.then((r) => r.json())
				.then((data) => setResults(data.data || []))
				.catch(console.error)
				.finally(() => setLoading(false));
		}, 400);

		return () => clearTimeout(debounceRef.current);
	}, [query]);

	function handleSelect(album) {
		onAddShelf({
			id: `album-${album.id}`,
			title: `${album.title} — ${album.artist.name}`,
			albumId: album.id,
			albumImage: album.cover_medium,
		});
		onClose();
		setQuery("");
		setResults([]);
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Add an album shelf">
			<input
				type="text"
				autoFocus
				placeholder="Search for an album..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				className="search-modal-input"
			/>
			<div className="search-modal-results">
				{loading && <p>Searching...</p>}
				{!loading && results.map((album) => (
					<div
						key={album.id}
						className="search-result"
						onClick={() => handleSelect(album)}
					>
						<img src={album.cover_small} alt={album.title} />
						<div className="search-result-info">
							<p className="search-result-title">{album.title}</p>
							<p className="search-result-artist">{album.artist.name}</p>
						</div>
					</div>
				))}
			</div>
		</Modal>
	);
}