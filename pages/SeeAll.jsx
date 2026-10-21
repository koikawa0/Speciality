import { useState, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import Card from "../components/card";
import "./SeeAll.css";

export default function SeeAll() {
	const [searchParams] = useSearchParams()
	const { onPlay } = useOutletContext()
	const [result, setResult] = useState({ url: null, tracks: [] })

	const query = searchParams.get("q") || "";
	const endpoint = searchParams.get("endpoint") || "";
	const playlistId = searchParams.get("playlistId") || "";
	const title = searchParams.get("title") || "Results";

	let url = null;
	if (endpoint) {
		const separator = endpoint.includes("?") ? "&" : "?";
		url = `/deezer-api/${endpoint}${endpoint.includes("limit=") ? "" : `${separator}limit=50`}`;
	} else if (playlistId) {
		url = `/deezer-api/playlist/${playlistId}/tracks?limit=50`;
	} else if (query) {
		url = `/deezer-api/search?q=${encodeURIComponent(query)}&limit=50`;
	}

	useEffect(() => {
		if (!url) return;
		let cancelled = false;

		fetch(url)
			.then((r) => r.json())
			.then((data) => {
				if (!cancelled) setResult({ url, tracks: data.data || [] });
			})
			.catch(console.error);

		return () => {
			cancelled = true;
		};
	}, [url]);

	const tracks = result.url === url ? result.tracks : [];

	const normalizedTracks = tracks
		.filter((t) => t.album && t.artist && t.preview)
		.map((t) => ({
			id: t.id,
			title: t.title,
			artist: t.artist.name,
			artistId: t.artist.id,
			image: t.album.cover_medium,
			preview: t.preview,
			duration: t.duration,
		}));

	return (
		<div className="see-all-page">
			<h1 className="see-all-title">{title}</h1>
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
		</div>
	)
}