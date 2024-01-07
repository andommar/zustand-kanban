import { DragEvent, useState } from "react";
import Swal from "sweetalert2";
import { useTaskStore } from "../stores";
import { TaskStatus } from "../interfaces";

interface Options {
  status: TaskStatus;
}

export const useTasks = ({ status }: Options) => {
  // Then, the !! is used to convert whatever state.draggingTaskId is (which could be any type of value) into a boolean value.
  // If state.draggingTaskId is a truthy value (not null, undefined, 0, false, '', etc.), isDragging will be true. If it's falsy, isDragging will be false.
  // This technique is often used for coercion or ensuring a value is strictly a boolean.

  const isDragging = useTaskStore((state) => !!state.draggingTaskId);
  const onTaskDrop = useTaskStore((state) => state.onTaskDrop);
  const addTask = useTaskStore((state) => state.addTask);
  const [onDragOver, setOnDragOver] = useState(false);

  const handleAddTask = async () => {
    const { isConfirmed, value } = await Swal.fire({
      title: "Add Task",
      input: "text",
      inputLabel: "Task name",
      inputPlaceholder: "Insert the task name",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You must insert a task name";
        }
      },
    });
    if (!isConfirmed) return;
    addTask(value, status);
    // addTask("Nuevo titulo", value);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOnDragOver(true);
  };
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOnDragOver(false);
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOnDragOver(false);
    onTaskDrop(status);
  };

  return {
    //Porperties
    isDragging,
    //Métodos
    onDragOver,
    handleAddTask,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
