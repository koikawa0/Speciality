import { useState, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import Card from "../components/card";
import "./SeeAll.css";

export default function SeeAll() {
	const [searchParams] = useSearchParams();
	const { onPlay } = useOutletContext();
	const [result, setResult] = useState({ url: null, tracks: [], failed: false });

	const query = searchParams.get("q") || "";
	const endpoint = searchParams.get("endpoint") || "";
	const playlistId = searchParams.get("playlistId") || "";
	const albumId = searchParams.get("albumId") || "";
	const albumImage = searchParams.get("albumImage") || "";
	const title = searchParams.get("title") || "Results";

	let url = null;
	if (endpoint) {
		const separator = endpoint.includes("?") ? "&" : "?";
		url = `/deezer-api/${endpoint}${endpoint.includes("limit=") ? "" : `${separator}limit=50`}`;
	} else if (playlistId) {
		url = `/deezer-api/playlist/${playlistId}/tracks?limit=50`;
	} else if (albumId) {
		url = `/deezer-api/album/${albumId}`;
	} else if (query) {
		url = `/deezer-api/search?q=${encodeURIComponent(query)}&limit=50`;
	}

	useEffect(() => {
		document.title = `${title} · Speciality`;
	}, [title]);

	useEffect(() => {
		if (!url) return;
		let cancelled = false;

		fetch(url)
			.then((r) => r.json())
			.then((data) => {
				if (cancelled) return;
				// /album/{id} nests its tracks; everything else uses data.data
				const tracks = albumId ? data.tracks?.data || [] : data.data || [];
				setResult({ url, tracks, failed: false });
			})
			.catch((err) => {
				console.error(err);
				if (!cancelled) setResult({ url, tracks: [], failed: true });
			});

		return () => {
			cancelled = true;
		};
	}, [url, albumId]);

	let status;
	if (!url) status = "empty";
	else if (result.url !== url) status = "loading";
	else if (result.failed) status = "error";
	else status = "ready";

	const tracks = result.url === url ? result.tracks : [];

	const normalizedTracks = tracks
		.filter((t) => t.artist && t.preview && (albumId || t.album))
		.map((t) => ({
			id: t.id,
			title: t.title,
			artist: t.artist.name,
			artistId: t.artist.id,
			image: albumId ? albumImage : t.album.cover_medium,
			preview: t.preview,
			duration: t.duration,
		}));

	if (status === "ready" && normalizedTracks.length === 0) status = "empty";

	return (
		<div className="see-all-page">
			<h1 className="see-all-title">{title}</h1>

			{status === "loading" && <p className="shelf-message">Loading...</p>}
			{status === "error" && (
				<p className="shelf-message">Couldn't load these results. Try again later.</p>
			)}
			{status === "empty" && <p className="shelf-message">No tracks found.</p>}

			{status === "ready" && (
				<div className="see-all-grid">
					{normalizedTracks.map((track, index) => (
						<Card
							key={track.id}
							title={track.title}
							artist={track.artist}
							artistId={track.artistId}
							image={track.image}
							onPlay={() => onPlay(normalizedTracks, index)}
						/>
					))}
				</div>
			)}
		</div>
	);
}