const searchInput = document.getElementById('search_bar');
const resultsContainer = document.getElementById('results');
const subtitle = document.getElementById('subtitle');
const audioPlayer = document.getElementById('audioPlayer');
const title = document.getElementById('title');
const searchbar = document.getElementById('search_bar');
const result = document.getElementById('results');
const songQueue = []; // Queue to store song details
const customQueue = document.getElementById('custom-queue'); // Queue display element
// Function to update the visual queue
function updateQueueDisplay() {
    if (songQueue.length === 0) {
        customQueue.innerHTML = '<p>No songs in the queue.</p>';
    } else {
        customQueue.innerHTML = songQueue.map((song, index) => `
            <div class="queue-item">
                <img src="${song.image}" alt="${song.name}" class="queue-image">
                <div class="queue-details">
                    <p class="queue-song-name">${index + 1}. ${song.name}</p>
                    <p class="queue-artist-name">${song.artist}</p>
                </div>
            </div>
        `).join('');
    }
}
function reloadPage() {
    location.reload();
}
const aboutusbtn = document.getElementsByClassName("aboutus");
searchInput.addEventListener('keydown', function (event) {
    const query = this.value.trim();
    if (event.key === 'Enter' && query.length >= 2) {
        event.preventDefault();
        searchMusic(query);
        searchbar.classList.add('search_bar-move');
        title.classList.add('title-move');
        result.classList.add('results-move');
        subtitle.style.display = "none";
        openSidebarBtn.classList.add('move');
        // aboutusbtn.classList.add('move');
        Array.from(aboutusbtn).forEach(btn => btn.classList.add('move'));
    }
});
function searchMusic(query) {
    resultsContainer.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
      </div>
    `;
  
    const apiUrl = `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(query)}`;
  
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.status === "SUCCESS" && data.data.results.length > 0) {
          resultsContainer.innerHTML = data.data.results.map(song => {
            const songImage = song.image.find(img => img.quality === "500x500")?.link || 'default_image_url.jpg';
            const audioUrl = song.downloadUrl.find(url => url.quality === "320kbps")?.link || '#';
            const songName = song.name;
            const artistNames = song.primaryArtists;
  
            return `
              <div class="song-card">
                <img src="${songImage}" alt="${songName}" class="song-image">
                <div class="song-details">
                  <h3>${songName}</h3>
                  <p style="color:grey; font-size:0.8rem;">-${artistNames}</p>
                  <button onclick="playSong('${audioUrl}', '${songName}', '${artistNames}', '${songImage}')" class="play-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <!-- Add to playlist button -->
                  <button onclick="addToPlaylistPrompt('${songName}', '${artistNames}', '${audioUrl}', '${songImage}')" class="add-to-playlist-btn">
                    <img src="https://img.icons8.com/external-tal-revivo-bold-tal-revivo/96/FFFFFF/external-add-a-song-to-the-playlist-app-music-bold-tal-revivo.png" alt="Add to Playlist">
                  </button>
                </div>
              </div>
            `;
          }).join('');
        } else {
          resultsContainer.innerHTML = '<p>No results found.</p>';
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        resultsContainer.innerHTML = '<p>An error occurred while fetching the data.</p>';
      });
  }
  

function playSong(url, name, artist, image) {
    const audioSource = document.getElementById('audioSource');
    const currentSongImage = document.getElementById('currentSongImage');
    const currentSongName = document.getElementById('currentSongName');
    const currentArtistName = document.getElementById('currentArtistName');

    // Check if a song is already playing
    if (!audioPlayer.paused && audioPlayer.currentTime > 0) {
        // Append the new song to the queue
        songQueue.push({ url, name, artist, image });
        updateQueueDisplay(); // Update the queue visualization
        // alert(`${name} has been added to the queue.`);
    } else {
        // Play the song immediately if no song is currently playing
        loadAndPlaySong({ url, name, artist, image });
    }
}

// Play the next song in the queue when the current one ends
audioPlayer.addEventListener('ended', () => {
    if (songQueue.length > 0) {
        const nextSong = songQueue.shift(); // Get the next song in the queue
        loadAndPlaySong(nextSong); // Play the next song
        updateQueueDisplay(); // Update the queue visualization
    } else {
        console.log('Queue is empty.');
        updateQueueDisplay(); // Update the queue visualization
    }
});

// Function to load and play a song
function loadAndPlaySong(song) {
    const audioSource = document.getElementById('audioSource');
    const audioPlayer = document.getElementById('audioPlayer');
    const currentSongImage = document.getElementById('currentSongImage');
    const currentSongName = document.getElementById('currentSongName');
    const currentArtistName = document.getElementById('currentArtistName');

    // Update the audio source
    audioSource.src = song.url;
    audioPlayer.load();
    audioPlayer.play();

    // Update the song details
    currentSongImage.src = song.image;
    currentSongImage.alt = song.name;
    currentSongName.textContent = song.name;
    currentArtistName.textContent = song.artist;

    // Ensure the player is visible
    const customPlayer = document.getElementById('customPlayer');
    customPlayer.classList.add('show');
}


// Close button functionality
document.getElementById('closePlayer').addEventListener('click', () => {
    const customPlayer = document.getElementById('customPlayer');
    audioPlayer.pause();
    customPlayer.classList.remove('show');
});
function toggleMenu(menuButton) {
    const popupMenu = menuButton.nextElementSibling;
    const isMenuVisible = popupMenu.style.display === 'block';
    popupMenu.style.display = isMenuVisible ? 'none' : 'block';

    // Close other open menus
    document.querySelectorAll('.popup-menu').forEach(menu => {
        if (menu !== popupMenu) {
            menu.style.display = 'none';
        }
    });
}
//song aagad and pachad
// Close popup when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-container')) {
        document.querySelectorAll('.popup-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});
let currentSongIndex = 0; // Start with the first song

function moveAhead() {
    if (songQueue.length === 0) {
        console.log("The queue is empty! Add some songs first."); // Queue is empty check
        return;
    }

    if (currentSongIndex < songQueue.length - 1) {
        currentSongIndex++;
        const { url, name, artist, image } = songQueue[currentSongIndex];
        playSong(url, name, artist, image); // Play the next song
        updateQueueDisplay(); // Update the queue visualization
    } else {
      console.log(songQueue);  
      console.log("No more songs ahead!"); // You're at the last song
    }
}

function moveBackward() {
    if (songQueue.length === 0) {
        console.log("The queue is empty! Add some songs first."); // Queue is empty check
        return;
    }

    if (currentSongIndex > 0) {
        currentSongIndex--;
        const { url, name, artist, image } = songQueue[currentSongIndex];
        playSong(url, name, artist, image); // Play the previous song
        updateQueueDisplay(); // Update the queue visualization
    } else {
        console.log(songQueue);
        console.log("No more songs behind!"); // You're at the first song
    }
}


//dynamic color systummmmmmmm 
const colorThief = new ColorThief();

// Calculate relative luminance
function getLuminance(r, g, b) {
    let [rs, gs, bs] = [r/255, g/255, b/255].map(c => {
        if (c <= 0.03928) {
            return c / 12.92;
        }
        return Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Get contrasting text color
function getTextColors(backgroundColor) {
    const luminance = getLuminance(...backgroundColor);
    
    if (luminance > 0.5) {
        // Dark text for light backgrounds
        return {
            primary: 'rgb(24, 24, 24)',    // Almost black for main text
            secondary: 'rgb(71, 71, 71)'    // Darker gray for artist name
        };
    } else {
        // Light text for dark backgrounds
        return {
            primary: 'rgb(255, 255, 255)',  // White for main text
            secondary: 'rgba(255, 255, 255, 0.8)'  // Slightly transparent white for artist name
        };
    }
}

// Update player colors
function updatePlayerColors(color) {
    const customPlayer = document.getElementById('customPlayer');
    const songName = document.getElementById('currentSongName');
    const artistName = document.getElementById('currentArtistName');
    const closeButton = document.querySelector('.close-btn img');
    
    if (color) {
        const [r, g, b] = color;
        
        // Set background gradient
        customPlayer.style.background = `linear-gradient(to bottom, 
            rgba(${r},${g},${b},0.95), 
            rgba(${r},${g},${b},0.7))`;
            
        // Get appropriate text colors
        const textColors = getTextColors(color);
        
        // Apply text colors
        songName.style.color = textColors.primary;
        artistName.style.color = textColors.secondary;
        
        // Update close button color
        closeButton.src = textColors.primary === 'rgb(255, 255, 255)' 
            ? 'https://img.icons8.com/ios-glyphs/30/FFFFFF/multiply.png'
            : 'https://img.icons8.com/ios-glyphs/30/000000/multiply.png';
    }
}

// Handle image load and color extraction
function handleImageLoad(img) {
    if (img.complete) {
        try {
            const color = colorThief.getColor(img);
            updatePlayerColors(color);
        } catch (error) {
            console.log('Could not extract color from image:', error);
            // Fallback colors
            updatePlayerColors([33, 33, 33]);
        }
    }
}

// Set up the image loading
const songImage = document.getElementById('currentSongImage');
songImage.crossOrigin = "Anonymous";

songImage.addEventListener('load', function() {
    handleImageLoad(this);
});

songImage.addEventListener('error', function() {
    console.log('Error loading image');
    updatePlayerColors([33, 33, 33]);
});

// Function to update song
function updateSong(imageUrl, songName, artistName) {
    const img = document.getElementById('currentSongImage');
    img.src = imageUrl + '?timestamp=' + new Date().getTime();
    document.getElementById('currentSongName').textContent = songName;
    document.getElementById('currentArtistName').textContent = artistName;
}