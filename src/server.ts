import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { sportsServiceHandlers } from './services/sportsService';

const PROTO_PATH = path.join(__dirname, './proto/sports.proto');
const PORT = process.env.PORT || '50051';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const sportsProto = grpc.loadPackageDefinition(packageDefinition).sports as any;

function main() {
  const server = new grpc.Server();
  server.addService(sportsProto.SportsService.service, sportsServiceHandlers);

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to bind server:', error);
        return;
      }
      console.log(`🚀 gRPC Sports Score Server running on port ${port}`);
      console.log(`⚽ 🏏 🏀 🎾 Streaming live scores for multiple sports...`);
    }
  );
}

main();
