import { useOutletContext } from "react-router-dom";
import Shelf from "../components/shelf";
import { shelves } from "../data/shelves";

export default function Home() {
	const { onPlay } = useOutletContext();

	return (
		<>
			{shelves.map((shelf) => (
				<Shelf
					key={shelf.id || shelf.query}
					title={shelf.title}
					query={shelf.query}
					onPlay={onPlay}
				/>
			))}
		</>
	);
}