import "./card.css";
import { Link } from "react-router-dom";

export default function Card(props) {
	function handleClick(e) {
		e.preventDefault();
		props.onPlay?.();
	}

	return (
		<div className="card-wrapper" onClick={handleClick}>
			<div className="card">
				<div className="card-content">
					<div className="card-image">
						<img src={props.image} alt="Album Cover"/>
					</div>
					<div className="card-info">
						<p className="card-title"><b>{props.title}</b></p>
						{props.artistId ? (
							<Link
								to={`/artist/${props.artistId}`}
								className="card-artist-link"
								onClick={(e) => e.stopPropagation()}
							>
								<p className="card-artist">{props.artist}</p>
							</Link>
						) : (
							<p className="card-artist">{props.artist}</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}