const searchInput = document.getElementById('search_bar');
const resultsContainer = document.getElementById('results');
const subtitle = document.getElementById('subtitle');
const audioPlayer = document.getElementById('audioPlayer');
const title = document.getElementById('title');
const searchbar = document.getElementById('search_bar');
const result = document.getElementById('results');
let songQueue = []; // Array of { url, name, artist, image }
let currentSongIndex = -1; // -1 means nothing is playing
const customQueue = document.getElementById('custom-queue'); // Queue display element
// Function to update the visual queue
function gotocredits() {
    window.open("CREDITS/credits.html","_self");
}
function updateQueueDisplay() {
    if (songQueue.length === 0) {
        customQueue.innerHTML = '<p>No songs in the queue.</p>';
        return;
    }
    customQueue.innerHTML = songQueue.map((song, idx) => `
        <div class="queue-item${idx === currentSongIndex ? ' queue-item-active' : ''}">
            <img src="${song.image}" alt="${song.name}" class="queue-image">
            <div class="queue-details">
                <p class="queue-song-name">${idx + 1}. ${song.name}</p>
                <p class="queue-artist-name">${song.artist}</p>
            </div>
            <button class="queue-play-btn" title="Play this song" onclick="playFromQueue(${idx})">
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
        </div>
    `).join('');
}

// Play a song from the queue by index
window.playFromQueue = function(idx) {
    if (idx < 0 || idx >= songQueue.length) return;
    currentSongIndex = idx;
    loadAndPlaySong(songQueue[currentSongIndex]);
    updateQueueDisplay();
    updateMediaSession(songQueue[currentSongIndex]);
};

function reloadPage() {
    location.reload();
}
function sanitizeString(str) {
    return str.replace(/'/g, ""); // Removes all single quotes
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

    const apiUrl = `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(query)}&limit=40&page=1`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => { 
            if (data.status === "SUCCESS" && data.data.results.length > 0) {
                resultsContainer.innerHTML = data.data.results.map(song => {
                    const songImage = song.image.find(img => img.quality === "500x500")?.link || 'default_image_url.jpg';
                    const audioUrl = song.downloadUrl.find(url => url.quality === "320kbps")?.link || '#';
                    const songName = sanitizeString(song.name);
                    const artistNames = sanitizeString(song.primaryArtists);
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
    // If this song is already in the queue, play it from there
    const idx = songQueue.findIndex(s => s.url === url);
    if (idx !== -1) {
        playFromQueue(idx);
        return;
    }
    // Otherwise, add to queue and play
    songQueue.push({ url, name, artist, image });
    currentSongIndex = songQueue.length - 1;
    loadAndPlaySong(songQueue[currentSongIndex]);
    updateQueueDisplay();
    updateMediaSession(songQueue[currentSongIndex]);
}

// Play the next song in the queue when the current one ends
audioPlayer.addEventListener('ended', () => {
    if (songQueue.length === 0) {
        updateQueueDisplay();
        return;
    }
    if (currentSongIndex < songQueue.length - 1) {
        currentSongIndex++;
        loadAndPlaySong(songQueue[currentSongIndex]);
        updateQueueDisplay();
        updateMediaSession(songQueue[currentSongIndex]);
    } else {
        // End of queue
        currentSongIndex = -1;
        updateQueueDisplay();
    }
});

// Function to load and play a song
function loadAndPlaySong(song) {
    const audioSource = document.getElementById('audioSource');
    const audioPlayer = document.getElementById('audioPlayer');
    const currentSongImage = document.getElementById('currentSongImage');
    const currentSongName = document.getElementById('currentSongName');
    const currentArtistName = document.getElementById('currentArtistName');
    //const songDownloadBtn = document.getElementById('songDownloadBtn');
    const customPlayer = document.getElementById('customPlayer');

    // Update the audio source
    audioPlayer.currentTime = 0;
    audioSource.src = song.url;
    audioPlayer.load();
    audioPlayer.play();
    
    // Update the song details
    currentSongImage.src = song.image;
    currentSongImage.alt = song.name;
    currentSongName.textContent = song.name;
    currentArtistName.textContent = song.artist;
    
    customPlayer.classList.add('show');
    
    updateMediaSession(song);
    // Set up the download button
    const songDownloadBtn = document.querySelector('.song-download-btn'); // Target the button by class

    songDownloadBtn.onclick = function () {
        const imgElement = songDownloadBtn.querySelector('img'); // Get the <img> inside the button
        if (!imgElement) {
            console.error('No <img> element found inside the button.');
            return;
        }

        // Save the original image source
        const originalImageSrc = imgElement.src;

        // Change the image to a loading spinner
        const spinners = [
            'https://media.tenor.com/jfmI0j5FcpAAAAAM/loading-wtf.gif',
            'https://media.tenor.com/FawYo00tBekAAAAM/loading-thinking.gif',
            'https://media.tenor.com/KEzW7ALwfUAAAAAM/cat-what.gif'
        ];

        // Pick a random spinner
        const randomSpinner = spinners[Math.floor(Math.random() * spinners.length)];

        // Change the image to a random loading spinner and resize it
        imgElement.src = randomSpinner; // Random spinner image
        imgElement.style.width = '50px'; // Set width to 50px
        imgElement.style.height = '50px'; // Set height to 50px
        // Handle the song download
        downloadSong(song.url, song.name, song.artist, song.image)
            .then(() => {
                // Revert the image back to the original after download
                imgElement.src = originalImageSrc;
            })
            .catch((error) => {
                console.error("Error downloading the song: ", error);
                // Revert the image back to the original even if there's an error
                imgElement.src = originalImageSrc;
            });
    };
    
    const songShareBtn = document.getElementById('songShareBtn');
    if (songShareBtn) {
        songShareBtn.onclick = function () {
            // Get current song info
            const songName = document.getElementById('currentSongName').textContent;
            const artistName = document.getElementById('currentArtistName').textContent;
            // Build share URL with params
            const url = `${window.location.origin}${window.location.pathname}?songname=${encodeURIComponent(songName)}&artist=${encodeURIComponent(artistName)}`;
            const shareData = {
                title: `${songName} - ${artistName} | Zolt`,
                text: `🎵 Listen to "${songName}" by ${artistName} on Zolt!`,
                url: url
            };
            if (navigator.share) {
                navigator.share(shareData).catch(() => {});
            } else {
                navigator.clipboard.writeText(url);
                alert('Share not supported. Link copied to clipboard!');
            }
        };
    }
    // --- ADD THIS BLOCK TO UPDATE FULLSCREEN IF ACTIVE ---
    if (isFullscreenActive) {
        updateFullscreenPlayer(song);
    }
    onSongChange(song); // <-- Add this here
    // ------------------------------------------------------
}

// Function to download the song with a new name
async function downloadSong(url, name, artist, imageUrl) {
    // Guess file extension/type
    const isMp3 = url.toLowerCase().includes('.mp3') || url.toLowerCase().includes('mp3');
    const fileExt = isMp3 ? '.mp3' : '.m4a';
    const newFileName = name + '_from_Zolt' + fileExt;

    // Fetch audio as ArrayBuffer
    const audioResponse = await fetch(url);
    const audioBuffer = await audioResponse.arrayBuffer();

    if (isMp3) {
        // Fetch cover image as ArrayBuffer
        let coverBuffer = null;
        try {
            const imgResponse = await fetch(imageUrl, { mode: 'cors' });
            coverBuffer = await imgResponse.arrayBuffer();
        } catch (e) {
            coverBuffer = null;
        }

        // Write ID3 tags
        const writer = new ID3Writer(new Uint8Array(audioBuffer));
        writer.setFrame('TIT2', name)
            .setFrame('TPE1', [artist]);
        if (coverBuffer) {
            writer.setFrame('APIC', {
                type: 3,
                data: coverBuffer,
                description: 'Cover',
                useUnicodeEncoding: false,
                mimeType: 'image/jpeg'
            });
        }
        writer.addTag();

        // Create a Blob with the tagged audio
        const taggedSong = writer.getBlob();
        const blobUrl = URL.createObjectURL(taggedSong);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = newFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } else {
        // Not MP3: just download as-is, no tags
        const blob = new Blob([audioBuffer]);
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = newFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    }
}
// Close button functionality
document.getElementById('closePlayer').addEventListener('click', () => {
    const customPlayer = document.getElementById('customPlayer');
    // audioPlayer.pause();
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


// Close popup when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-container')) {
        document.querySelectorAll('.popup-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});

function moveAhead() {
    if (songQueue.length === 0) {
        console.log("The queue is empty! Add some songs first.");
        return;
    }

    if (currentSongIndex < songQueue.length - 1) {
        currentSongIndex++; // Move to the next song
    } else {
        console.log("No more songs ahead! Playing the first song in the queue.");
        currentSongIndex = 0; // Restart at the first song
    }

    const nextSong = songQueue[currentSongIndex];
    loadAndPlaySong(nextSong); // Play the next or first song
    updateQueueDisplay(); // Update the queue visualization
    updateMediaSession(nextSong); // Update Media Session metadata
}

// Function to move to the previous song in the queue
function moveBackward() {
    if (songQueue.length === 0) {
        console.log("The queue is empty! Add some songs first.");
        return;
    }

    if (currentSongIndex > 0) {
        currentSongIndex--; // Move to the previous song
        const previousSong = songQueue[currentSongIndex];
        loadAndPlaySong(previousSong); // Play the previous song
        updateQueueDisplay(); // Update the queue visualization
        updateMediaSession(previousSong); // Update Media Session metadata
    } else {
        console.log("No more songs behind! Playing the first song in the queue.");
        currentSongIndex = 0; // Reset to the first song
        const firstSong = songQueue[currentSongIndex];
        loadAndPlaySong(firstSong); // Play the first song
        updateQueueDisplay(); // Update the queue visualization
        updateMediaSession(firstSong); // Update Media Session metadata
    }
}

//song repeater
// const audioPlayer = document.getElementById('audioPlayer');
const songRepeatBtn = document.getElementById('songRepeatBtn');
const repeatIcon = document.getElementById('repeatIcon');

// Flag to track the repeat state
let isRepeatOn = false;

// Add event listener to toggle repeat state
songRepeatBtn.addEventListener('click', () => {
  isRepeatOn = !isRepeatOn; // Toggle the repeat state
  
  if (isRepeatOn) {
    songRepeatBtn.classList.add('on'); // Add the 'on' class to invert colors
    audioPlayer.loop = true; // Enable looping (repeat current song)
  } else {
    songRepeatBtn.classList.remove('on'); // Remove the 'on' class to reset colors
    audioPlayer.loop = false; // Disable looping
  }
});
// Function to update Media Session metadata
function updateMediaSession(song) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: song.artist,
            artwork: [
                { src: song.image, sizes: '96x96', type: 'image/png' },
                { src: song.image, sizes: '128x128', type: 'image/png' },
                { src: song.image, sizes: '192x192', type: 'image/png' },
                { src: song.image, sizes: '256x256', type: 'image/png' },
                { src: song.image, sizes: '384x384', type: 'image/png' },
                { src: song.image, sizes: '512x512', type: 'image/png' },
            ]
        });

        // Set up media session action handlers
        navigator.mediaSession.setActionHandler('play', () => {
            audioPlayer.play();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            audioPlayer.pause();
        });
        navigator.mediaSession.setActionHandler('previoustrack', moveBackward); // Calls your function
        navigator.mediaSession.setActionHandler('nexttrack', moveAhead); // Calls your function
    }
}

// Helper function to return the site name
function siteName() {
    return "Zolt"; // Replace with your site name or logic
}


//dynamic color systummmmmmmm 
const colorThief = new ColorThief();

// Calculate relative luminance
function getLuminance(r, g, b) {
    let [rs, gs, bs] = [r / 255, g / 255, b / 255].map(c => {
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

// Sort colors by luminance (darkest first)
function sortColorsByLuminance(colors) {
    return colors.sort((a, b) => getLuminance(...a) - getLuminance(...b));
}

// Update player colors
function updatePlayerColors(colors) {
    const customPlayer = document.getElementById('customPlayer');
    const songName = document.getElementById('currentSongName');
    const artistName = document.getElementById('currentArtistName');
    const closeButton = document.querySelector('.close-btn img');

    if (colors && colors.length >= 2) {
        // Sort colors by luminance to prefer darker colors
        const sortedColors = sortColorsByLuminance(colors);
        const [r1, g1, b1] = sortedColors[0];
        const [r2, g2, b2] = sortedColors[1];

        // Set background gradient between the two darkest colors
        customPlayer.style.background = `linear-gradient(to bottom, 
            rgba(${r1},${g1},${b1},0.95), 
            rgba(${r2},${g2},${b2},0.7))`;

        // Get appropriate text colors
        const textColors = getTextColors(sortedColors[0]);

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
            const palette = colorThief.getPalette(img, 5); // Get top 5 dominant colors
            updatePlayerColors(palette);
        } catch (error) {
            console.log('Could not extract colors from image:', error);
            // Fallback colors
            updatePlayerColors([[33, 33, 33], [33, 33, 33]]);
        }
    }
}

// Set up the image loading
const songImage = document.getElementById('currentSongImage');
songImage.crossOrigin = "Anonymous";

songImage.addEventListener('load', function () {
    handleImageLoad(this);
});

songImage.addEventListener('error', function () {
    console.log('Error loading image');
    updatePlayerColors([[33, 33, 33], [33, 33, 33]]);
});

// --- Fullscreen Player Logic ---

const fullscreenBtn = document.getElementById('fullscreenPlayer');
const fullscreenOverlay = document.getElementById('fullscreenOverlay');
const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
const fullscreenSongImage = document.getElementById('fullscreenSongImage');
const fullscreenSongTitle = document.getElementById('fullscreenSongTitle');
const fullscreenArtistName = document.getElementById('fullscreenArtistName');
const fullscreenPlayerControls = document.querySelector('.fullscreen-player-controls');
const audioPlayerWrapper = document.querySelector('.plyr-audio-wrapper');
const controlBtns = document.querySelector('.control-btns'); // Add this line
// const fullscrbtn = document.getElementById('fullscreenbtn');

let isFullscreenActive = false;

// Helper to update fullscreen player info
function updateFullscreenPlayer(song) {
    fullscreenSongImage.src = song.image;
    fullscreenSongImage.alt = song.name;
    fullscreenSongTitle.textContent = song.name;
    fullscreenArtistName.textContent = song.artist;
}

// Show fullscreen overlay with animation
fullscreenBtn.addEventListener('click', () => {
    // Get current song info
    const currentSong = {
        name: document.getElementById('currentSongName').textContent,
        artist: document.getElementById('currentArtistName').textContent,
        image: document.getElementById('currentSongImage').src
    };
    updateFullscreenPlayer(currentSong);

    // Move the audio player and controls into the fullscreen overlay
    fullscreenPlayerControls.appendChild(audioPlayerWrapper);
    fullscreenPlayerControls.appendChild(controlBtns);

    fullscreenOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    isFullscreenActive = true;
    fullscreenPlayer.style.display = 'none';
});

// Close fullscreen overlay
closeFullscreenBtn.addEventListener('click', () => {
    // Move the audio player and controls back to the custom player (before the queue)
    const customPlayer = document.getElementById('customPlayer');
    const queue = document.getElementById('custom-queue');
    if (audioPlayerWrapper && queue) {
        customPlayer.insertBefore(audioPlayerWrapper, queue);
    }
    if (controlBtns && queue) {
        customPlayer.insertBefore(controlBtns, queue);
    }

    fullscreenOverlay.classList.remove('active');
    document.body.style.overflow = '';
    fullscreenBtn.style.display = 'block';
    isFullscreenActive = false;
});

// Optional: ESC key closes fullscreen
document.addEventListener('keydown', (e) => {
    if (isFullscreenActive && (e.key === 'Escape' || e.key === 'Esc')) {
        closeFullscreenBtn.click();
    }
});

// When song changes, update fullscreen info if open
function updateSong(imageUrl, songName, artistName) {
    const img = document.getElementById('currentSongImage');
    img.src = imageUrl + '?timestamp=' + new Date().getTime();
    document.getElementById('currentSongName').textContent = songName;
    document.getElementById('currentArtistName').textContent = artistName;

    if (isFullscreenActive) {
        updateFullscreenPlayer({ image: img.src, name: songName, artist: artistName });
    }
}

// --- Fullscreen Dynamic Color Logic ---
function updateFullscreenColors(colors) {
    const overlay = document.getElementById('fullscreenOverlay');
    const contentBox = document.querySelector('.fullscreen-content');
    const songTitle = document.getElementById('fullscreenSongTitle');
    const artistName = document.getElementById('fullscreenArtistName');
    const closeBtnImg = document.querySelector('#closeFullscreenBtn img');

    if (colors && colors.length >= 2) {
        // Sort colors by luminance to prefer darker colors
        const sortedColors = sortColorsByLuminance(colors);
        const [r1, g1, b1] = sortedColors[0];
        const [r2, g2, b2] = sortedColors[1];

        // Overlay: use a very transparent version of the lightest color
        const [lr, lg, lb] = sortedColors[sortedColors.length - 1];
        overlay.style.background = `linear-gradient(120deg, rgba(${lr},${lg},${lb},1.45))`;

        // Content: use the two darkest colors, less transparent
        contentBox.style.background = `linear-gradient(120deg, rgba(${r1},${g1},${b1},1), rgba(${r2},${g2},${b2},1.85))`;

        // Get appropriate text colors
        const textColors = getTextColors(sortedColors[0]);

        // Apply text colors
        songTitle.style.color = textColors.primary;
        artistName.style.color = textColors.secondary;

        // Update close button color
        closeBtnImg.src = textColors.primary === 'rgb(255, 255, 255)'
            ? 'https://img.icons8.com/ios-glyphs/30/FFFFFF/multiply.png'
            : 'https://img.icons8.com/ios-glyphs/30/000000/multiply.png';
    }
}

// Handle image load and color extraction for fullscreen
function handleFullscreenImageLoad(img) {
    if (img.complete) {
        try {
            const palette = colorThief.getPalette(img, 5); // Get top 5 dominant colors
            updateFullscreenColors(palette);
        } catch (error) {
            // Fallback colors
            updateFullscreenColors([[33, 33, 33], [33, 33, 33]]);
        }
    }
}

// Set up the image loading for fullscreen
fullscreenSongImage.crossOrigin = "Anonymous";
fullscreenSongImage.addEventListener('load', function () {
    handleFullscreenImageLoad(this);
});
fullscreenSongImage.addEventListener('error', function () {
    updateFullscreenColors([[33, 33, 33], [33, 33, 33]]);
});

// --- LIKE SONG FEATURE ---

// Helper to get/set playlists in localStorage
function getPlaylists() {
    return JSON.parse(localStorage.getItem('playlists') || '{}');
}
function setPlaylists(playlists) {
    localStorage.setItem('playlists', JSON.stringify(playlists));
}

// Add event listener for like button
document.addEventListener('DOMContentLoaded', function () {
    // ...existing code...

    const likeBtn = document.getElementById('songLikeBtn');
    if (likeBtn) {
        likeBtn.addEventListener('click', function () {
            // Get current song info
            const songName = document.getElementById('currentSongName').textContent;
            const artistName = document.getElementById('currentArtistName').textContent;
            const songImage = document.getElementById('currentSongImage').src;
            const audioSrc = document.getElementById('audioSource').src;

            // Store with correct keys for queue/playback compatibility
            const songObj = {
                name: songName,
                artist: artistName,
                image: songImage,
                url: audioSrc // Use 'url' instead of 'src'
            };

            let playlists = getPlaylists();
            if (!playlists['Liked Songs']) playlists['Liked Songs'] = [];
            // Avoid duplicates
            if (!playlists['Liked Songs'].some(s => s.url === songObj.url)) {
                playlists['Liked Songs'].push(songObj);
                setPlaylists(playlists);
                alert('Added to Liked Songs!');
            } else {
                alert('Already in Liked Songs!');
            }
        });
    }
});

// Render Liked Songs and allow playback
function showLikedSongs() {
    const playlists = getPlaylists();
    const liked = playlists['Liked Songs'] || [];
    if (liked.length === 0) {
        resultsContainer.innerHTML = '<p>No liked songs yet.</p>';
        return;
    }
    resultsContainer.innerHTML = liked.map((song, idx) => `
        <div class="song-card">
            <img src="${song.image}" alt="${song.name}" class="song-image">
            <div class="song-details">
                <h3>${song.name}</h3>
                <p style="color:grey; font-size:0.8rem;">-${song.artist}</p>
                <button onclick="playSong('${song.url}', '${sanitizeString(song.name)}', '${sanitizeString(song.artist)}', '${song.image}')" class="play-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="white">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Optionally, add a button somewhere in your HTML to call showLikedSongs()
// <button onclick="showLikedSongs()">Show Liked Songs</button>

// --- SHARE SONG FEATURE ---
// Share button logic: share site URL with song name & artist as params


// --- AUTOPLAY SONG FROM URL PARAMS ON PAGE LOAD ---
window.addEventListener('DOMContentLoaded', async () => {
    // Helper to get URL params
    function getParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }
    const songName = getParam('songname');
    const artistName = getParam('artist');
    if (songName && artistName) {
        // Optionally, show loading UI here
        // Use your search API to find the song
        const apiUrl = `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(songName + ' ' + artistName)}&limit=1&page=1`;
        try {
            const res = await fetch(apiUrl);
            const data = await res.json();
            if (data.status === "SUCCESS" && data.data.results.length > 0) {
                const song = data.data.results[0];
                const songImage = song.image.find(img => img.quality === "500x500")?.link || 'default_image_url.jpg';
                const audioUrl = song.downloadUrl.find(url => url.quality === "320kbps")?.link || '#';
                // Play the song directly
                playSong(audioUrl, song.name.replace(/'/g, ""), song.primaryArtists.replace(/'/g, ""), songImage);
            } else {
                alert("Song not found!");
            }
        } catch (e) {
            alert("Error loading song from link.");
        }
    }
});

// --- FULLSCREEN PLAYER BUG FIX ---

// Helper to update fullscreen overlay UI
function updateFullscreenUI(song) {
    document.getElementById('fullscreenSongImage').src = song.image;
    document.getElementById('fullscreenSongTitle').textContent = song.name;
    document.getElementById('fullscreenArtistName').textContent = song.artist;
}

// --- FULLSCREEN PLAYER ANIMATION ON SONG CHANGE ---

// Add CSS for animation (slide/morph effect)
function injectFullscreenSongChangeAnimationCSS() {
    if (document.getElementById('fullscreen-song-change-anim-css')) return;
    const style = document.createElement('style');
    style.id = 'fullscreen-song-change-anim-css';
    style.innerHTML = `
    .fullscreen-song-fade {
        animation: fullscreenSongFade 0.5s;
    }
    @keyframes fullscreenSongFade {
        0% {
            opacity: 0;
            transform: translateY(40px) scale(0.97);
            filter: blur(8px);
        }
        60% {
            opacity: 1;
            transform: translateY(-8px) scale(1.02);
            filter: blur(0px);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
        }
    }
    `;
    document.head.appendChild(style);
}
injectFullscreenSongChangeAnimationCSS();

// Helper to animate fullscreen song change
function animateFullscreenSongChange() {
    const img = document.getElementById('fullscreenSongImage');
    const title = document.getElementById('fullscreenSongTitle');
    const artist = document.getElementById('fullscreenArtistName');
    [img, title, artist].forEach(el => {
        el.classList.remove('fullscreen-song-fade'); // reset if already animating
        // Force reflow to restart animation
        void el.offsetWidth;
        el.classList.add('fullscreen-song-fade');
    });
}

// Listen for song change and update fullscreen if open, with animation
function onSongChange(song) {
    // If fullscreen overlay is visible, update its UI too
    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    if (
        fullscreenOverlay &&
        fullscreenOverlay.classList.contains('active')
    ) {
        updateFullscreenUI(song);
        animateFullscreenSongChange();
    }
}

// --- HOOK ANIMATION INTO SONG CHANGES ---

// After loadAndPlaySong, call onSongChange if fullscreen is active
// const originalLoadAndPlaySong = loadAndPlaySong;
// loadAndPlaySong = function(song) {
//     originalLoadAndPlaySong(song);
//     onSongChange(song);
// };

// --- Custom Audio Player Controls ---
const audio = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playPauseIcon = document.getElementById('playPauseIcon');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const muteBtn = document.getElementById('muteBtn');
const muteIcon = document.getElementById('muteIcon');
const volumeBar = document.getElementById('volumeBar');

// Format time helper
function formatTime(sec) {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// Play/Pause toggle
playPauseBtn.onclick = function() {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
};
audio.onplay = () => {
    playPauseIcon.src = "https://img.icons8.com/ios-filled/50/FFFFFF/pause--v1.png";
    playPauseIcon.alt = "Pause";
};
audio.onpause = () => {
    playPauseIcon.src = "https://img.icons8.com/ios-filled/50/FFFFFF/play--v1.png";
    playPauseIcon.alt = "Play";
};

// Progress bar update
audio.ontimeupdate = () => {
    progressBar.value = audio.currentTime;
    currentTimeEl.textContent = formatTime(audio.currentTime);
};
audio.onloadedmetadata = () => {
    progressBar.max = audio.duration;
    durationEl.textContent = formatTime(audio.duration);
};
progressBar.oninput = function() {
    audio.currentTime = this.value;
};

// Volume controls
volumeBar.oninput = function() {
    audio.volume = this.value;
    muteIcon.src = audio.volume == 0
        ? "https://img.icons8.com/ios-filled/50/FFFFFF/mute--v1.png"
        : "https://img.icons8.com/ios-filled/50/FFFFFF/medium-volume.png";
};
muteBtn.onclick = function() {
    if (audio.volume > 0) {
        audio.dataset.prevVolume = audio.volume;
        audio.volume = 0;
        volumeBar.value = 0;
        muteIcon.src = "https://img.icons8.com/ios-filled/50/FFFFFF/mute--v1.png";
    } else {
        audio.volume = audio.dataset.prevVolume || 1;
        volumeBar.value = audio.volume;
        muteIcon.src = "https://img.icons8.com/ios-filled/50/FFFFFF/medium-volume.png";
    }
};

// --- LYRICS IN FULLSCREEN OVERLAY ---
const showLyricsBtn = document.getElementById('showLyricsBtn');
const lyricsContainer = document.getElementById('lyricsContainer');
let lyricsData = [];
let lyricsTimer = null;

// Parse LRC format
function parseLRC(lrc) {
    const lines = lrc.split('\n');
    const result = [];
    const timeExp = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?]/;
    for (let line of lines) {
        const match = timeExp.exec(line);
        if (match) {
            const min = parseInt(match[1]);
            const sec = parseInt(match[2]);
            const ms = match[3] ? parseInt(match[3].padEnd(3, '0')) : 0;
            const time = min * 60 + sec + ms / 1000;
            const text = line.replace(timeExp, '').trim();
            if (text) result.push({ time, text });
        }
    }
    return result;
}

// Use new API bro
async function fetchLyrics(song, artist) {
    const query = `${song} ${artist}`;
    const url = `https://api.paxsenix.biz.id/lyrics/lrcget?q=${encodeURIComponent(query)}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.ok && Array.isArray(data.lyrics) && data.lyrics.length > 0) {
            const mergedLRC = data.lyrics.join('\n');
            return { type: 'lrc', content: mergedLRC };
        }
    } catch (err) {
        console.error('Error fetching lyrics:', err);
    }
    return null;
}

function renderLyrics(lyricsArr) {
    lyricsContainer.innerHTML = lyricsArr.map((line, idx) =>
        `<div class="lyric-line" data-idx="${idx}">${line.text}</div>`
    ).join('');
}

function highlightLyric(currentTime) {
    if (!lyricsData.length) return;
    let idx = lyricsData.findIndex((line, i) =>
        currentTime < line.time && i > 0
    );
    if (idx === -1) idx = lyricsData.length - 1;
    else if (idx > 0) idx = idx - 1;
    document.querySelectorAll('.lyric-line').forEach((el, i) => {
        if (i === idx) {
            el.classList.add('active');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            el.classList.remove('active');
        }
    });
}

showLyricsBtn.addEventListener('click', async () => {
    if (lyricsContainer.style.display === 'block') {
        lyricsContainer.style.display = 'none';
        showLyricsBtn.textContent = 'Show Lyrics';
        if (lyricsTimer) {
            audio.removeEventListener('timeupdate', lyricsTimer);
            lyricsTimer = null;
        }
        return;
    }

    lyricsContainer.innerHTML = '<span style="opacity:0.7;">Loading lyrics...</span>';
    lyricsContainer.style.display = 'block';
    showLyricsBtn.textContent = 'Hide Lyrics';

    const song = fullscreenSongTitle.textContent;
    const artist = fullscreenArtistName.textContent;

    const result = await fetchLyrics(song, artist);
    if (!result) {
        lyricsContainer.innerHTML = '<span style="opacity:0.7;">No lyrics found.</span>';
        return;
    }

    if (result.type === 'lrc') {
        lyricsData = parseLRC(result.content);
        if (!lyricsData.length) {
            lyricsContainer.innerHTML = '<span style="opacity:0.7;">No synced lyrics found.</span>';
            return;
        }
        renderLyrics(lyricsData);
        lyricsTimer = () => highlightLyric(audio.currentTime);
        audio.addEventListener('timeupdate', lyricsTimer);
        highlightLyric(audio.currentTime);
    } else {
        lyricsContainer.innerHTML = `<div style="white-space:pre-line;opacity:0.85;">${result.content}</div>`;
    }
});

closeFullscreenBtn.addEventListener('click', () => {
    lyricsContainer.style.display = 'none';
    showLyricsBtn.textContent = 'Show Lyrics';
    if (lyricsTimer) {
        audio.removeEventListener('timeupdate', lyricsTimer);
        lyricsTimer = null;
    }
});

function resetLyricsOnSongChange() {
    lyricsContainer.style.display = 'none';
    showLyricsBtn.textContent = 'Show Lyrics';
    lyricsContainer.innerHTML = '';
    if (lyricsTimer) {
        audio.removeEventListener('timeupdate', lyricsTimer);
        lyricsTimer = null;
    }
}
fullscreenBtn.addEventListener('click', resetLyricsOnSongChange);
