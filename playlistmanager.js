const playlistManager = document.getElementById('playlist-manager');
const playlistNameInput = document.getElementById('playlist-name');
const createPlaylistBtn = document.getElementById('create-playlist-btn');
const playlistsContainer = document.getElementById('playlists');

// Function to get playlists from localStorage
function getPlaylists() {
    return JSON.parse(localStorage.getItem('playlists')) || {};
}

// Function to save playlists to localStorage
function savePlaylists(playlists) {
    localStorage.setItem('playlists', JSON.stringify(playlists));
}

// Function to create a new playlist
function createPlaylist() {
    const playlistName = playlistNameInput.value.trim();
    if (!playlistName) {
        alert('Please enter a playlist name.');
        return;
    }

    const playlists = getPlaylists();
    if (playlists[playlistName]) {
        alert('Playlist with this name already exists.');
        return;
    }

    playlists[playlistName] = [];
    savePlaylists(playlists);
    playlistNameInput.value = '';
    updatePlaylistsDisplay();
}

// Function to add a song to a playlist
function addSongToPlaylist(playlistName, song) {
    const playlists = getPlaylists();
    if (!playlists[playlistName]) {
        alert('Playlist not found.');
        return;
    }

    playlists[playlistName].push(song);
    savePlaylists(playlists);
    alert(`Added "${song.name}" to playlist "${playlistName}".`);
    updatePlaylistsDisplay();
}
function deletePlaylist(playlistName) {
    const playlists = getPlaylists();
    if (!playlists[playlistName]) {
        alert('Playlist not found.');
        return;
    }

    if (confirm(`Are you sure you want to delete the playlist "${playlistName}"?`)) {
        delete playlists[playlistName];
        savePlaylists(playlists);
        updatePlaylistsDisplay();
    }
}
// Function to remove a song from a playlist
function removeSongFromPlaylist(playlistName, songIndex) {
    const playlists = getPlaylists();
    if (!playlists[playlistName]) {
        alert('Playlist not found.');
        return;
    }

    playlists[playlistName].splice(songIndex, 1);
    savePlaylists(playlists);
    alert(`Removed song from playlist "${playlistName}".`);
    updatePlaylistsDisplay();
}

// Function to update the playlist display
function updatePlaylistsDisplay() {
    const playlists = getPlaylists();
    playlistsContainer.innerHTML = Object.keys(playlists).map(playlistName => {
        const songs = playlists[playlistName];
        return `
            <div class="playlist">
                <h3 class="playlist-name" onclick="togglePlaylist('${playlistName}')">
                    ${playlistName}
                    <span class="dropdown-arrow">▼</span>
                </h3>
                <ul id="playlist-${playlistName}" class="songs-list" style="display: none;">
                    ${songs.map(song => `
                        <li>
                            <img src="${song.image}" alt="${song.name}" class="song-image"style="width: 50px; height: 50px; margin-right: 10px;">
                            <strong>${song.name}</strong> - <em>${song.artists || "Unknown Artist"}</em>
                        </li>
                    `).join('')}
                </ul>
                <button class="play-playlist-btn" onclick="playPlaylist('${playlistName}')">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0,0,256,256">
                        <g fill="#94d82d" fill-rule="nonzero">
                            <g transform="scale(5.33333,5.33333)">
                                <path d="M11.39648,4.11133c-2.29228,0.09069 -4.39648,1.96085 -4.39648,4.48047v30.81641c0,3.35949 3.74276,5.56369 6.68164,3.93555l27.80859,-15.4082c3.02344,-1.67529 3.02344,-6.19581 0,-7.87109l-27.80859,-15.4082c-0.73472,-0.40704 -1.52106,-0.57515 -2.28516,-0.54492zM11.43164,7.06641c0.25859,-0.00111 0.52964,0.06593 0.79492,0.21289l27.81055,15.4082c1.09856,0.60871 1.09856,2.01629 0,2.625l-27.81055,15.4082c-1.06112,0.58786 -2.22656,-0.09999 -2.22656,-1.3125v-30.81641c0,-0.60625 0.29071,-1.08018 0.71484,-1.33008c0.21207,-0.12495 0.4582,-0.1942 0.7168,-0.19531z"></path>
                            </g>
                        </g>
                    </svg>
                </button>
                <button class="add-del-btns" onclick="deletePlaylist('${playlistName}')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.5555 4C10.099 4 9.70052 4.30906 9.58693 4.75114L9.29382 5.8919H14.715L14.4219 4.75114C14.3083 4.30906 13.9098 4 13.4533 4H10.5555ZM16.7799 5.8919L16.3589 4.25342C16.0182 2.92719 14.8226 2 13.4533 2H10.5555C9.18616 2 7.99062 2.92719 7.64985 4.25342L7.22886 5.8919H4C3.44772 5.8919 3 6.33961 3 6.8919C3 7.44418 3.44772 7.8919 4 7.8919H4.10069L5.31544 19.3172C5.47763 20.8427 6.76455 22 8.29863 22H15.7014C17.2354 22 18.5224 20.8427 18.6846 19.3172L19.8993 7.8919H20C20.5523 7.8919 21 7.44418 21 6.8919C21 6.33961 20.5523 5.8919 20 5.8919H16.7799ZM17.888 7.8919H6.11196L7.30423 19.1057C7.3583 19.6142 7.78727 20 8.29863 20H15.7014C16.2127 20 16.6417 19.6142 16.6958 19.1057L17.888 7.8919ZM10 10C10.5523 10 11 10.4477 11 11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V11C13 10.4477 13.4477 10 14 10Z" fill="#e32938"></path>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

function togglePlaylist(playlistName) {
    const playlist = document.getElementById(`playlist-${playlistName}`);
    if (playlist.style.display === 'none') {
        playlist.style.display = 'block';
    } else {
        playlist.style.display = 'none';
    }
}


// Function to add an entire playlist to the song queue and start playing
// Function to play a playlist by adding all its songs to the queue and playing the first song
function playPlaylist(playlistName) {
    const playlists = getPlaylists();
    if (!playlists[playlistName]) {
        alert('Playlist not found.');
        return;
    }

    const songs = playlists[playlistName];
    if (songs.length === 0) {
        alert('This playlist has no songs.');
        return;
    }

    // Add all songs to the queue
    songs.forEach(song => {
        songQueue.push({
            url: song.url,
            name: song.name,
            artist: song.artists,
            image: song.image,
        });
    });

    updateQueueDisplay(); // Update the queue visualization

    // Play the first song immediately
    const firstSong = songQueue.shift();
    loadAndPlaySong(firstSong); // Play the first song
}

// Prompt to add a song to a playlist
function addToPlaylistPrompt(songName, artistNames='Unknown Artist', audioUrl, songImage) {
    const playlists = Object.keys(getPlaylists());
    if (playlists.length === 0) {
        alert('No playlists available. Please create a playlist first.');
        return;
    }

    const selectedPlaylist = prompt(`Available Playlists:\n${playlists.join('\n')}\n\nEnter the name of the playlist to add the song:`);

    if (selectedPlaylist && playlists.includes(selectedPlaylist)) {
        const songDetails = {
            name: songName,
            artists: artistNames,
            url: audioUrl,
            image: songImage
        };
        addSongToPlaylist(selectedPlaylist, songDetails);
    } else {
        alert('Invalid playlist name.');
    }
}

// Event listener for creating a new playlist
createPlaylistBtn.addEventListener('click', createPlaylist);

// Initialize display
updatePlaylistsDisplay();
