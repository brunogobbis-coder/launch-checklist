import { create } from "@tiendanube/nexo";

const instance = create({
  clientId: import.meta.env.VITE_NEXO_CLIENT_ID ?? "",
  log: import.meta.env.DEV,
});

export default instance;
