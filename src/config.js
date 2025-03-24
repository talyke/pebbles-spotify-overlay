export default class Config {
  constructor() {
    this.storage = window.localStorage;
    this.keys = {
      refreshToken: 'pebbles_refresh_token',
      adSkipping: 'pebbles_ad_skipping',
      customQueue: 'pebbles_custom_queue',
      preferences: 'pebbles_preferences'
    };
    
    this.loadDefaults();
  }

  loadDefaults() {
    // Set default values if not present
    if (this.getAdSkipping() === null) {
      this.setAdSkipping(true);
    }
    
    if (this.getCustomQueue() === null) {
      this.setCustomQueue(true);
    }
    
    if (this.getPreferences() === null) {
      this.setPreferences({
        showNewEpisodesBadge: true,
        autoPlay: false,
        darkMode: true
      });
    }
  }

  // Spotify auth
  setRefreshToken(token) {
    this.storage.setItem(this.keys.refreshToken, token);
  }

  getRefreshToken() {
    return this.storage.getItem(this.keys.refreshToken);
  }

  // Feature toggles
  setAdSkipping(enabled) {
    this.storage.setItem(this.keys.adSkipping, JSON.stringify(enabled));
  }

  getAdSkipping() {
    const value = this.storage.getItem(this.keys.adSkipping);
    return value ? JSON.parse(value) : null;
  }

  setCustomQueue(enabled) {
    this.storage.setItem(this.keys.customQueue, JSON.stringify(enabled));
  }

  getCustomQueue() {
    const value = this.storage.getItem(this.keys.customQueue);
    return value ? JSON.parse(value) : null;
  }

  // User preferences
  setPreferences(prefs) {
    this.storage.setItem(this.keys.preferences, JSON.stringify(prefs));
  }

  getPreferences() {
    const prefs = this.storage.getItem(this.keys.preferences);
    return prefs ? JSON.parse(prefs) : null;
  }

  updatePreference(key, value) {
    const prefs = this.getPreferences() || {};
    prefs[key] = value;
    this.setPreferences(prefs);
  }

  clearAll() {
    Object.values(this.keys).forEach(key => {
      this.storage.removeItem(key);
    });
  }
}