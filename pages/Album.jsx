import { useEffect, useState } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { PlayIcon } from "../src/icons";
import "./Album.css";

export default function Album() {
	const { id } = useParams();
	const { onPlay } = useOutletContext();
	const [album, setAlbum] = useState(null);
	const [status, setStatus] = useState("loading");

	useEffect(() => {
		setStatus("loading");
		fetch(`/deezer-api/album/${id}`)
			.then((r) => r.json())
			.then((data) => {
				setAlbum(data);
				setStatus("ready");
			})
			.catch((err) => {
				console.error(err);
				setStatus("error");
			});
	}, [id]);

	if (status === "loading")
		return <p className="album-message">Loading album...</p>;
	if (status === "error" || !album)
		<p className="album-message">Couldn''t load this album.</p>;

	const rawTracks = album.tracks?.data || [];
	const normalizedTracks = rawTracks
		.filter((t) => t.preview)
		.map((t) => ({
			id: t.id,
			title: t.title,
			artist: t.artist?.name || album.artist?.name,
			artistId: t.artist?.id || album.artist?.id,
			image: album.cover_medium,
			preview: t.preview,
			duration: t.duration,
		}));

	function formatDuration(totalSeconds) {
		const mins = Math.floor(totalSeconds / 60)
		const secs = Math.floor(totalSeconds % 60)
		return `${mins}:${secs.toString().padStart(2, "0")}`
	}

	return (
		<div className="album-page">
			<div className="album-header">
				<img src={album.cover_medium} alt={album.title} />
				<div className="album-header-info">
					<h1>{album.title}</h1>
					<Link
						to={`/artist/${album.artist.id}`}
						className="album-artist-link"
					>
						{album.artist.name}
					</Link>
					<button
						className="album-play-btn"
						onClick={() =>
							normalizedTracks.length > 0 &&
							onPlay(normalizedTracks, 0)
						}
					>
						<PlayIcon height="1.2em" /> Play
					</button>
				</div>
			</div>
			<div className="album-tracklist">
				{normalizedTracks.map((track, index) => (
					<div
						key={track.id}
						className="album-track-row"
						onClick={() => onPlay(normalizedTracks, index)}
					>
						<span className="album-track-number">{index + 1}</span>
						<span className="album-track-title">{track.title}</span>
						<span className="album-track-duration">
							{formatDuration(track.duration)}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
