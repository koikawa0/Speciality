import { useState, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import Card from "../components/card";
import "./SeeAll.css";

export default function SeeAll() {
	const [searchParams] = useSearchParams()
	const { onPlay } = useOutletContext()
	const [tracks, setTracks] = useState([])

	const query = searchParams.get("q") || "";
	const title = searchParams.get("title") || "Results";

	useEffect(() => {
		if (!query) return;
		fetch(`/deezer-api/search?q=${encodeURIComponent(query)}&limit=50`)
			.then((r) => r.json())
			.then((data) => setTracks(data.data || []))
			.catch(console.error);
	}, [query]);

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