export default class AuthHelper {
  constructor(spotifyApi) {
    this.api = spotifyApi;
  }

  initiateLogin() {
    this.api.authorize();
  }

  async handleAuthCallback(code) {
    try {
      const tokenData = await this.api.exchangeCodeForToken(code);
      console.log('Authentication successful. Access token obtained.');
      return tokenData;
    } catch (error) {
      console.error('Error handling auth callback:', error);
      throw error;
    }
  }

  logout() {
    // Clear tokens from localStorage
    localStorage.removeItem('pebbles_spotify_token');
    localStorage.removeItem('pebbles_spotify_token_expiry');
    localStorage.removeItem('pebbles_refresh_token');
    
    // Reset API state
    this.api.token = null;
    this.api.tokenExpiry = 0;
    
    console.log('User logged out');
    
    // Redirect to home page
    window.location.href = '/';
  }

  checkAuthStatus() {
    return this.api.isAuthenticated();
  }
}