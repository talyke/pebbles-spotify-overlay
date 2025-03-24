import SpotifyAPI from './spotifyApi.js';
import UI from './ui.js';
import PodcastLibrary from './podcastLibrary.js';
import Player from './player.js';
import AdSkipper from './adSkipper.js';
import Queue from './queue.js';
import Config from './config.js';
import AuthHelper from './authHelper.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const config = new Config();
  const spotifyApi = new SpotifyAPI(config);
  const authHelper = new AuthHelper(spotifyApi);
  const ui = new UI();
  const player = new Player(spotifyApi, ui);
  const adSkipper = new AdSkipper(player, config);
  const queue = new Queue(spotifyApi, player, ui);
  const podcastLibrary = new PodcastLibrary(spotifyApi, ui, player, queue);

  // Setup event listeners
  setupEventListeners(spotifyApi, ui, player, podcastLibrary, queue, config, adSkipper, authHelper);
  
  // Check if user is already authenticated
  initializeApp(spotifyApi, ui, podcastLibrary, authHelper);
});

function setupEventListeners(api, ui, player, library, queue, config, adSkipper, authHelper) {
  // Auth related events
  document.getElementById('login-button').addEventListener('click', () => {
    ui.showAuthModal();
  });
  
  document.getElementById('auth-button').addEventListener('click', () => {
    authHelper.initiateLogin();
  });
  
  document.getElementById('close-modal').addEventListener('click', () => {
    ui.hideAuthModal();
  });
  
  // Tab switching
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      ui.switchTab(tabId);
    });
  });
  
  // Filters
  document.getElementById('new-episodes-today').addEventListener('change', (e) => {
    library.applyFilter('newEpisodesToday', e.target.checked);
  });
  
  document.getElementById('only-new-episodes').addEventListener('change', (e) => {
    library.applyFilter('onlyNewEpisodes', e.target.checked);
  });
  
  document.getElementById('followed-podcasts').addEventListener('change', (e) => {
    library.applyFilter('followedPodcasts', e.target.checked);
  });
  
  // Sort selector
  document.getElementById('sort-by').addEventListener('change', (e) => {
    library.sortPodcasts(e.target.value);
  });
  
  // Player controls
  document.getElementById('play-pause-button').addEventListener('click', () => {
    player.togglePlayPause();
  });
  
  document.getElementById('previous-button').addEventListener('click', () => {
    player.previous();
  });
  
  document.getElementById('next-button').addEventListener('click', () => {
    player.next();
  });
  
  // Mini player controls
  document.getElementById('mini-play-pause').addEventListener('click', () => {
    player.togglePlayPause();
  });
  
  document.getElementById('mini-next').addEventListener('click', () => {
    player.next();
  });
  
  // Settings
  document.getElementById('skip-ads').addEventListener('change', (e) => {
    config.setAdSkipping(e.target.checked);
    if (e.target.checked) {
      adSkipper.enable();
      ui.showNotification('Ad skipping enabled');
    } else {
      adSkipper.disable();
      ui.showNotification('Ad skipping disabled');
    }
  });
  
  document.getElementById('custom-queue').addEventListener('change', (e) => {
    config.setCustomQueue(e.target.checked);
    ui.showNotification(e.target.checked ? 'Custom queue enabled' : 'Custom queue disabled');
  });
  
  // Queue management
  document.getElementById('clear-queue').addEventListener('click', () => {
    queue.clearQueue();
    ui.showNotification('Queue cleared');
  });

  // Logout
  document.getElementById('logout-button').addEventListener('click', () => {
    authHelper.logout();
    ui.updateLoginState(false);
    ui.showNotification('Logged out successfully');
  });
}

function initializeApp(api, ui, library, authHelper) {
  // Check for authentication callback
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  
  if (error) {
    console.error('Authentication error:', error);
    ui.showNotification('Authentication failed: ' + error);
    ui.updateLoginState(false);
    return;
  }
  
  if (code) {
    // Exchange code for token
    ui.showNotification('Authenticating...');
    
    authHelper.handleAuthCallback(code)
      .then(() => {
        window.history.replaceState({}, document.title, '/');
        loadUserData(api, ui, library);
      })
      .catch(error => {
        console.error('Authentication error:', error);
        ui.showNotification('Authentication failed. Please try again.');
        ui.updateLoginState(false);
      });
  } else if (api.isAuthenticated()) {
    // User is already authenticated
    loadUserData(api, ui, library);
  } else {
    // User needs to authenticate
    ui.updateLoginState(false);
  }
}

function loadUserData(api, ui, library) {
  ui.updateLoginState(true);
  ui.showLoading();
  
  // Get user data
  api.getCurrentUser()
    .then(user => {
      ui.updateUserProfile(user);
      return library.loadPodcasts();
    })
    .then(() => {
      ui.hideLoading();
    })
    .catch(error => {
      console.error('Error loading user data:', error);
      ui.hideLoading();
      ui.showNotification('Error loading your data. Please try refreshing.');
    });
}