import { Server, ServerCredentials } from '@grpc/grpc-js';
import { sportsServiceHandlers } from './services/sportsService';

const server = new Server();

const PORT = process.env.PORT || 50051;

server.addService(sportsServiceHandlers, {});

server.bindAsync(`0.0.0.0:${PORT}`, ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error(`Error binding server: ${error.message}`);
    return;
  }
  console.log(`Server is running at http://0.0.0.0:${port}`);
  server.start();
});