import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./shelf.css";

export default function AlbumShelf({ title, endpoint, playlistId }) {
	const scrollRef = useRef(null);
	const [result, setResult] = useState({ url: null, albums: [], failed: false });

	const isPlaylist = Boolean(playlistId);
	const url = isPlaylist
		? `/deezer-api/playlist/${playlistId}/tracks?limit=200`
		: `/deezer-api/${endpoint}`;

	useEffect(() => {
		let cancelled = false;

		fetch(url)
			.then((r) => r.json())
			.then((data) => {
				if (cancelled) return;
				const items = data.data || [];
				let albums = items;

				if (isPlaylist) {
					const seen = new Set();
					albums = [];
					for (const t of items) {
						if (t.album && !seen.has(t.album.id)) {
							seen.add(t.album.id);
							albums.push({
								id: t.album.id,
								title: t.album.title,
								cover_medium: t.album.cover_medium,
								artist: t.artist,
							});
						}
					}
				}

				setResult({ url, albums, failed: false });
			})
			.catch(() => {
				if (!cancelled) setResult({ url, albums: [], failed: true });
			});

		return () => {
			cancelled = true;
		};
	}, [url, isPlaylist]);

	let status;
	if (result.url !== url) status = "loading";
	else if (result.failed) status = "error";
	else if (result.albums.length === 0) status = "empty";
	else status = "ready";

	const albums = result.url === url ? result.albums : [];

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