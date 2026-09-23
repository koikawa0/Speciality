import { useState, useEffect, useRef } from "react";
import Modal from "./about.jsx";
import "./search-modal.css";

export default function AddShelfModal({ isOpen, onClose, onAddShelf }) {
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
			fetch(`/deezer-api/search/artist?q=${encodeURIComponent(query)}`)
				.then((r) => r.json())
				.then((data) => setResults(data.data || []))
				.catch(console.error)
				.finally(() => setLoading(false));
		}, 400);
		return () => clearTimeout(debounceRef.current);
	}, [query]);

	function handleSelect(artist) {
		onAddShelf({ title: artist.name, query: artist.name });
		onClose();
		setQuery("");
		setResults([]);
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Add a shelf">
			<input
				type="text"
				autoFocus
				placeholder="Search for an artist..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				className="search-modal-input"
			/>
			<div className="search-modal-results">
				{loading && <p>Searching...</p>}
				{!loading &&
					results.map((artist) => (
						<div
							key={artist.id}
							className="search-result"
							onClick={() => handleSelect(artist)}
						>
							<img src={artist.picture_small} alt={artist.name} />
							<div className="search-result-info">
								<p className="search-result-title">
									{artist.name}
								</p>
							</div>
						</div>
					))}
			</div>
		</Modal>
	);
}
