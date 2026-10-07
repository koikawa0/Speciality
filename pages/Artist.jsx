import { useEffect, useState } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { PlayIcon } from "../src/icons.jsx";
import "./Artist.css";

export default function Artist() {
	const { id } = useParams();
	const { onPlay } = useOutletContext();
	const [artist, setArtist] = useState(null);
	const [topTracks, setTopTracks] = useState([]);
	const [albums, setAlbums] = useState([]);
	const [status, setStatus] = useState("loading");

	useEffect(() => {
		setStatus("loading");
		Promise.all([
			fetch(`/deezer-api/artist/${id}`).then((r) => r.json()),
			fetch(`/deezer-api/artist/${id}/top?limit=10`).then((r) => r.json()),
			fetch(`/deezer-api/artist/${id}/albums`).then((r) => r.json()),
		])
			.then(([artistData, topData, albumsData]) => {
				setArtist(artistData);
				setTopTracks(topData.data || []);
				setAlbums(albumsData.data || []);
				setStatus("ready");
			})
			.catch((err) => {
				console.error(err);
				setStatus("error");
			});
	}, [id]);

	if (status === "loading") return <p className="artist-message">Loading artist...</p>;
	if (status === "error" || !artist) return <p className="artist-message">Couldn't load this artist.</p>;

	const normalizedTracks = topTracks
		.filter((t) => t.artist && t.preview)
		.map((t) => ({
			id: t.id,
			title: t.title,
			artist: t.artist.name,
			artistId: t.artist.id,
			image: t.album?.cover_medium,
			preview: t.preview,
			duration: t.duration,
		}));

	function formatDuration(totalSeconds) {
		const mins = Math.floor(totalSeconds / 60);
		const secs = Math.floor(totalSeconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}

	return (
		<div className="artist-page">
			<div className="artist-header">
				<img src={artist.picture_medium} alt={artist.name} />
				<div className="artist-header-info">
					<h1>{artist.name}</h1>
					<button
						className="artist-play-btn"
						onClick={() => normalizedTracks.length > 0 && onPlay(normalizedTracks, 0)}
					>
						<PlayIcon height="1.2em" /> Play
					</button>
				</div>
			</div>

			<h2 className="artist-section-title">Top Tracks</h2>
			<div className="artist-tracklist">
				{normalizedTracks.map((track, index) => (
					<div
						key={track.id}
						className="artist-track-row"
						onClick={() => onPlay(normalizedTracks, index)}
					>
						<span className="artist-track-number">{index + 1}</span>
						<img src={track.image} alt={track.title} className="artist-track-image" />
						<span className="artist-track-title">{track.title}</span>
						<span className="artist-track-duration">{formatDuration(track.duration)}</span>
					</div>
				))}
			</div>

			<h2 className="artist-section-title">Albums</h2>
			<div className="artist-albums-grid">
				{albums.map((album) => (
					<Link key={album.id} to={`/album/${album.id}`} className="artist-album-card">
						<img src={album.cover_medium} alt={album.title} />
						<p>{album.title}</p>
					</Link>
				))}
			</div>
		</div>
	);
}