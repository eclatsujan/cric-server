# Multi-Sport Live Score Server

A Node.js + TypeScript gRPC server for real-time sports scores and mobile authentication.

## Features

- 🏏 **Multi-Sport Live Scores** - Cricket (with extensibility for Football, Basketball, Tennis, etc.)
- 📊 Real-time score updates with streaming
- 🔐 OTP-based authentication
- 🚀 gRPC protocol for efficient client-server communication
- 📱 Mobile number verification
- 🔑 Session token management
- ⚡ TypeScript for type safety
- 🔄 Extensible architecture for adding new sports

## Project Structure

```
cricket-├── auth.proto            # Authentication service definition
│   │   ├── live_score.proto      # Multi-sport live score service
│   │   └── cricket.proto         # Cricket-specific data structures
│   ├── services/
│   │   ├── authService.ts        # Authentication logic
│   │   └── liveScoreService.ts   # Live score handlers
│   └── server.ts                 # gRPC server with all servicesnition
│   ├── services/
│   │   └── authService.ts     # Authentication logic
│   └── server.ts              # gRPC server setup
├── package.json
├── tsconfig.json
└── .env
```

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Build TypeScript:**
```bash
npm run build
```

3. **Run in development:**
```bash
npm run dev
```

4. **Run in production:**
```bash
npm starts

### 1. LiveScoreService (Multi-Sport)

Provides real-time sports scores with support for multiple sports. Currently supports Cricket with architecture ready for Football, Basketball, Tennis, and more.

#### GetLiveMatches
Get all currently live matches for a specific sport.

**Request:**
```proto
message LiveMatchesRequest {
  SportType sport_type = 1;  // CRICKET, FOOTBALL, etc.
  int32 page = 2;
  int32 limit = 3;
}
```

**Response:**
```proto
message LiveMatchesResponse {
  repeated Match matches = 1;
  int32 total_count = 2;
}
```

#### GetMatchDetails
Get detailed information about a specific match including live scores, player statistics, etc.

**Request:**
```proto
message MatchDetailsRequest {
  string match_id = 1;
  SportType sport_type = 2;
}
```

**Response:**
```proto
message MatchDetailsResponse {
  Match match = 1;
  string sport_specific_data = 2;  // JSON with sport-specific details
}
```

#### SubscribeToMatch (Streaming)
Subscribe to real-time updates for a specific match. Server streams score updates as they happen.

**Request:**
```proto
message MatchSubscriptionRequest {
  string match_id = 1;
  SportType sport_type = 2;
}
```

**Response (Stream):**
```proto
stream ScoreUpdate {
  string match_id = 1;
  int64 timestamp = 3;
  string update_type = 4;  // "score", "wicket", "goal", etc.
  string description = 5;
  string score_data = 6;  // JSON with details
}
```

#### GetCompletedMatches
Get recently completed matches.

#### GetUpcomingMatches
Get scheduled upcoming matches.

### 2. AuthService

#
The server implements the following RPC methods:

### SendOTP
Generates and sends a 6-digit OTP to the provided phone number.

```bash
# Get live cricket matches
grpcurl -plaintext -d '{"sport_type": 0, "page": 1, "limit": 10}' \
  localhost:50051 sports.LiveScoreService/GetLiveMatches

# Get match details
grpcurl -plaintext -d '{"match_id": "IND-AUS-T20-2026-001", "sport_type": 0}' \
  localhost:50051 sports.LiveScoreService/GetMatchDetails

# Subscribe to match updates (streaming)
grpcurl -plaintext -d '{"match_id": "IND-AUS-T20-2026-001", "sport_type": 0}' \
  localhost:50051 sports.LiveScoreService/SubscribeToMatch

**Request:**
```proto
message SendOTPRequest {
  string phone_number = 1;
}
```

**Response:**
```proto
message SendOTPResponse {
  bool success = 1;
  string message = 2;
  string otp = 3;  // For testing only
}
```

### VerifyOTP
Verifies the OTP and returns a session token if valid.

**Request:**
```proto
message VerifyOTPRequest {
  string phone_number = 1;
  string otp = 2;
}
```

**Response:**
```proto
message VerifyOTPResponse {
  bool success = 1;
  string message = 2;
  string token = 3;
}
```

### Logout
Invalidates the session token.

**Request:**
```proto
message LogoutRequest {
  string token = 1;
}
```

**Response:**
```proto
message LogoutResponse {
  bool success = 1;
  string message = 2;
}
```

## Configuration

Edit `.env` file:
```env
PORT=50051
NODE_ENV=development
```

## Testing

Use a gRPC client tool like:
- [grpcurl](https://github.com/fullstorydev/grpcurl)
- [BloomRPC](https://github.com/bloomrpc/bloomrpc)
- [Postman](https://www.postman.com/) (with gRPC support)

Example with grpcurl:
```bash
# Send OTP
grpcurl -plaintext -d '{"phone_number": "+1234567890"}' \
  localhost:50051 auth.AuthService/SendOTP

# Verify OTP
grpcurl -plaintext -d '{"phone_number": "+1234567890", "otp": "123456"}' \
  localhost:50051 auth.AuthService/VerifyOTP
```
Architecture - Adding New Sports

The system is designed to be easily extensible for new sports:

1. **Add Sport Type** to `live_score.proto`:
   ```proto
   enum SportType {
     CRICKET = 0;
     FOOTBALL = 1;    // Add new sport
     BASKETBALL = 2;  // Add new sport
   }
   ```

2. **Create Sport-Specific Proto** (like `cricket.proto`):
   - Define sport-specific data structures
   - Create detailed match info, player stats, etc.

3. **Update Service Handler**:
   - Add mock/real data for the new sport
   - Implement sport-specific logic in `liveScoreService.ts`

4. **Flutter Client**:
   - Reuse existing UI components
   - Add sport-specific widgets as needed

## Integration with Flutter App

To connect the Flutter app to this gRPC server:
1. Add `grpc` and `protobuf` packages to Flutter
2. Generate Dart client code from proto files:
   ```bash
   protoc --dart_out=grpc:lib/generated -Iprotos protos/*.proto
   ```
3. Replace mock data with gRPC client calls
4. Implement live streaming for real-time updates

## Roadmap

- [x] Cricket live scores
- [ ] Football live scores
- [ ] Basketball live scores
- [ ] Tennis live scores
- [ ] Real-time notifications
- [ ] Match highlights and replays
- [ ] Player statistics and rankings
- [ ] Integration with third-party sports API
- Implement rate limiting for OTP requests
- Use a real SMS gateway (Twilio, AWS SNS, etc.)
- Add proper error handling and logging
- Implement token refresh mechanism
- Use environment-based configuration
- Add database for user management

## Integration with Flutter App

To connect the Flutter app to this gRPC server:
1. Add `grpc` and `protobuf` packages to Flutter
2. Generate Dart client code from `auth.proto`
3. Replace the local AuthService with gRPC client calls

## License

ISC
