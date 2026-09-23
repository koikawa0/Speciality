import Card from "./card";
import "./shelf.css"
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

export default function Shelf(props) {
	const scrollRef = useRef(null);
	const [tracks, setTracks] = useState([]);
	const [status, setStatus] = useState("loading"); // "loading" | "ready" | "empty" | "error"

	const CARD_WIDTH = 230;
	const GAP = 20;
	const SCROLL_AMOUNT = (CARD_WIDTH + GAP) * 5;

	useEffect(() => {
		setStatus("loading");
		const url = props.albumId
			? `/deezer-api/album/${props.albumId}`
			: `/deezer-api/search?q=${encodeURIComponent(props.query || "massive attack")}`;

		fetch(url)
			.then(r => r.json())
			.then(data => {
				const results = props.albumId ? (data.tracks?.data || []) : (data.data || []);
				setTracks(results);
				setStatus(results.length === 0 ? "empty" : "ready");
			})
			.catch((err) => {
				console.error(err);
				setStatus("error");
			});
	}, [props.query, props.albumId]);

	const scroll = (direction => {
		scrollRef.current.scrollBy({
			left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
			behavior: "smooth",
		});
	});

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

	return (
		<div className="shelf">
			<div className="shelf-top">
				<div className="shelf-main">
					<p className="shelf-title"><b>{props.title}</b></p>
				</div>
				<div className="shelf-secondary">
					<Link
						to={`/see-all?q=${encodeURIComponent(props.query || "")}&title=${encodeURIComponent(props.title)}`}
						className="see-all"
					>
						See All
					</Link>
					<div className="nav-buttons">
						<button className="nav-btn" onClick={() => scroll("left")}>
							<ChevronLeft size={24}/>
						</button>
						<button className="nav-btn" onClick={() => scroll("right")}>
							<ChevronRight size={24}/>
						</button>
					</div>
					{props.onRemove && (
						<button className="remove-shelf-btn" onClick={props.onRemove}>
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
				<p className="shelf-message">Couldn't load this shelf. Try again later.</p>
			)}

			{status === "ready" && (
				<div className="shelf-cards" ref={scrollRef}>
					{normalizedTracks.map((track, index) =>
						<Card
							key={track.id}
							title={track.title}
							artist={track.artist}
							artistId={track.artistId}
							image={track.image}
							onPlay={() => props.onPlay(normalizedTracks, index)}
						/>
					)}
				</div>
			)}
		</div>
	);
}