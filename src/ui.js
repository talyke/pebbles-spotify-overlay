export default class UI {
  constructor() {
    this.elements = {
      userName: document.getElementById('user-name'),
      loginButton: document.getElementById('login-button'),
      logoutButton: document.getElementById('logout-button'),
      authModal: document.getElementById('auth-modal'),
      notification: document.getElementById('notification'),
      notificationText: document.getElementById('notification-text'),
      newEpisodesTodayGrid: document.getElementById('new-episodes-today-grid'),
      yourShowsGrid: document.getElementById('your-shows-grid'),
      queueList: document.getElementById('queue-list'),
      currentTitle: document.getElementById('current-title'),
      currentPodcast: document.getElementById('current-podcast'),
      currentArtwork: document.getElementById('current-artwork'),
      episodeDescription: document.getElementById('episode-description'),
      progressBar: document.getElementById('progress-bar'),
      miniTitle: document.getElementById('mini-title'),
      miniPodcast: document.getElementById('mini-podcast'),
      miniArtwork: document.getElementById('mini-artwork'),
      playPauseButton: document.getElementById('play-pause-button'),
      miniPlayPause: document.getElementById('mini-play-pause'),
      tabs: document.querySelectorAll('.tab-button'),
      tabContents: document.querySelectorAll('.tab-content')
    };
  }

  showAuthModal() {
    this.elements.authModal.classList.add('show');
  }

  hideAuthModal() {
    this.elements.authModal.classList.remove('show');
  }

  updateLoginState(isLoggedIn) {
    if (isLoggedIn) {
      this.elements.loginButton.style.display = 'none';
      this.elements.logoutButton.style.display = 'block';
    } else {
      this.elements.loginButton.style.display = 'block';
      this.elements.logoutButton.style.display = 'none';
      this.elements.userName.textContent = 'Not logged in';
      
      // Clear content areas when logged out
      this.elements.newEpisodesTodayGrid.innerHTML = '<div class="loading">Log in to view podcasts</div>';
      this.elements.yourShowsGrid.innerHTML = '<div class="loading">Log in to view your shows</div>';
      this.elements.queueList.innerHTML = '<div class="loading">Log in to access your queue</div>';
      
      // Reset player display
      this.updateNowPlaying(null);
    }
  }

  updateUserProfile(user) {
    this.elements.userName.textContent = user.display_name || user.id;
    
    // Add a badge if user is premium
    if (user.product === 'premium') {
      const premiumBadge = document.createElement('span');
      premiumBadge.className = 'premium-badge';
      premiumBadge.textContent = 'Premium';
      this.elements.userName.appendChild(premiumBadge);
    }
  }

  showNotification(message) {
    this.elements.notificationText.textContent = message;
    this.elements.notification.classList.add('show');
    
    setTimeout(() => {
      this.elements.notification.classList.remove('show');
    }, 3000);
  }

  switchTab(tabId) {
    this.elements.tabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.getAttribute('data-tab') === tabId) {
        tab.classList.add('active');
      }
    });
    
    this.elements.tabContents.forEach(content => {
      content.classList.remove('active');
    });
    
    document.getElementById(`${tabId}-tab`).classList.add('active');
  }

  showLoading() {
    this.elements.newEpisodesTodayGrid.innerHTML = '<div class="loading">Loading podcasts...</div>';
    this.elements.yourShowsGrid.innerHTML = '<div class="loading">Loading your shows...</div>';
  }

  hideLoading() {
    // This will be replaced when content is loaded
  }

  renderNewEpisodesToday(podcasts) {
    this.renderPodcastGrid(this.elements.newEpisodesTodayGrid, podcasts, true);
  }

  renderYourShows(podcasts) {
    this.renderPodcastGrid(this.elements.yourShowsGrid, podcasts);
  }

  renderPodcastGrid(container, podcasts, showNewBadge = false) {
    container.innerHTML = '';
    
    if (podcasts.length === 0) {
      container.innerHTML = '<div class="loading">No podcasts found</div>';
      return;
    }
    
    podcasts.forEach(podcast => {
      const card = document.createElement('div');
      card.className = 'podcast-card';
      card.dataset.id = podcast.id;
      card.dataset.uri = podcast.uri;
      
      const hasNewEpisodes = podcast.hasNewEpisodes && showNewBadge;
      
      card.innerHTML = `
        <img class="podcast-card-image" src="${podcast.images[0].url}" alt="${podcast.name}">
        <div class="podcast-card-content">
          <h4 class="podcast-card-title">${podcast.name}</h4>
          <p class="podcast-card-creator">${podcast.publisher}</p>
        </div>
        ${hasNewEpisodes ? '<span class="new-badge">NEW</span>' : ''}
      `;
      
      card.addEventListener('click', () => {
        this.handlePodcastClick(podcast);
      });
      
      container.appendChild(card);
    });
  }

  handlePodcastClick(podcast) {
    // This will be connected to the podcast library
    this.switchTab('now-playing');
    this.showNotification(`Loading ${podcast.name}...`);
  }

  renderQueue(queue) {
    this.elements.queueList.innerHTML = '';
    
    if (queue.length === 0) {
      this.elements.queueList.innerHTML = '<div class="loading">Your queue is empty</div>';
      return;
    }
    
    queue.forEach((item, index) => {
      const queueItem = document.createElement('div');
      queueItem.className = 'queue-item';
      queueItem.dataset.uri = item.uri;
      
      queueItem.innerHTML = `
        <img class="queue-item-image" src="${item.show.images[0].url}" alt="${item.name}">
        <div class="queue-item-info">
          <h4 class="queue-item-title">${item.name}</h4>
          <p class="queue-item-podcast">${item.show.name}</p>
        </div>
        <div class="queue-item-actions">
          <button class="queue-item-button play" data-index="${index}">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
          <button class="queue-item-button remove" data-index="${index}">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;
      
      this.elements.queueList.appendChild(queueItem);
    });
    
    // Add event listeners to queue item buttons
    this.elements.queueList.querySelectorAll('.queue-item-button.play').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        document.dispatchEvent(new CustomEvent('queue:play-item', { detail: { index } }));
      });
    });
    
    this.elements.queueList.querySelectorAll('.queue-item-button.remove').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        document.dispatchEvent(new CustomEvent('queue:remove-item', { detail: { index } }));
      });
    });
  }

  updateNowPlaying(episode, isPlaying = false) {
    if (!episode) {
      this.elements.currentTitle.textContent = 'Not Playing';
      this.elements.currentPodcast.textContent = 'Select a podcast to play';
      this.elements.episodeDescription.textContent = '';
      this.elements.miniTitle.textContent = 'Not Playing';
      this.elements.miniPodcast.textContent = 'Select a podcast to play';
      this.updatePlayButton(false);
      return;
    }
    
    this.elements.currentTitle.textContent = episode.name;
    this.elements.currentPodcast.textContent = episode.show.name;
    this.elements.episodeDescription.innerHTML = episode.description;
    this.elements.currentArtwork.src = episode.show.images[0].url;
    
    this.elements.miniTitle.textContent = episode.name;
    this.elements.miniPodcast.textContent = episode.show.name;
    this.elements.miniArtwork.src = episode.show.images[0].url;
    
    this.updatePlayButton(isPlaying);
  }

  updatePlayButton(isPlaying) {
    if (isPlaying) {
      this.elements.playPauseButton.classList.add('playing');
      this.elements.miniPlayPause.classList.add('playing');
    } else {
      this.elements.playPauseButton.classList.remove('playing');
      this.elements.miniPlayPause.classList.remove('playing');
    }
  }

  updateProgress(progressMs, durationMs) {
    const percent = (progressMs / durationMs) * 100;
    this.elements.progressBar.style.width = `${percent}%`;
  }
}