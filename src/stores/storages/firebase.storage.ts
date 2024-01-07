import { StateStorage, createJSONStorage } from "zustand/middleware";

const firebaseUrl =
  "https://zustand-storage-613b7-default-rtdb.europe-west1.firebasedatabase.app/zustand";

const storageApi: StateStorage = {
  getItem: async function (name: string): Promise<string | null> {
    try {
      const data = await fetch(`${firebaseUrl}/${name}.json`).then((res) =>
        res.json()
      );
      //en console log podemos ver el objeto
      console.log(data);
      //Pero para verlo en el proyecto
      //data devuelve un objeto. Hay que serializarlo como string
      return JSON.stringify(data);
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
  //condición de carrera. AbortController
  setItem: async function (name: string, value: string): Promise<void> {
    await fetch(`${firebaseUrl}/${name}.json`, {
      method: "PUT",
      body: value,
    }).then((res) => res.json());
    // sessionStorage.setItem(name, value);
    // console.count("setItem");

    return;
  },
  removeItem: function (name: string): void | Promise<void> {
    console.log("removeItem", name);
  },
};
export const firebaseStorage = createJSONStorage(() => storageApi);
