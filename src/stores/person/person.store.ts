import { type StateCreator, create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { firebaseStorage } from "../storages/firebase.storage";
import { logger } from "../middlewares/logger.middleware";

interface PersonState {
  firstname: string;
  lastname: string;
}

interface Actions {
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
}

const storeAPI: StateCreator<
  PersonState & Actions,
  [["zustand/devtools", never]]
> = (set) => ({
  firstname: "",
  lastname: "",

  //Para dev tools, llamamos a un callback (último parametro)
  //hover over set(), replace parameter reemplaza el estado anterior
  //pero si le ponemos true el comportamiento será que no esperamos. Porque no hay un nuevo estado, ya que SUBSTITUYE, no modifica el anterior
  setFirstName: (value: string) =>
    set((state) => ({ firstname: value }), false, "setFirstName"),
  setLastName: (value: string) =>
    set((state) => ({ lastname: value }), false, "setLastName"),
});

export const userPersonStore = create<PersonState & Actions>()(
  devtools(
    persist(storeAPI, {
      name: "person-storage",
      /*NOTE - cargar desde firebase datos */
      // storage: firebaseStorage,
    })
  )
);
