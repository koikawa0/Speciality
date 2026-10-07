import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./about.jsx";
import "./search-modal.css";

const TABS = [
	{ key: "track", label: "Tracks", endpoint: "search/track" },
	{ key: "album", label: "Albums", endpoint: "search/album" },
	{ key: "artist", label: "Artists", endpoint: "search/artist" },
];

export default function SearchModal({ isOpen, onClose, onPlay }) {
	const [query, setQuery] = useState("");
	const [activeTab, setActiveTab] = useState("track");
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const debounceRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		clearTimeout(debounceRef.current);

		debounceRef.current = setTimeout(() => {
			if (!query.trim()) {
				setResults([]);
				setLoading(false);
				return;
			}
			setLoading(true);
			const endpoint = TABS.find((t) => t.key === activeTab).endpoint;
			fetch(`/deezer-api/${endpoint}?q=${encodeURIComponent(query)}`)
				.then((r) => r.json())
				.then((data) => setResults(data.data || []))
				.catch(console.error)
				.finally(() => setLoading(false));
		}, 400);

		return () => clearTimeout(debounceRef.current);
	}, [query, activeTab]);

	function handleClose() {
		onClose();
		setQuery("");
		setResults([]);
	}

	function handleSelectTrack(track) {
		const normalized = {
			id: track.id,
			title: track.title,
			artist: track.artist.name,
			artistId: track.artist.id,
			image: track.album?.cover_medium,
			preview: track.preview,
			duration: track.duration,
		};
		onPlay([normalized], 0);
		handleClose();
	}

	function handleSelectAlbum(album) {
		navigate(`/album/${album.id}`);
		handleClose();
	}

	function handleSelectArtist(artist) {
		navigate(`/artist/${artist.id}`);
		handleClose();
	}

	function renderResult(item) {
		if (activeTab === "track") {
			return (
				<div key={item.id} className="search-result" onClick={() => handleSelectTrack(item)}>
					<img src={item.album?.cover_small} alt={item.title} />
					<div className="search-result-info">
						<p className="search-result-title">{item.title}</p>
						<p className="search-result-artist">{item.artist.name}</p>
					</div>
				</div>
			);
		}
		if (activeTab === "album") {
			return (
				<div key={item.id} className="search-result" onClick={() => handleSelectAlbum(item)}>
					<img src={item.cover_small} alt={item.title} />
					<div className="search-result-info">
						<p className="search-result-title">{item.title}</p>
						<p className="search-result-artist">{item.artist.name}</p>
					</div>
				</div>
			);
		}
		// artist
		return (
			<div key={item.id} className="search-result" onClick={() => handleSelectArtist(item)}>
				<img src={item.picture_small} alt={item.name} />
				<div className="search-result-info">
					<p className="search-result-title">{item.name}</p>
				</div>
			</div>
		);
	}

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Search">
			<div className="search-modal-tabs">
				{TABS.map((tab) => (
					<button
						key={tab.key}
						className={`search-modal-tab ${activeTab === tab.key ? "active" : ""}`}
						onClick={() => setActiveTab(tab.key)}
					>
						{tab.label}
					</button>
				))}
			</div>

			<input
				type="text"
				autoFocus
				placeholder={`Search ${activeTab === "track" ? "songs" : activeTab === "album" ? "albums" : "artists"}...`}
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				className="search-modal-input"
			/>
			<div className="search-modal-results">
				{loading && <p>Searching...</p>}
				{!loading && results.map((item) => renderResult(item))}
			</div>
		</Modal>
	);
}