import { useState } from "react";
import { Id, Task } from "../types";
import DeleteIcon from "../icons/DeleteIcon";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
	task: Task;
	deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
};

export default function TaskCard({ task, deleteTask, updateTask }: Props) {
	const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);
	const [editMode, setEditMode] = useState<boolean>(false);

    const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: {
			type: "Task",
			task,
		},
		disabled: editMode,
        
	});
    const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	const toggleEditMode = () => {
		setEditMode(!editMode);
		setMouseIsOver(false);
	};

    if (isDragging) {
		return (
			<div 
			className="bg-mainBackgroundColor p-3 h-[100px] min-h-[100px] flex text-left rounded-xl hover:ring-2 cursor-grab relative opacity-30 border-rose-500 border-2"
			ref={setNodeRef} style={style}>
				{task.content}
			</div>
		)

		return <div ref={setNodeRef} style={style} className="bg-mainBackgroundColor p-3 h-[100px] min-h-[100px] flex text-left rounded-xl hover:ring-2 cursor-grab relative opacity-70 border-rose-500 border-2">Task ID: {task.id}<br/>Col Id:{task.columnID}<br/>{task.content}</div>
		// return <TaskCard task={task}/>
    }

	if (editMode) {
		return (
			<div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-mainBackgroundColor p-3 h-[100px] min-h-[100px] flex text-left rounded-xl hover:ring-2 hover:ring-rose-500 cursor-grab relative">
				<textarea
					className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"
					value={task.content}
					autoFocus
					placeholder="Add a task..."
					onBlur={toggleEditMode}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && e.shiftKey === false) {
                            toggleEditMode();
                        }
                    }}
                    onChange={(e) => {
                        updateTask(task.id, e.target.value);
                    }}
				></textarea>
			</div>
		);
	}

	return (
		<div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
			className="bg-mainBackgroundColor p-3 h-[100px] min-h-[100px] flex text-left rounded-xl hover:ring-2 hover:ring-rose-500 cursor-grab relative task"
			onClick={toggleEditMode}
			onMouseEnter={() => {
				setMouseIsOver(true);
			}}
			onMouseLeave={() => {
				setMouseIsOver(false);
			}}
		>
			<p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
                {task.content}
            </p>
			{mouseIsOver && (
				<button
					onClick={() => {
						deleteTask(task.id);
					}}
					className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 bg-columnBackgroundColor p-2 rounded opacity-60 hover:opacity-100"
				>
					<DeleteIcon />
				</button>
			)}
		</div>
	);
}
