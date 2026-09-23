import "./playing-bar.css";
import {
	ShuffleIcon,
	PreviousIcon,
	PlayIcon,
	PauseIcon,
	NextIcon,
	RepeatIcon,
	RepeatOneIcon,
	VolumeUpRoundedIcon,
	VolumeOffRoundedIcon,
	MusicNoteIcon,
} from "../src/icons.jsx";
import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";

const VOLUME_KEY = "playerVolume";

export default function PlayingBar({
	image, track, album, artist, artistId, preview, duration,
	onNext, onPrevious, onEnded, shuffle, onToggleShuffle, repeatMode, onToggleRepeat,
	queueLength,
}) {
	const [progress, setProgress] = useState(0)
	const [previewDuration, setPreviewDuration] = useState(30)
	const [volume, setVolume] = useState(() => {
		const saved = localStorage.getItem(VOLUME_KEY);
		return saved ? JSON.parse(saved) : 45;
	})
	const [isPlaying, setIsPlaying] = useState(false)
	const [muted, setMuted] = useState(false)
	const progressBarRef = useRef(null)
	const volumeBarRef = useRef(null)
	const audioRef = useRef(new Audio())
	const isFirstLoad = useRef(true)

	useEffect(() => {
		if (!preview) return;
		const audio = audioRef.current;
		audio.src = preview;
		if (isFirstLoad.current) {
			isFirstLoad.current = false;
			return;
		}
		audio.play().catch((err) => console.log("Playback interrupted:", err));
	}, [preview]);

	useEffect(() => {
		audioRef.current.volume = volume / 100;
		localStorage.setItem(VOLUME_KEY, JSON.stringify(volume));
	}, [volume]);

	useEffect(() => {
		const audio = audioRef.current;
		function handleTimeUpdate() {
			if (audio.duration) {
				setProgress((audio.currentTime / audio.duration) * 100);
			}
		}
		function handleLoadedMetadata() {
			setPreviewDuration(audio.duration || 30)
		}
		function handleAudioEnded() {
			setProgress(0);
			const action = onEnded?.()
			if (action === "replay") {
				audio.currentTime = 0
				audio.play().catch((err) => console.log("Replay interrupted:", err))
			}
		}
		function handlePlay() {
			setIsPlaying(true);
		}
		function handlePause() {
			setIsPlaying(false);
		}
		audio.addEventListener("timeupdate", handleTimeUpdate)
		audio.addEventListener("loadedmetadata", handleLoadedMetadata)
		audio.addEventListener("ended", handleAudioEnded)
		audio.addEventListener("play", handlePlay)
		audio.addEventListener("pause", handlePause)
		return () => {
			audio.removeEventListener("timeupdate", handleTimeUpdate)
			audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
			audio.removeEventListener("ended", handleAudioEnded)
			audio.removeEventListener("play", handlePlay)
			audio.removeEventListener("pause", handlePause)
		}
	}, [onEnded])

	function togglePlay() {
		const audio = audioRef.current
		if (!preview) return
		if (audio.paused) {
			audio.play().catch((err) => console.log("Playback interrupted:", err))
		} else {
			audio.pause()
		}
	}

	function toggleMute() {
		const audio = audioRef.current
		audio.muted = !audio.muted
		setMuted(audio.muted)
	}

	function calculatePercentage(e, barElement) {
		const rect = barElement.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const percentage = (clickX / rect.width) * 100;
		return Math.min(100, Math.max(0, percentage));
	}

	const handleProgressDrag = useCallback((e) => {
		function seek(e) {
			const pct = calculatePercentage(e, progressBarRef.current)
			setProgress(pct)
			const audio = audioRef.current
			if (audio.duration) {
				audio.currentTime = (pct / 100) * audio.duration
			}
		}
		seek(e)
		function onMouseMove(e) { seek(e) }
		function onMouseUp() {
			window.removeEventListener("mousemove", onMouseMove)
			window.removeEventListener("mouseup", onMouseUp)
		}
		window.addEventListener("mousemove", onMouseMove)
		window.addEventListener("mouseup", onMouseUp)
	}, [])

	const handleVolumeDrag = useCallback((e) => {
		function adjust(e) {
			const pct = calculatePercentage(e, volumeBarRef.current)
			setVolume(pct)
			const audio = audioRef.current
			if (audio.muted) {
				audio.muted = false
				setMuted(false)
			}
		}
		adjust(e)
		function onMouseMove(e) { adjust(e) }
		function onMouseUp() {
			window.removeEventListener("mousemove", onMouseMove)
			window.removeEventListener("mouseup", onMouseUp)
		}
		window.addEventListener("mousemove", onMouseMove)
		window.addEventListener("mouseup", onMouseUp)
	}, [])

	function formatTime(totalSeconds) {
		if (!totalSeconds || isNaN(totalSeconds)) return "0:00"
		const mins = Math.floor(totalSeconds / 60)
		const secs = Math.floor(totalSeconds % 60)
		return `${mins}:${secs.toString().padStart(2, "0")}`
	}

	const currentSeconds = (progress / 100) * previewDuration;

	return (
		<div className="mainBar">
			<div className="bar">
				<div className="track-info">
					{image ? (
						<img src={image} alt="Track Cover"/>
					) : (
						<div className="no-track-icon">
							<MusicNoteIcon height="72px"/>
						</div>
					)}
					<div className="details">
						<div className="track" style={{ fontSize: "20px" }}>
							<b>{track || "No track selected"}</b>
						</div>
						<div className="album" style={{ fontSize: "14px" }}>
							{album || ""}
						</div>
						<div className="artist" style={{ fontSize: "14px" }}>
							{artistId ? <Link to={`/artist/${artistId}`}>{artist}</Link> : (artist || "")}
						</div>
					</div>
				</div>
				<div className="controls">
					<div className="progress-container">
						<div className="progress-time">{formatTime(currentSeconds)}</div>
						<div className="progress-bar" ref={progressBarRef} onMouseDown={handleProgressDrag}>
							<div className="progress-fill" style={{ width: `${progress}%` }}>
								<div className="thumb"/>
							</div>
						</div>
						<div className="track-duration">{formatTime(previewDuration)}</div>
					</div>
					<div className="buttons">
						{queueLength > 1 && (
							<div className="shuffle" onClick={onToggleShuffle} style={{ cursor: "pointer", opacity: shuffle ? 1 : 0.5}}>
								<ShuffleIcon height="2em"/>
							</div>
						)}
						{queueLength > 1 && (
							<div className="previous" onClick={onPrevious} style={{ cursor: "pointer" }}>
								<PreviousIcon height="2em"/>
							</div>
						)}
						<div className="play" onClick={togglePlay} style={{ cursor: "pointer" }}>
							{isPlaying ? <PauseIcon height="2em"/> : <PlayIcon height="2em"/>}
						</div>
						{queueLength > 1 && (
							<div className="next" onClick={onNext} style={{ cursor: "pointer" }}>
								<NextIcon height="2em"/>
							</div>
						)}
						<div className="repeat" onClick={onToggleRepeat} style={{cursor: "pointer", opacity: repeatMode === "off" ? 0.5 : 1}}>
							{repeatMode === "one" ? <RepeatOneIcon height="2em"/> : <RepeatIcon height="2em"/>}
						</div>
					</div>
				</div>
				<div className="volume-container">
					<div className="mute-button" onClick={toggleMute} style={{ cursor: "pointer" }}>
						{muted ? <VolumeOffRoundedIcon height="1.7em"/> : <VolumeUpRoundedIcon height="1.7em"/>}
					</div>
					<div className="volume-bar" ref={volumeBarRef} onMouseDown={handleVolumeDrag}>
						<div className="volume-fill" style={{ width: `${volume}%` }}>
							<div className="thumb"/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}