# Cricket Server

This project is a TypeScript-based gRPC service for live sports matches, specifically designed to handle requests related to sports match information and updates.

## Project Structure

```
cricket-server
├── src
│   ├── services
│   │   └── sportsService.ts
│   └── index.ts
├── Dockerfile
├── .dockerignore
├── package.json
├── tsconfig.json
└── README.md
```

## Features

- **Get Live Matches**: Fetches live sports matches based on the specified sport type.
- **Get Match Details**: Retrieves detailed information about a specific match using its ID.
- **Subscribe to Match Updates**: Allows clients to subscribe to live updates for a specific match.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd cricket-server
   ```

2. **Install Dependencies**:
   Make sure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Build the Project**:
   Compile the TypeScript files:
   ```bash
   npm run build
   ```

4. **Run the Application**:
   Start the gRPC server:
   ```bash
   npm start
   ```

## Docker Instructions

To build and run the application using Docker:

1. **Build the Docker Image**:
   ```bash
   docker build -t cricket-server .
   ```

2. **Run the Docker Container**:
   ```bash
   docker run -p 50051:50051 cricket-server
   ```

## Usage

Once the server is running, you can interact with the gRPC service using a gRPC client. The service methods include:

- `getLiveMatches`: Call this method to retrieve live matches.
- `getMatchDetails`: Use this method to get details of a specific match.
- `subscribeToMatch`: Subscribe to updates for a specific match.

## License

This project is licensed under the MIT License.