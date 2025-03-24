export default class PodcastLibrary {
  constructor(api, ui, player, queue) {
    this.api = api;
    this.ui = ui;
    this.player = player;
    this.queue = queue;
    this.podcasts = [];
    this.filteredPodcasts = [];
    this.newEpisodesToday = [];
    this.filters = {
      newEpisodesToday: false,
      onlyNewEpisodes: false,
      followedPodcasts: false
    };
    this.sortType = 'recent';

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for podcast card clicks
    document.addEventListener('click', (e) => {
      const podcastCard = e.target.closest('.podcast-card');
      if (podcastCard) {
        const podcastId = podcastCard.dataset.id;
        this.loadPodcastEpisodes(podcastId);
      }
    });
  }

  async loadPodcasts() {
    try {
      // Get podcasts from the API
      const [followed, newToday, recent] = await Promise.all([
        this.api.getFollowedPodcasts(),
        this.api.getNewEpisodesToday(),
        this.api.getRecentPodcasts()
      ]);
      
      this.newEpisodesToday = newToday;
      this.podcasts = recent;
      this.filteredPodcasts = this.applyFilters(recent);
      
      // Render the podcasts
      this.ui.renderNewEpisodesToday(newToday);
      this.ui.renderYourShows(this.filteredPodcasts);
      
      return true;
    } catch (error) {
      console.error('Error loading podcasts:', error);
      this.ui.showNotification('Error loading podcasts. Please try again.');
      return false;
    }
  }

  async loadPodcastEpisodes(podcastId) {
    try {
      this.ui.showNotification('Loading episodes...');
      
      const episodes = await this.api.getPodcastEpisodes(podcastId);
      const podcast = this.podcasts.find(p => p.id === podcastId);
      
      if (episodes.length > 0) {
        // Play the first episode
        this.player.playEpisode(episodes[0]);
        
        // Add the rest to the queue
        episodes.slice(1).forEach(episode => {
          this.queue.addToQueue(episode);
        });
        
        this.ui.switchTab('now-playing');
      } else {
        this.ui.showNotification('No episodes found for this podcast');
      }
    } catch (error) {
      console.error('Error loading podcast episodes:', error);
      this.ui.showNotification('Error loading episodes. Please try again.');
    }
  }

  applyFilter(filterName, value) {
    this.filters[filterName] = value;
    this.filteredPodcasts = this.applyFilters(this.podcasts);
    this.ui.renderYourShows(this.filteredPodcasts);
  }

  applyFilters(podcasts) {
    let result = [...podcasts];
    
    if (this.filters.newEpisodesToday) {
      result = result.filter(podcast => podcast.hasNewEpisodes);
    }
    
    if (this.filters.onlyNewEpisodes) {
      result = result.filter(podcast => podcast.hasNewEpisodes);
    }
    
    if (this.filters.followedPodcasts) {
      // For demo purposes, we'll consider some podcasts as followed
      const followedNames = ['The Daily', 'Planet Money', 'Radiolab'];
      result = result.filter(podcast => followedNames.includes(podcast.name));
    }
    
    return this.sortPodcastsList(result, this.sortType);
  }

  sortPodcasts(sortType) {
    this.sortType = sortType;
    this.filteredPodcasts = this.sortPodcastsList(this.filteredPodcasts, sortType);
    this.ui.renderYourShows(this.filteredPodcasts);
  }

  sortPodcastsList(podcasts, sortType) {
    switch (sortType) {
      case 'name':
        return [...podcasts].sort((a, b) => a.name.localeCompare(b.name));
      case 'publisher':
        return [...podcasts].sort((a, b) => a.publisher.localeCompare(b.publisher));
      case 'popularity':
        // For demo, we'll simulate popularity
        return [...podcasts].sort((a, b) => {
          // Random popularity score for demo purposes
          const scoreA = Math.floor(Math.random() * 100);
          const scoreB = Math.floor(Math.random() * 100);
          return scoreB - scoreA;
        });
      case 'duration':
        // For demo, we'll sort based on the first episode's duration
        return [...podcasts].sort((a, b) => {
          const durationA = a.duration_ms || 1800000; // Default 30 min
          const durationB = b.duration_ms || 1800000;
          return durationB - durationA;
        });
      case 'episodes':
        // Sort by episode count (using a random value for demo)
        return [...podcasts].sort((a, b) => {
          const countA = a.episodeCount || Math.floor(Math.random() * 100);
          const countB = b.episodeCount || Math.floor(Math.random() * 100);
          return countB - countA;
        });
      case 'release':
        // Sort by release date (using hasNewEpisodes for demo)
        return [...podcasts].sort((a, b) => {
          if (a.hasNewEpisodes && !b.hasNewEpisodes) return -1;
          if (!a.hasNewEpisodes && b.hasNewEpisodes) return 1;
          return 0;
        });
      case 'recent':
      default:
        // For demo, we'll simulate recency based on hasNewEpisodes
        return [...podcasts].sort((a, b) => {
          if (a.hasNewEpisodes && !b.hasNewEpisodes) return -1;
          if (!a.hasNewEpisodes && b.hasNewEpisodes) return 1;
          return a.name.localeCompare(b.name);
        });
    }
  }
}