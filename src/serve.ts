import { serveDir } from "@std/http/file-server";

Deno.serve(async (req) => {
  return await serveDir(req, {
    fsRoot: "./docs",
    // enableCors: true,
    // mimeTypes: {
    //   "ts": "application/javascript",
    //   "tsx": "application/javascript",
    // },
  });
});
