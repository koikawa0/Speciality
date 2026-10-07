import { useOutletContext } from "react-router-dom";
import Shelf from "../components/shelf";
import AlbumShelf from "../components/album-shelf";
import { shelves, albumShelves } from "../data/shelves";

export default function Home() {
	const { onPlay } = useOutletContext();

	return (
		<>
			{shelves.map((shelf) => (
				<Shelf
					key={shelf.endpoint || shelf.playlistId || shelf.query}
					title={shelf.title}
					query={shelf.query}
					endpoint={shelf.endpoint}
					playlistId={shelf.playlistId}
					onPlay={onPlay}
				/>
			))}
			{albumShelves.map((shelf) => (
				<AlbumShelf
					key={shelf.endpoint || shelf.playlistId}
					title={shelf.title}
					endpoint={shelf.endpoint}
					playlistId={shelf.playlistId}
				/>
			))}
		</>
	);
}