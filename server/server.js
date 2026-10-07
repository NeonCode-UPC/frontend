import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({
  noCors: false
});

// Re-route /api/v1/* to standard resources for production/cloud
server.use(jsonServer.rewriter({
  '/api/v1/*': '/$1'
}));

server.use(middlewares);
server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Medical SMARTBOX JSON Server is running on port ${port}`);
});
