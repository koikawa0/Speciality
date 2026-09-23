import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import Shelf from "../components/shelf";
import SortableShelf from "../components/sortable-shelf";
import AddShelfModal from "../components/add-shelf-modal";
import AddAlbumShelfModal from "../components/add-album-shelf-modal";

export default function Library() {
	const { onPlay, customShelves, onAddShelf, onRemoveShelf, onReorderShelves } = useOutletContext();
	const [showAddArtist, setShowAddArtist] = useState(false);
	const [showAddAlbum, setShowAddAlbum] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
	);

	function handleDragEnd(event) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = customShelves.findIndex((s) => (s.id || s.query) === active.id);
		const newIndex = customShelves.findIndex((s) => (s.id || s.query) === over.id);
		onReorderShelves(arrayMove(customShelves, oldIndex, newIndex));
	}

	return (
		<div className="library-page">
			<h1>Library</h1>

			<button className="add-shelf-btn" onClick={() => setShowAddArtist(true)}>
				+ Add Artist Shelf
			</button>
			<button className="add-shelf-btn" onClick={() => setShowAddAlbum(true)}>
				+ Add Album Shelf
			</button>

			{customShelves.length === 0 && (
				<p style={{ padding: "20px", color: "var(--secFontC)" }}>
					No shelves added yet. Use the buttons above to add one.
				</p>
			)}

			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext
					items={customShelves.map((s) => s.id || s.query)}
					strategy={verticalListSortingStrategy}
				>
					{customShelves.map((shelf) => (
						<SortableShelf key={shelf.id || shelf.query} id={shelf.id || shelf.query}>
							<Shelf
								title={shelf.title}
								query={shelf.query}
								albumId={shelf.albumId}
								albumImage={shelf.albumImage}
								onPlay={onPlay}
								onRemove={() => onRemoveShelf(shelf.id || shelf.query)}
							/>
						</SortableShelf>
					))}
				</SortableContext>
			</DndContext>

			<AddShelfModal
				isOpen={showAddArtist}
				onClose={() => setShowAddArtist(false)}
				onAddShelf={onAddShelf}
			/>
			<AddAlbumShelfModal
				isOpen={showAddAlbum}
				onClose={() => setShowAddAlbum(false)}
				onAddShelf={onAddShelf}
			/>
		</div>
	);
}