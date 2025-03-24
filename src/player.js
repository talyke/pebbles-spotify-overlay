export default class Player {
  constructor(api, ui) {
    this.api = api;
    this.ui = ui;
    this.currentEpisode = null;
    this.isPlaying = false;
    this.progressInterval = null;
    this.currentProgress = 0;
    
    this.setupPlaybackUpdates();
  }

  setupPlaybackUpdates() {
    // Poll playback state every 1 second if something is playing
    this.progressInterval = setInterval(() => {
      if (this.isPlaying && this.currentEpisode) {
        this.currentProgress += 1000; // Add 1 second
        const duration = this.currentEpisode.duration_ms;
        this.ui.updateProgress(this.currentProgress, duration);
        
        // If we've reached the end, move to the next track
        if (this.currentProgress >= duration) {
          this.next();
        }
      }
    }, 1000);
  }

  async playEpisode(episode) {
    try {
      await this.api.playEpisode(episode.uri);
      this.currentEpisode = episode;
      this.isPlaying = true;
      this.currentProgress = 0;
      this.ui.updateNowPlaying(episode, true);
      this.ui.showNotification(`Now playing: ${episode.name}`);
      
      // Simulate episode change event for ad detection
      document.dispatchEvent(new CustomEvent('playback:episode-change', { 
        detail: { episode } 
      }));
      
      return true;
    } catch (error) {
      console.error('Error playing episode:', error);
      this.ui.showNotification('Error playing episode. Please try again.');
      return false;
    }
  }

  async togglePlayPause() {
    if (!this.currentEpisode) {
      this.ui.showNotification('No episode selected');
      return false;
    }
    
    try {
      if (this.isPlaying) {
        await this.api.pausePlayback();
        this.isPlaying = false;
      } else {
        await this.api.resumePlayback();
        this.isPlaying = true;
      }
      
      this.ui.updatePlayButton(this.isPlaying);
      return true;
    } catch (error) {
      console.error('Error toggling playback:', error);
      this.ui.showNotification('Error controlling playback. Please try again.');
      return false;
    }
  }

  async next() {
    try {
      await this.api.skipToNext();
      this.updateCurrentPlayback();
      return true;
    } catch (error) {
      console.error('Error skipping to next:', error);
      this.ui.showNotification('Error skipping to next episode. Please try again.');
      return false;
    }
  }

  async previous() {
    try {
      // Only go to previous if we're in the first 3 seconds, otherwise restart current
      if (this.currentProgress > 3000) {
        this.currentProgress = 0;
        this.ui.updateProgress(0, this.currentEpisode.duration_ms);
        return true;
      }
      
      await this.api.skipToPrevious();
      this.updateCurrentPlayback();
      return true;
    } catch (error) {
      console.error('Error going to previous:', error);
      this.ui.showNotification('Error returning to previous episode. Please try again.');
      return false;
    }
  }

  async updateCurrentPlayback() {
    try {
      const playbackState = await this.api.getPlaybackState();
      
      if (playbackState.item) {
        this.currentEpisode = playbackState.item;
        this.isPlaying = playbackState.is_playing;
        this.currentProgress = playbackState.progress_ms;
        this.ui.updateNowPlaying(playbackState.item, playbackState.is_playing);
        this.ui.updateProgress(playbackState.progress_ms, playbackState.item.duration_ms);
        
        // Simulate episode change event for ad detection
        document.dispatchEvent(new CustomEvent('playback:episode-change', { 
          detail: { episode: playbackState.item } 
        }));
      } else {
        this.currentEpisode = null;
        this.isPlaying = false;
        this.ui.updateNowPlaying(null, false);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating playback state:', error);
      return false;
    }
  }

  isCurrentlyPlaying() {
    return this.isPlaying;
  }

  getCurrentEpisode() {
    return this.currentEpisode;
  }
}