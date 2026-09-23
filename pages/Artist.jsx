import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import Card from "../components/card";
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
	if (status === "error") return <p className="artist-message">Couldn't load this artist.</p>;

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

	function handlePlayAlbum(album) {
		fetch(`/deezer-api/album/${album.id}`)
			.then((r) => r.json())
			.then((data) => {
				const tracks = (data.tracks?.data || [])
					.filter((t) => t.artist && t.preview)
					.map((t) => ({
						id: t.id,
						title: t.title,
						artist: t.artist.name,
						artistId: t.artist.id,
						image: album.cover_medium,
						preview: t.preview,
						duration: t.duration,
					}));
				if (tracks.length > 0) onPlay(tracks, 0);
			})
			.catch(console.error);
	}

	return (
		<div className="artist-page">
			<div className="artist-header">
				<img src={artist.picture_medium} alt={artist.name} />
				<h1>{artist.name}</h1>
			</div>

			<h2 className="artist-section-title">Top Tracks</h2>
			<div className="artist-tracks-grid">
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

			<h2 className="artist-section-title">Albums</h2>
			<div className="artist-albums-grid">
				{albums.map((album) => (
					<div
						key={album.id}
						className="artist-album-card"
						onClick={() => handlePlayAlbum(album)}
					>
						<img src={album.cover_medium} alt={album.title} />
						<p>{album.title}</p>
					</div>
				))}
			</div>
		</div>
	);
}