import { useState, useRef } from "react";
import Modal from "./about.jsx";

const STATES = {
	IDLE: "idle",
	RECORDING: "recording",
	PROCESSING: "processing",
	FOUND: "found",
	NOT_FOUND: "not_found",
	ERROR: "error",
};

export default function AudDModal({ isOpen, onClose, onPlay }) {
	const [status, setStatus] = useState(STATES.IDLE);
	const [result, setResult] = useState(null);
	const [deezerTrack, setDeezerTrack] = useState(null);
	const mediaRecorderRef = useRef(null);
	const chunksRef = useRef([]);
	const cancelledRef = useRef(false);

	async function startListening() {
		setStatus(STATES.RECORDING);
		setResult(null);
		setDeezerTrack(null);
		cancelledRef.current = false;

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			chunksRef.current = [];

			mediaRecorder.ondataavailable = (e) => {
				chunksRef.current.push(e.data);
			};
			mediaRecorder.onstop = async () => {
				stream.getTracks().forEach((track) => track.stop());
				if (cancelledRef.current) return;
				const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
				await identifyTrack(audioBlob);
			};

			mediaRecorder.start();

			setTimeout(() => {
				if (mediaRecorder.state === "recording") {
					mediaRecorder.stop();
				}
			}, 8000);
		} catch (err) {
			console.error("Microphone access denied or unavailable:", err);
			setStatus(STATES.ERROR);
		}
	}

	async function findOnDeezer(title, artist) {
		const cleanTitle = title.replace(/"/g, "");
		const cleanArtist = artist.replace(/"/g, "");
		const queries = [
			`artist:"${cleanArtist}" track:"${cleanTitle}"`,
			`${cleanTitle} ${cleanArtist}`,
		];

		for (const q of queries) {
			const res = await fetch(`/deezer-api/search?q=${encodeURIComponent(q)}`);
			const data = await res.json();
			const match = (data.data || []).find((t) => t.preview && t.artist && t.album);
			if (match) {
				return {
					id: match.id,
					title: match.title,
					artist: match.artist.name,
					artistId: match.artist.id,
					image: match.album.cover_medium,
					preview: match.preview,
					duration: match.duration,
				};
			}
		}
		return null;
	}

	async function identifyTrack(audioBlob) {
		setStatus(STATES.PROCESSING);

		try {
			const response = await fetch("/audd-api/recognize", {
				method: "POST",
				body: audioBlob,
			});
			const data = await response.json();

			if (data.status === "error") {
				console.error("AudD error:", data.error);
				setStatus(STATES.ERROR);
				return;
			}

			if (data.result) {
				setResult(data.result);
				setDeezerTrack(await findOnDeezer(data.result.title, data.result.artist));
				setStatus(STATES.FOUND);
			} else {
				setStatus(STATES.NOT_FOUND);
			}
		} catch (err) {
			console.error("Recognition failed:", err);
			setStatus(STATES.ERROR);
		}
	}

	function handleClose() {
		cancelledRef.current = true;
		if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
			mediaRecorderRef.current.stop();
		}
		setStatus(STATES.IDLE);
		setResult(null);
		setDeezerTrack(null);
		onClose();
	}

	function handlePlay() {
		onPlay([deezerTrack], 0);
		handleClose();
	}

	const coverUrl = deezerTrack?.image || result?.spotify?.album?.images?.[0]?.url;

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Listen">
			{status === STATES.IDLE && (
				<div style={{ textAlign: "center", padding: "20px 0" }}>
					<p style={{ marginBottom: "16px" }}>
						Play some music near your microphone and tap Listen
					</p>
					<button className="add-shelf-btn" onClick={startListening}>
						Listen
					</button>
				</div>
			)}
			{status === STATES.RECORDING && (
				<div style={{ textAlign: "center", padding: "20px 0" }}>
					<p>Listening...</p>
				</div>
			)}
			{status === STATES.PROCESSING && (
				<div style={{ textAlign: "center", padding: "20px 0" }}>
					<p>Identifying...</p>
				</div>
			)}
			{status === STATES.FOUND && result && (
				<div style={{ textAlign: "center", padding: "20px 0" }}>
					{coverUrl && (
						<img
							src={coverUrl}
							alt={result.title}
							style={{
								width: "150px",
								height: "150px",
								borderRadius: "12px",
								marginBottom: "12px",
							}}
						/>
					)}
					<p style={{ fontSize: "18px", fontWeight: "bold" }}>{result.title}</p>
					<p style={{ color: "var(--secFontC)", marginBottom: "16px" }}>
						{result.artist}
					</p>
					{deezerTrack ? (
						<button className="add-shelf-btn" onClick={handlePlay}>
							Play preview
						</button>
					) : (
						<p style={{ color: "var(--secFontC)" }}>
							No playable preview found for this track.
						</p>
					)}
				</div>
			)}
			{status === STATES.NOT_FOUND && (
				<div style={{ textAlign: "center", padding: "20px 0" }}>
					<p>Couldn't identify that track.</p>
					<button className="add-shelf-btn" onClick={startListening}>
						Try Again
					</button>
				</div>
			)}
			{status === STATES.ERROR && (
				<div style={{ textAlign: "center", padding: "20px 0" }}>
					<p>Microphone access is needed, or something went wrong.</p>
					<button className="add-shelf-btn" onClick={startListening}>
						Try Again
					</button>
				</div>
			)}
		</Modal>
	);
}