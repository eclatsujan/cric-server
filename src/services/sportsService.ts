import { ServerUnaryCall, sendUnaryData, ServerWritableStream } from '@grpc/grpc-js';
import valkeyClient from '../utils/valkey';

interface Match {
  match_id: string;
  sport_type: string;
  team1: string;
  team2: string;
  status: string;
  score: string;
  start_time: number;
  venue: string;
}

interface GetLiveMatchesRequest {
  sport_type: string;
}

interface GetLiveMatchesResponse {
  matches: Match[];
}

interface GetMatchDetailsRequest {
  match_id: string;
}

interface GetMatchDetailsResponse {
  match: Match;
}

interface SubscribeToMatchRequest {
  match_id: string;
}

interface MatchUpdate {
  match_id: string;
  update_type: string;
  data: string;
  timestamp: number;
}

// Mock data - replace with real API calls or database
const mockMatches: Map<string, Match> = new Map([
  ['cricket-1', {
    match_id: 'cricket-1',
    sport_type: 'cricket',
    team1: 'India',
    team2: 'Australia',
    status: 'live',
    score: 'IND 246/6 (45.2) vs AUS 198 (42.5)',
    start_time: Date.now() - 3600000,
    venue: 'Melbourne Cricket Ground'
  }],
  ['cricket-2', {
    match_id: 'cricket-2',
    sport_type: 'cricket',
    team1: 'England',
    team2: 'Pakistan',
    status: 'live',
    score: 'ENG 180/4 (35.0) vs PAK',
    start_time: Date.now() - 7200000,
    venue: 'Lords Cricket Ground'
  }],
  ['football-1', {
    match_id: 'football-1',
    sport_type: 'football',
    team1: 'Barcelona',
    team2: 'Real Madrid',
    status: 'live',
    score: 'BAR 2 - 1 RM (75\')',
    start_time: Date.now() - 5400000,
    venue: 'Camp Nou'
  }]
]);

// Initialize Valkey indexes for matches
async function iniasync (
    call: ServerUnaryCall<GetLiveMatchesRequest, GetLiveMatchesResponse>,
    callback: sendUnaryData<GetLiveMatchesResponse>
  ) => {
    const { sport_type } = call.request;
    
    try {
      let matchIds: string[];

      if (sport_type) {
        // Get matches by sport type from Valkey index
        matchIds = await valkeyClient.smembers(`sport:${sport_type}`);
      } else {
        // Get all match IDs
        matchIds = Array.from(mockMatches.keys());
      }async (
    call: ServerUnaryCall<GetMatchDetailsRequest, GetMatchDetailsResponse>,
    callback: sendUnaryData<GetMatchDetailsResponse>
  ) => {
    const { match_id } = call.request;

    try {
      // Fetch match details from Valkey
      const matchData = await valkeyClient.hgetall(`match:${match_id}`);

      if (!matchData || !matchData.match_id) {
        callback({
          code: 5, // NOT_FOUND
          message: `Match ${match_id} not found`
        });
        return;
      }

      const match: Match = {
        match_id: matchData.match_id,
        sport_type: matchData.sport_type,
        team1: matchData.team1,
        team2: matchData.team2,
        status: matchData.status,
        score: matchData.score,
        start_time: parseInt(matchData.start_time),
        venue: matchData.venue
      };

      console.log(`🔍 Fetching details for match: ${match_id} from Valkey`);
      callback(null, { match });
    } catch (error) {
      console.error('Error fetching match from Valkey:', error);
      // Fallback to mock data
      const match = mockMatches.get(match_id);
      if (!match) {
        callback({
          code: 5,
          message: `Match ${match_id} not found`
        });
        return;
      }
      callback(null, { match });
    }
        }
      }

      console.log(`📊 Fetching live matches for: ${sport_type || 'all sports'} from Valkey`);
      
      callback(null, { matches });
    } catch (error) {
      console.error('Error fetching matches from Valkey:', error);
      // Fallback to mock data
      const matches = Array.from(mockMatches.values()).filter(
        match => !sport_type || match.sport_type === sport_type
      );
      callback(null, { matches });
    }
      });

      // Create indexes for quick lookups
      await valkeyClient.sadd(`sport:${match.sport_type}`, matchId);
      await valkeyClient.sadd(`status:${match.status}`, matchId);
      await valkeyClient.zadd('matches:by_time', match.start_time, matchId);

      console.log(`🔍 Indexed match: ${matchId} in Valkey`);
    }
  } catch (error) {
    console.error('Error initializing Valkey indexes:', error);
  }
}

// Initialize indexes on startup
initializeMatchIndexes();

export const sportsServiceHandlers = {
  getLiveMatches: (
    call: ServerUnaryCall<GetLiveMatchesRequest, GetLiveMatchesResponse>,
    callback: sendUnaryData<GetLiveMatchesResponse>
  ) => {
    const { sport_type } = call.request;
    
    const matches = Array.from(mockMatches.values()).filter(
      match => !sport_type || match.sport_type === sport_type
    );

    console.log(`📊 Fetching live matches for: ${sport_type || 'all sports'}`);
    
    callback(null, { matches });
  },

  getMatchDetails: (
    call: ServerUnaryCall<GetMatchDetailsRequest, GetMatchDetailsResponse>,
    callback: sendUnaryData<GetMatchDetailsResponse>
  ) => {
    const { match_id } = call.request;
    const match = mockMatches.get(match_id);

    if (!match) {
      callback({
        code: 5, // NOT_FOUND
        message: `Match ${match_id} not found`
      });
      return;
    }

    console.log(`🔍 Fetching details for match: ${match_id}`);
    callback(null, { match });
  },

  subscribeToMatch: (
    call: ServerWritableStream<SubscribeToMatchRequest, MatchUpdate>
  ) => {
    const { match_id } = call.request;
    
    console.log(`📡 Client subscribed to match: ${match_id}`);

    // Simulate live updates every 10 seconds
    const interval = setInterval(() => {
      const match = mockMatches.get(match_id);
      
      if (!match) {
        call.end();
        clearInterval(interval);
        return;
      }

      const update: MatchUpdate = {
        match_id,
        update_type: 'score_update',
        data: match.score,
        timestamp: Date.now()
      };

      call.write(update);
    }, 10000);

    call.on('cancelled', () => {
      console.log(`❌ Client unsubscribed from match: ${match_id}`);
      clearInterval(interval);
    });
  }
};
