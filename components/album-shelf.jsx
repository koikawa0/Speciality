import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./shelf.css";

export default function AlbumShelf({ title, endpoint, playlistId }) {
	const scrollRef = useRef(null);
	const [albums, setAlbums] = useState([]);
	const [status, setStatus] = useState("loading");

	useEffect(() => {
		setStatus("loading");

		if (playlistId) {
			fetch(`/deezer-api/playlist/${playlistId}/tracks?limit=200`)
				.then(r => r.json())
				.then(data => {
					const tracks = data.data || [];
					const seen = new Set();
					const uniqueAlbums = [];
					for (const t of tracks) {
						if (t.album && !seen.has(t.album.id)) {
							seen.add(t.album.id);
							uniqueAlbums.push({
								id: t.album.id,
								title: t.album.title,
								cover_medium: t.album.cover_medium,
								artist: t.artist,
							});
						}
					}
					setAlbums(uniqueAlbums);
					setStatus(uniqueAlbums.length === 0 ? "empty" : "ready");
				})
				.catch(() => setStatus("error"));
		} else {
			fetch(`/deezer-api/${endpoint}`)
				.then(r => r.json())
				.then(data => {
					const results = data.data || [];
					setAlbums(results);
					setStatus(results.length === 0 ? "empty" : "ready");
				})
				.catch(() => setStatus("error"));
		}
	}, [endpoint, playlistId]);

	const scroll = (direction) => {
		scrollRef.current.scrollBy({
			left: direction === "left" ? -750 : 750,
			behavior: "smooth",
		});
	};

	return (
		<div className="shelf">
			<div className="shelf-top">
				<div className="shelf-main">
					<p className="shelf-title"><b>{title}</b></p>
				</div>
				<div className="shelf-secondary">
					<div className="nav-buttons">
						<button className="nav-btn" onClick={() => scroll("left")}>‹</button>
						<button className="nav-btn" onClick={() => scroll("right")}>›</button>
					</div>
				</div>
			</div>

			{status === "loading" && (
				<div className="shelf-cards">
					{Array.from({ length: 5 }).map((_, i) => <div className="card-skeleton" key={i} />)}
				</div>
			)}
			{status === "empty" && <p className="shelf-message">No albums found.</p>}
			{status === "error" && <p className="shelf-message">Couldn't load this shelf.</p>}

			{status === "ready" && (
				<div className="shelf-cards" ref={scrollRef}>
					{albums.map((album) => (
						<Link key={album.id} to={`/album/${album.id}`} className="album-shelf-card">
							<img src={album.cover_medium} alt={album.title} />
							<p className="album-shelf-title">{album.title}</p>
							<p className="album-shelf-artist">{album.artist?.name}</p>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}