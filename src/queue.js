export default class Queue {
  constructor(api, player, ui) {
    this.api = api;
    this.player = player;
    this.ui = ui;
    this.queueItems = [];
    
    this.setupEventListeners();
    this.loadQueue();
  }

  setupEventListeners() {
    // Listen for queue item play request
    document.addEventListener('queue:play-item', (event) => {
      const { index } = event.detail;
      this.playQueueItem(index);
    });
    
    // Listen for queue item remove request
    document.addEventListener('queue:remove-item', (event) => {
      const { index } = event.detail;
      this.removeFromQueue(index);
    });
  }

  async loadQueue() {
    // In a real implementation, we would fetch the current queue from Spotify
    // For this demo, we'll use dummy data
    this.queueItems = await this.api.getMockEpisodes();
    this.renderQueue();
  }

  renderQueue() {
    this.ui.renderQueue(this.queueItems);
  }

  async addToQueue(episode) {
    try {
      await this.api.addToQueue(episode.uri);
      this.queueItems.push(episode);
      this.renderQueue();
      this.ui.showNotification(`Added to queue: ${episode.name}`);
      return true;
    } catch (error) {
      console.error('Error adding to queue:', error);
      this.ui.showNotification('Error adding to queue. Please try again.');
      return false;
    }
  }

  async playQueueItem(index) {
    if (index < 0 || index >= this.queueItems.length) {
      this.ui.showNotification('Invalid queue item');
      return false;
    }
    
    try {
      const episode = this.queueItems[index];
      
      // Play the episode
      const success = await this.player.playEpisode(episode);
      
      if (success) {
        // Remove this and previous items from queue
        this.queueItems = this.queueItems.slice(index + 1);
        this.renderQueue();
      }
      
      return success;
    } catch (error) {
      console.error('Error playing queue item:', error);
      this.ui.showNotification('Error playing queue item. Please try again.');
      return false;
    }
  }

  removeFromQueue(index) {
    if (index < 0 || index >= this.queueItems.length) {
      this.ui.showNotification('Invalid queue item');
      return false;
    }
    
    this.queueItems.splice(index, 1);
    this.renderQueue();
    this.ui.showNotification('Removed from queue');
    return true;
  }

  clearQueue() {
    this.queueItems = [];
    this.renderQueue();
    return true;
  }

  getQueue() {
    return [...this.queueItems];
  }
}