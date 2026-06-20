import { Server } from "./presentation/server.js";

(async () => {
  main();
})();

async function main() {
  Server.start();
}
