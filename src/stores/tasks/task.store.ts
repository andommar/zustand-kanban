import { StateCreator, create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Task, TaskStatus } from "../../interfaces";
import { devtools, persist } from "zustand/middleware";
import { produce } from "immer";
import { immer } from "zustand/middleware/immer";

interface TaskState {
  //Para definir el tipado de task de la siguiente forma.
  //task: {
  //     {'ID': {id: 'id', task}}
  // }
  // se puede hacer de la forma { [key: string]: Task}
  //pero una forma más "simple y elegante" es con Record
  draggingTaskId?: string;
  tasks: Record<string, Task>;

  getTaskByStatus: (status: TaskStatus) => Task[];
  addTask: (title: string, status: TaskStatus) => void;
  setDraggingTaskId: (taskId: string) => void;
  removeDraggingTaskId: () => void;
  changeTaskStatus: (taskId: string, status: TaskStatus) => void;
  onTaskDrop: (status: TaskStatus) => void;
}

const storeApi: StateCreator<TaskState, [["zustand/immer", never]]> = (
  set,
  get
) => ({
  //Si se decide un array de objectos habría que iterar para obtener el objecto
  //sería más complicado a la hora de acuatlizar.
  //Si se hace como un objeto, como en este caso. La obtención es más complicada
  //pero la modificación más sencilla
  draggingTaskId: undefined,
  tasks: {
    "ABC-1": { id: "ABC-1", title: "ABC-1", status: "open" },
    "ABC-2": { id: "ABC-2", title: "ABC-2", status: "in-progress" },
    "ABC-3": { id: "ABC-3", title: "ABC-3", status: "open" },
    "ABC-4": { id: "ABC-4", title: "ABC-4", status: "open" },
  },

  getTaskByStatus: (status: TaskStatus) => {
    const tasks = get().tasks;
    return Object.values(tasks).filter((task) => task.status === status);
  },
  addTask: (title: string, status: TaskStatus) => {
    const newTask = { id: uuidv4(), title: title, status: status };

    //Si no utilizamos immer al exportar create<TaskState>()(devtools(immer(storeApi)));
    //no va a funcionar. Porque está esperando que devolvamos un TaskState e immer nos lo arregla
    //sin ello, peta.
    //NOTE - Opción middleware de zustand
    //Sirve para mutar estados y si tiene muchos objetos anidados
    set((state) => {
      state.tasks[newTask.id] = newTask;
    });

    //NOTE - Opción produce.Requiere npm install immer
    // set(
    //   produce((state: TaskState) => {
    //     state.tasks[newTask.id] = newTask;
    //   })
    // );

    //NOTE - Opción nativa. Forma nativa de Zustand
    // set((state) => ({
    //   tasks: {
    //     ...state.tasks,
    //     [newTask.id]: newTask,
    //   },
    // }));
  },
  setDraggingTaskId: (taskId: string) => {
    set({ draggingTaskId: taskId });
  },
  removeDraggingTaskId: () => {
    set({ draggingTaskId: undefined });
  },
  changeTaskStatus: (taskId: string, status: TaskStatus) => {
    //NOTE - Opción middleware zustand
    //El problema es que si intentamos cambiar dos veces de estado, peta. Viene de un objeto inmutable
    //debido a que estamso intentando cambiar un objeto anidado dentro de otro objeto aninado
    // set((state) => {
    //   state.tasks[taskId] = task;
    // });
    //NOTE - para arreglar lo de arriba:
    set((state) => {
      state.tasks[taskId] = {
        ...state.tasks[taskId],
        status,
      };
    });

    //NOTE - opción middleware cambiando get. DEbido a que ya del get obtenemos el objeto
    //inmutable. Así que clonamos el objeto con el spread
    // const task = {...get().tasks[taskId]};
    // task.status = status;
    // set((state) => {
    //   state.tasks[taskId] = {
    //   ...task,
    //   };
    //NOTE - opción nativa
    // const task = get().tasks[taskId];
    // task.status = status;

    //El problema es que sin el spread, estamos reemplazando el estado anterior
    //de todo el state. Por lo que tenemos que usar spread y modificar el estado de esa tarea
    //en especifico
    // set((state) => ({
    //   tasks: {
    //     ...state.tasks,
    //     [taskId]: task,
    //   },
    // }));
  },
  onTaskDrop: (status: TaskStatus) => {
    const taskId = get().draggingTaskId;
    if (!taskId) return;
    get().changeTaskStatus(taskId, status);
    get().removeDraggingTaskId();
  },
});

export const useTaskStore = create<TaskState>()(
  devtools(persist(immer(storeApi), { name: "task-store" }))
);
