import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

export default function KanbanBoard() {
	const [columns, setColumns] = useState<Column[]>([]);

	const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

	const [activeColumn, setActiveColumn] = useState<Column | null>();

	const [tasks, setTasks] = useState<Task[]>([]);

	const [activeTask, setActiveTask] = useState<Task | null>(null);

	const createNewColumn = () => {
		const columnToAdd: Column = {
			id: generateID(),
			title: `Column ${columns.length + 1}`,
		};

		setColumns([...columns, columnToAdd]);
	};

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 3, // The sensors will only trigger dragging if the distance is futher than this. We need to configure this so that it will leave room for button click on item
			},
		})
	);

	const deleteColumn = (id: Id) => {
		const filteredCol = columns.filter((col) => col.id !== id);

		setColumns(filteredCol);

		const newTasks = tasks.filter( t => t.columnID !== id);
		setTasks(newTasks);
	};

	const updateColumn = (id: Id, title: string) => {
		const newColumns = columns.map((col) => {
			if (col.id !== id) return col;
			return {
				...col,
				title,
			};
		});

		setColumns(newColumns);
	};

	const createTask = (columnId: Id) => {
		const newTask: Task = {
			id: generateID(),
			columnID: columnId,
			content: `New Task #${tasks.length + 1}`,
		};

		setTasks([...tasks, newTask]);
	};

	const deleteTask = (taskId: Id) => {
		const resultTasks: Task[] = tasks.filter((t) => t.id !== taskId);

		setTasks(resultTasks);
	};

	const updateTask = (id: Id, content: string) => {
		const newTasks = tasks.map((t) => {
			if (t.id !== id) return t;
			return {
				...t,
				content,
			};
		});

		setTasks(newTasks);
	};

	const generateID = () => {
		return Math.floor(Math.random() * 10001);
	};

	const onDragStart = (event: DragStartEvent) => {
		if (event.active.data.current?.type === "Column") {
			setActiveColumn(event.active.data.current.column);
			return;
		}

		if (event.active.data.current?.type === "Task") {
			setActiveTask(event.active.data.current.column);
			return;
		}
	};

	const onDragEnd = (event: DragEndEvent) => {
		setActiveColumn(null);
		setActiveTask(null);

		const { active, over } = event;

		if (!over) return; // Prevent draggin over the element

		const activeColumnId = active.id;
		const overColumnId = over.id;

		if (activeColumnId === overColumnId) {
			return;
		}

		setColumns((columns) => {
			const activeColumnIndex = columns.findIndex(
				(col) => col.id === activeColumnId
			);

			const overColumnIndex = columns.findIndex(
				(col) => col.id === overColumnId
			);

			return arrayMove(columns, activeColumnIndex, overColumnIndex);
		});
	};

	const onDragOver = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over) return; // Prevent draggin over the element

		const activeColumnId = active.id;
		const overColumnId = over.id;

		if (activeColumnId === overColumnId) return;
		const isActiveATask = active.data.current?.type === "Task";
		const isOverATask = over.data.current?.type === "Task";

		if (!isActiveATask) return;

		// Scenario 1: Dropping a task over another
		if (isActiveATask && isOverATask) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === active.id);
				const overIndex = tasks.findIndex((t) => t.id === over.id);

				tasks[activeIndex].columnID = tasks[overIndex].columnID;
				// if(tasks[activeIndex].columnID !== tasks[overIndex].columnID) {
				// 	console.log("Different column detected")
				// }

				return arrayMove(tasks, activeIndex, overIndex);
			});
		}

		// Scenario 2: Dropping a task from one column to another
		const isOverAColumn = over.data.current?.type === "Column";
		if (isActiveATask && isOverAColumn) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === active.id);
				// const overIndex = tasks.findIndex((t) => t.id === over.id);

				tasks[activeIndex].columnID = overColumnId;
				// if(tasks[activeIndex].columnID !== tasks[overIndex].columnID) {
				// 	console.log("Different column detected")
				// }

				return arrayMove(tasks, activeIndex, activeIndex);
			});
		}
	};

	return (
		<div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
			<DndContext
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				onDragOver={onDragOver}
				sensors={sensors}
			>
				<div className="m-auto flex gap-4">
					<div className="flex gap-4 ">
						<SortableContext items={columnsId}>
							{columns.map((col) => (
								<>
									<ColumnContainer
										column={col}
										key={col.id}
										deleteColumn={deleteColumn}
										updateColumn={updateColumn}
										createTask={createTask}
										taskList={tasks.filter(
											(task) => task.columnID === col.id
										)}
										deleteTask={deleteTask}
										updateTask={updateTask}
									/>
								</>
							))}
						</SortableContext>
					</div>
					<button
						onClick={() => {
							createNewColumn();
						}}
						className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex gap-2"
					>
						<PlusIcon />
						Add Column
					</button>
				</div>

				{createPortal(
					<DragOverlay>
						{activeColumn && (
							<ColumnContainer
								column={activeColumn}
								deleteColumn={deleteColumn}
								updateColumn={updateColumn}
								createTask={createTask}
								taskList={tasks.filter(
									(t) => t.columnID === activeColumn.id
								)}
								deleteTask={deleteTask}
								updateTask={updateTask}
							/>
						)}

						{activeTask && (
							<TaskCard
								task={activeTask}
								deleteTask={deleteTask}
								updateTask={updateTask}
							/>
						)}
					</DragOverlay>,
					document.body
				)}
			</DndContext>
		</div>
	);
}
