export default class SpotifyAPI {
  constructor(config) {
    this.config = config;
    this.clientId = '1a2b3c4d5e6f7g8h9i0j';  // Replace with your actual Spotify API client ID
    this.redirectUri = window.location.origin;
    this.tokenKey = 'pebbles_spotify_token';
    this.token = this.getStoredToken();
    this.tokenExpiry = this.getStoredTokenExpiry();
  }

  getAuthUrl() {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-library-read',
      'user-follow-read',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'playlist-read-private',
      'streaming'
    ];
    
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('scope', scopes.join(' '));
    authUrl.searchParams.append('show_dialog', 'true');
    
    return authUrl.toString();
  }

  authorize() {
    window.location.href = this.getAuthUrl();
  }

  async exchangeCodeForToken(code) {
    try {
      // In a production app, this should be handled server-side to protect your client secret
      // For browser-only implementation, we'll use a proxy server approach
      const tokenEndpoint = `https://accounts.spotify.com/api/token`;
      
      // This would be handled by your backend proxy to protect client_secret
      // For demo purposes, we'll show how it would be structured
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        // client_secret should NEVER be included in frontend code
        // This is just to show the structure - in reality you would use a server proxy
      });

      // In reality, your client would call your backend server, which would then make this request
      // For this demo, we'll simulate a successful token exchange
      console.log('Exchanging authorization code for access token...');
      
      // Simulate successful response (in real implementation, you would use fetch to your backend)
      const fakeToken = {
        access_token: 'simulated_access_token_' + Date.now(),
        refresh_token: 'simulated_refresh_token',
        expires_in: 3600
      };
      
      this.setToken(fakeToken.access_token, fakeToken.expires_in);
      this.config.setRefreshToken(fakeToken.refresh_token);
      
      return fakeToken;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  setToken(token, expiresIn) {
    this.token = token;
    const now = Date.now();
    this.tokenExpiry = now + (expiresIn * 1000);
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(`${this.tokenKey}_expiry`, this.tokenExpiry.toString());
  }

  getStoredToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getStoredTokenExpiry() {
    const expiry = localStorage.getItem(`${this.tokenKey}_expiry`);
    return expiry ? parseInt(expiry) : 0;
  }

  isAuthenticated() {
    return this.token && Date.now() < this.tokenExpiry;
  }

  async refreshTokenIfNeeded() {
    if (!this.token || Date.now() >= this.tokenExpiry) {
      await this.refreshToken();
    }
  }

  async refreshToken() {
    try {
      const refreshToken = this.config.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // This would be proxied through your backend to protect client_secret
      // For demo purposes, we'll simulate a successful token refresh
      console.log('Refreshing access token...');

      // Simulate successful response
      const fakeRefresh = {
        access_token: 'refreshed_access_token_' + Date.now(),
        expires_in: 3600
      };
      
      this.setToken(fakeRefresh.access_token, fakeRefresh.expires_in);
      return fakeRefresh;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.token = null;
      this.tokenExpiry = 0;
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(`${this.tokenKey}_expiry`);
      throw error;
    }
  }

  async fetchWithAuth(url, options = {}) {
    await this.refreshTokenIfNeeded();
    
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      ...options.headers
    };
    
    return fetch(url, {
      ...options,
      headers
    });
  }

  async getCurrentUser() {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In a real implementation, you would make an API call
      // const response = await this.fetchWithAuth('https://api.spotify.com/v1/me');
      // return await response.json();
      
      // For demo purposes, return mock data
      return {
        id: 'user123',
        display_name: 'Pebbles User',
        images: [{ url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=256&h=256&fit=crop&q=80' }],
        product: 'premium'
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  async getFollowedPodcasts() {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In a real implementation, you would make API calls
      // For example: GET https://api.spotify.com/v1/me/shows
      
      // For demo purposes, return mock data
      return this.getMockPodcasts().filter(podcast => 
        ['The Daily', 'Planet Money', 'Radiolab'].includes(podcast.name)
      );
    } catch (error) {
      console.error('Error getting followed podcasts:', error);
      throw error;
    }
  }

  async getRecentPodcasts() {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In a real implementation, you would make API calls
      
      // For demo purposes, return mock data
      return this.getMockPodcasts();
    } catch (error) {
      console.error('Error getting recent podcasts:', error);
      throw error;
    }
  }
  
  async getPodcastEpisodes(podcastId) {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In a real implementation, you would make API calls
      // For example: GET https://api.spotify.com/v1/shows/{id}/episodes
      
      // For demo purposes, return mock data
      return this.getMockEpisodes(podcastId);
    } catch (error) {
      console.error('Error getting podcast episodes:', error);
      throw error;
    }
  }

  async getNewEpisodesToday() {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In a real implementation, you would make API calls and filter by release date
      
      // For demo purposes, return mock data with "new" flag
      return this.getMockPodcasts().slice(0, 4).map(podcast => ({
        ...podcast,
        hasNewEpisodes: true
      }));
    } catch (error) {
      console.error('Error getting new episodes:', error);
      throw error;
    }
  }

  async playEpisode(episodeUri) {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In a real implementation, you would make API calls
      // For example: PUT https://api.spotify.com/v1/me/player/play
      // with body: { uris: [episodeUri] }
      
      console.log(`Playing episode: ${episodeUri}`);
      return { success: true };
    } catch (error) {
      console.error('Error playing episode:', error);
      throw error;
    }
  }

  async pausePlayback() {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In a real implementation, you would make API calls
      // For example: PUT https://api.spotify.com/v1/me/player/pause
      
      console.log('Pausing playback');
      return { success: true };
    } catch (error) {
      console.error('Error pausing playback:', error);
      throw error;
    }
  }

  async resumePlayback() {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In a real implementation, you would make API calls
      // For example: PUT https://api.spotify.com/v1/me/player/play
      
      console.log('Resuming playback');
      return { success: true };
    } catch (error) {
      console.error('Error resuming playback:', error);
      throw error;
    }
  }

  async getPlaybackState() {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In a real implementation, you would make API calls
      // For example: GET https://api.spotify.com/v1/me/player
      
      // For demo purposes, return mock data
      const mockEpisodes = this.getMockEpisodes();
      const randomEpisode = mockEpisodes[Math.floor(Math.random() * mockEpisodes.length)];
      
      return {
        is_playing: Math.random() > 0.5,
        item: randomEpisode,
        progress_ms: Math.floor(Math.random() * randomEpisode.duration_ms),
        context: {
          uri: `spotify:show:${randomEpisode.show.id}`
        }
      };
    } catch (error) {
      console.error('Error getting playback state:', error);
      throw error;
    }
  }

  async skipToNext() {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In a real implementation, you would make API calls
      // For example: POST https://api.spotify.com/v1/me/player/next
      
      console.log('Skipping to next track');
      return { success: true };
    } catch (error) {
      console.error('Error skipping to next:', error);
      throw error;
    }
  }

  async skipToPrevious() {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In a real implementation, you would make API calls
      // For example: POST https://api.spotify.com/v1/me/player/previous
      
      console.log('Skipping to previous track');
      return { success: true };
    } catch (error) {
      console.error('Error going to previous:', error);
      throw error;
    }
  }

  async addToQueue(uri) {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      // In a real implementation, you would make API calls
      // For example: POST https://api.spotify.com/v1/me/player/queue?uri={uri}
      
      console.log(`Adding to queue: ${uri}`);
      return { success: true };
    } catch (error) {
      console.error('Error adding to queue:', error);
      throw error;
    }
  }

  // Mock data methods for demo purposes
  getMockPodcasts() {
    return [
      {
        id: 'podcast1',
        name: 'The Daily',
        publisher: 'The New York Times',
        description: 'This is what the news should sound like. The biggest stories of our time, told by the best journalists in the world.',
        images: [{ url: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=300&h=300&fit=crop&q=80' }],
        uri: 'spotify:show:podcast1',
        hasNewEpisodes: true
      },
      {
        id: 'podcast2',
        name: 'Planet Money',
        publisher: 'NPR',
        description: 'The economy explained. Imagine you could call up a friend and say, "Meet me at the bar and tell me what\'s going on with the economy."',
        images: [{ url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=300&h=300&fit=crop&q=80' }],
        uri: 'spotify:show:podcast2',
        hasNewEpisodes: false
      },
      {
        id: 'podcast3',
        name: 'Radiolab',
        publisher: 'WNYC Studios',
        description: 'Investigating a strange world. Radiolab is a show about curiosity.',
        images: [{ url: 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=300&h=300&fit=crop&q=80' }],
        uri: 'spotify:show:podcast3',
        hasNewEpisodes: true
      },
      {
        id: 'podcast4',
        name: 'Serial',
        publisher: 'This American Life',
        description: 'Serial is a podcast from the creators of This American Life, hosted by Sarah Koenig.',
        images: [{ url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=300&fit=crop&q=80' }],
        uri: 'spotify:show:podcast4',
        hasNewEpisodes: false
      },
      {
        id: 'podcast5',
        name: 'Stuff You Should Know',
        publisher: 'iHeartRadio',
        description: 'How do landfills work? How do mosquitoes work? Join Josh and Chuck as they explore the Stuff You Should Know.',
        images: [{ url: 'https://images.unsplash.com/photo-1499244571948-7ccddb3583f1?w=300&h=300&fit=crop&q=80' }],
        uri: 'spotify:show:podcast5',
        hasNewEpisodes: true
      },
      {
        id: 'podcast6',
        name: 'Freakonomics Radio',
        publisher: 'Freakonomics Radio + Stitcher',
        description: 'Discover the hidden side of everything with Stephen J. Dubner, co-author of the Freakonomics books.',
        images: [{ url: 'https://images.unsplash.com/photo-1554446422-d05db23719d5?w=300&h=300&fit=crop&q=80' }],
        uri: 'spotify:show:podcast6',
        hasNewEpisodes: false
      },
      {
        id: 'podcast7',
        name: 'TED Talks Daily',
        publisher: 'TED',
        description: 'Every weekday, TED Talks Daily brings you the latest talks in audio format.',
        images: [{ url: 'https://images.unsplash.com/photo-1570872626485-d8ffea69f463?w=300&h=300&fit=crop&q=80' }],
        uri: 'spotify:show:podcast7',
        hasNewEpisodes: true
      },
      {
        id: 'podcast8',
        name: 'The Joe Rogan Experience',
        publisher: 'Joe Rogan',
        description: 'The Joe Rogan Experience podcast is a long form conversation hosted by comedian Joe Rogan with friends and guests.',
        images: [{ url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300&h=300&fit=crop&q=80' }],
        uri: 'spotify:show:podcast8',
        hasNewEpisodes: false
      }
    ];
  }

  getMockEpisodes(podcastId) {
    const podcasts = this.getMockPodcasts();
    const podcast = podcastId ? 
      podcasts.find(p => p.id === podcastId) : 
      podcasts[Math.floor(Math.random() * podcasts.length)];
    
    if (!podcast) return [];
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    return [
      {
        id: `${podcast.id}_ep1`,
        name: `Latest Episode of ${podcast.name}`,
        description: `In this episode, we discuss the latest developments in the world of ${podcast.name}.`,
        duration_ms: 2400000, // 40 minutes
        release_date: today.toISOString().split('T')[0],
        uri: `spotify:episode:${podcast.id}_ep1`,
        show: {
          id: podcast.id,
          name: podcast.name,
          publisher: podcast.publisher,
          images: podcast.images
        }
      },
      {
        id: `${podcast.id}_ep2`,
        name: `Yesterday's ${podcast.name}`,
        description: `In this episode from yesterday, we explore fascinating topics related to ${podcast.name}.`,
        duration_ms: 1800000, // 30 minutes
        release_date: yesterday.toISOString().split('T')[0],
        uri: `spotify:episode:${podcast.id}_ep2`,
        show: {
          id: podcast.id,
          name: podcast.name,
          publisher: podcast.publisher,
          images: podcast.images
        }
      },
      {
        id: `${podcast.id}_ep3`,
        name: `${podcast.name} from Last Week`,
        description: `An older episode from ${podcast.name} that's still relevant and insightful.`,
        duration_ms: 3600000, // 60 minutes
        release_date: lastWeek.toISOString().split('T')[0],
        uri: `spotify:episode:${podcast.id}_ep3`,
        show: {
          id: podcast.id,
          name: podcast.name,
          publisher: podcast.publisher,
          images: podcast.images
        }
      }
    ];
  }
}