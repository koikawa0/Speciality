import {
	StarBoldIcon,
	HomeOutlineIcon,
	InfoOutlineIcon,
	LibraryLinearIcon,
	GithubIcon,
} from "../src/icons.jsx";
import { Mic } from "lucide-react";
import "./topBar.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import Modal from "./about.jsx";
import SearchModal from "./search-modal.jsx";
import AudDModal from "./audd-modal.jsx";

export default function TopBar(props) {
	const [showAbout, setShowAbout] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [showListen, setShowListen] = useState(false);

	return (
		<div className="topBar">
			<div className="left-group">
				<div className="title">
					<StarBoldIcon height="2rem" />
					<h1>{props.title}</h1>
				</div>
				<div className="buttons">
					<Link to="/">
						<HomeOutlineIcon height="1.5em" />
						Home
					</Link>
					<Link to="/library">
						<LibraryLinearIcon height="1.5em" />
						Library
					</Link>
				</div>
			</div>

			<div className="search">
				<button
					className="search-trigger"
					onClick={() => setShowSearch(true)}
				>
					Search
				</button>
				<SearchModal
					isOpen={showSearch}
					onClose={() => setShowSearch(false)}
					onPlay={props.onPlay}
				/>
			</div>

			<div className="about">
				<button onClick={() => setShowListen(true)}>
					<Mic size={20} />
					Listen
				</button>
				<AudDModal
					isOpen={showListen}
					onClose={() => setShowListen(false)}
					onPlay={props.onPlay}
				/>

				<button onClick={() => setShowAbout(true)}>
					<InfoOutlineIcon height="1.5em" />
					About
				</button>
				<Modal
					isOpen={showAbout}
					onClose={() => setShowAbout(false)}
					title="About Speciality"
				>
					<p>
						<b>Speciality</b> is a small project I created with the
						goal of bringing a fresh perspective to music.
					</p>
					<p>
						This project was developed using <b>React + Vite</b>,
						drawing on the knowledge I've gained over the years while
						learning to build websites.
					</p>
					<a
						href="https://github.com/koikawa0"
						style={{ marginTop: "16px" }}
					>
						<GithubIcon height="1.5em" />
						Github
					</a>
				</Modal>
			</div>
		</div>
	);
}