import Card from "./card";
import "./shelf.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

export default function Shelf(props) {
	const scrollRef = useRef(null);
	const [result, setResult] = useState({ url: null, tracks: [], failed: false });

	const CARD_WIDTH = 230;
	const GAP = 20;
	const SCROLL_AMOUNT = (CARD_WIDTH + GAP) * 5;

	let url;
	if (props.endpoint) {
		url = `/deezer-api/${props.endpoint}`;
	} else if (props.playlistId) {
		url = `/deezer-api/playlist/${props.playlistId}/tracks`;
	} else if (props.albumId) {
		url = `/deezer-api/album/${props.albumId}`;
	} else {
		url = `/deezer-api/search?q=${encodeURIComponent(props.query || "massive attack")}`;
	}

	const isAlbum = Boolean(props.albumId);

	useEffect(() => {
		let cancelled = false;

		fetch(url)
			.then((r) => r.json())
			.then((data) => {
				if (cancelled) return;
				const tracks = isAlbum ? data.tracks?.data || [] : data.data || [];
				setResult({ url, tracks, failed: false });
			})
			.catch((err) => {
				console.error(err);
				if (!cancelled) setResult({ url, tracks: [], failed: true });
			});

		return () => {
			cancelled = true;
		};
	}, [url, isAlbum]);

	let status;
	if (result.url !== url) status = "loading";
	else if (result.failed) status = "error";
	else if (result.tracks.length === 0) status = "empty";
	else status = "ready";

	const tracks = result.url === url ? result.tracks : [];

	const scroll = (direction) => {
		scrollRef.current.scrollBy({
			left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
			behavior: "smooth",
		});
	};

	const normalizedTracks = tracks
		.filter((t) => t.artist && t.preview)
		.map((t) => ({
			id: t.id,
			title: t.title,
			artist: t.artist.name,
			artistId: t.artist.id,
			image: props.albumId ? props.albumImage : t.album?.cover_medium,
			preview: t.preview,
			duration: t.duration,
		}));

	const seeAllParams = new URLSearchParams({ title: props.title });
	if (props.endpoint) seeAllParams.set("endpoint", props.endpoint);
	else if (props.playlistId) seeAllParams.set("playlistId", props.playlistId);
	else if (props.albumId) {
		seeAllParams.set("albumId", props.albumId);
		if (props.albumImage) seeAllParams.set("albumImage", props.albumImage);
	} else seeAllParams.set("q", props.query || "");

	return (
		<div className="shelf">
			<div className="shelf-top">
				<div className="shelf-main">
					<p className="shelf-title">
						<b>{props.title}</b>
					</p>
				</div>
				<div className="shelf-secondary">
					<Link
						to={`/see-all?${seeAllParams.toString()}`}
						className="see-all"
					>
						See All
					</Link>
					<div className="nav-buttons">
						<button
							className="nav-btn"
							onClick={() => scroll("left")}
						>
							<ChevronLeft size={24} />
						</button>
						<button
							className="nav-btn"
							onClick={() => scroll("right")}
						>
							<ChevronRight size={24} />
						</button>
					</div>
					{props.onRemove && (
						<button
							className="remove-shelf-btn"
							onClick={props.onRemove}
						>
							Remove
						</button>
					)}
				</div>
			</div>

			{status === "loading" && (
				<div className="shelf-cards">
					{Array.from({ length: 5 }).map((_, i) => (
						<div className="card-skeleton" key={i} />
					))}
				</div>
			)}

			{status === "empty" && (
				<p className="shelf-message">No tracks found.</p>
			)}

			{status === "error" && (
				<p className="shelf-message">
					Couldn't load this shelf. Try again later.
				</p>
			)}

			{status === "ready" && (
				<div className="shelf-cards" ref={scrollRef}>
					{normalizedTracks.map((track, index) => (
						<Card
							key={track.id}
							title={track.title}
							artist={track.artist}
							artistId={track.artistId}
							image={track.image}
							onPlay={() => props.onPlay(normalizedTracks, index)}
						/>
					))}
				</div>
			)}
		</div>
	);
}