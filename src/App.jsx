import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import TopBar from "../components/topBar";
import PlayingBar from "../components/playing-bar";
import Home from "../pages/Home";
import SeeAll from "../pages/SeeAll";
import Library from "../pages/Library";
import Error from "../pages/Error";
import Artist from "../pages/Artist";

const STORAGE_KEY = "customShelves";
const QUEUE_KEY = "playerQueue";
const INDEX_KEY = "playerIndex";

function Layout({
	onPlay,
	customShelves,
	onAddShelf,
	onRemoveShelf,
	onReorderShelves,
	...playerProps
}) {
	return (
		<>
			<TopBar title={"Speciality"} onPlay={onPlay} />
			<Outlet
				context={{ onPlay, customShelves, onAddShelf, onRemoveShelf, onReorderShelves }}
			/>
			<PlayingBar {...playerProps} />
		</>
	);
}

function App() {
	const [queue, setQueue] = useState(() => {
		const saved = localStorage.getItem(QUEUE_KEY);
		return saved ? JSON.parse(saved) : [];
	});
	const [currentIndex, setCurrentIndex] = useState(() => {
		const saved = localStorage.getItem(INDEX_KEY);
		return saved ? JSON.parse(saved) : 0;
	});
	const [shuffle, setShuffle] = useState(false);
	const [repeatMode, setRepeatMode] = useState("off");

	const [customShelves, setCustomShelves] = useState(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		return saved ? JSON.parse(saved) : [];
	});

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(customShelves));
	}, [customShelves]);

	useEffect(() => {
		localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
	}, [queue]);

	useEffect(() => {
		localStorage.setItem(INDEX_KEY, JSON.stringify(currentIndex));
	}, [currentIndex]);

	function handleAddShelf(shelf) {
		setCustomShelves((prev) => {
			const key = shelf.id || shelf.query;
			if (prev.some((s) => (s.id || s.query) === key)) return prev;
			return [...prev, shelf];
		});
	}

	function handleRemoveShelf(key) {
		setCustomShelves((prev) => prev.filter((s) => (s.id || s.query) !== key));
	}

	function handleReorderShelves(newOrder) {
		setCustomShelves(newOrder);
	}

	const currentTrack = queue[currentIndex] || null;

	function handlePlay(tracks, index) {
		setQueue(tracks);
		setCurrentIndex(index);
	}

	function handleNext() {
		if (queue.length === 0) return;
		if (shuffle) {
			let randomIndex = Math.floor(Math.random() * queue.length);
			if (queue.length > 1) {
				while (randomIndex === currentIndex) {
					randomIndex = Math.floor(Math.random() * queue.length);
				}
			}
			setCurrentIndex(randomIndex);
			return;
		}
		setCurrentIndex((i) => (i + 1) % queue.length);
	}

	function handlePrevious() {
		if (queue.length === 0) return;
		setCurrentIndex((i) => (i - 1 + queue.length) % queue.length);
	}

	function handleTrackEnded() {
		if (repeatMode === "one") return "replay";
		if (
			repeatMode === "off" &&
			!shuffle &&
			currentIndex === queue.length - 1
		)
			return "stop";
		handleNext();
		return "next";
	}

	function toggleShuffle() {
		setShuffle((s) => !s);
	}

	function cycleRepeatMode() {
		setRepeatMode((mode) =>
			mode === "off" ? "all" : mode === "all" ? "one" : "off",
		);
	}

	return (
		<BrowserRouter>
			<Routes>
				<Route
					element={
						<Layout
							onPlay={handlePlay}
							customShelves={customShelves}
							onAddShelf={handleAddShelf}
							onRemoveShelf={handleRemoveShelf}
							onReorderShelves={handleReorderShelves}
							image={currentTrack?.image}
							track={currentTrack?.title}
							album={currentTrack?.album}
							artist={currentTrack?.artist}
							artistId={currentTrack?.artistId}
							preview={currentTrack?.preview}
							duration={currentTrack?.duration}
							onNext={handleNext}
							onPrevious={handlePrevious}
							onEnded={handleTrackEnded}
							shuffle={shuffle}
							onToggleShuffle={toggleShuffle}
							repeatMode={repeatMode}
							onToggleRepeat={cycleRepeatMode}
							queueLength={queue.length}
						/>
					}
				>
					<Route path="/" element={<Home />} />
					<Route path="/see-all" element={<SeeAll />} />
					<Route path="/library" element={<Library />} />
					<Route path="*" element={<Error />} />
					<Route path="/artist/:id" element={<Artist />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;