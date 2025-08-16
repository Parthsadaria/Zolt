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
        <div class="playlist-actions">
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
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.5555 4C10.099 4 9.70052 4.30906 9.58693 4.75114L9.29382 5.8919H14.715L14.4219 4.75114C14.3083 4.30906 13.9098 4 13.4533 4H10.5555ZM16.7799 5.8919L16.3589 4.25342C16.0182 2.92719 14.8226 2 13.4533 2H10.5555C9.18616 2 7.99062 2.92719 7.64985 4.25342L7.22886 5.8919H4C3.44772 5.8919 3 6.33961 3 6.8919C3 7.44418 3.44772 7.8919 4 7.8919H4.10069L5.31544 19.3172C5.47763 20.8427 6.76455 22 8.29863 22H15.7014C17.2354 22 18.5224 20.8427 18.6846 19.3172L19.8993 7.8919H20C20.5523 7.8919 21 7.44418 21 6.8919C21 6.33961 20.5523 5.8919 20 5.8919H16.7799ZM17.888 7.8919H6.11196L7.30423 19.1057C7.3583 19.6142 7.78727 20 8.29863 20H15.7014C16.2127 20 16.6417 19.6142 16.6958 19.1057L17.888 7.8919ZM10 10C10.5523 10 11 10.4477 11 11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11C9 10.4477 9.4477 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V11C13 10.4477 13.4477 10 14 10Z" fill="#e32938"></path>
                </svg>
            </button>
            <button class="share-playlist-btn" onclick="sharePlaylist('${playlistName}')" title="Share Playlist">
                <img src="https://img.icons8.com/ios-glyphs/24/94d82d/share.png" alt="Share" />
            </button>
        </div>
        <ul id="playlist-${playlistName}" class="songs-list" style="display: none;">
            ${
                songs.length === 0
                ? `<li style="color:gray;font-size:0.9em;">No songs in this playlist.</li>`
                : songs.map((song, idx) => `
                <li style="display:flex;align-items:center;justify-content:space-between;">
                    <div style="display:flex;align-items:center;cursor:pointer;" onclick="playSongFromPlaylist('${playlistName}',${idx})">
                        <img src="${song.image}" alt="${song.name}" class="song-image" style="width: 40px; height: 40px; margin-right: 10px;">
                        <span><strong>${song.name}</strong> - <em>${song.artists || song.artist || "Unknown Artist"}</em></span>
                    </div>
                    <button class="remove-song-btn" title="Remove from playlist" onclick="event.stopPropagation();removeSongFromPlaylist('${playlistName}',${idx})" style="background:none;border:none;cursor:pointer;">
                        <img src="https://img.icons8.com/ios-glyphs/24/e32938/trash.png" alt="Remove" />
                    </button>
                </li>
            `).join('')
            }
        </ul>
    </div>
`;
    }).join('');
}

// Play a song from a playlist by index
window.playSongFromPlaylist = function(playlistName, songIdx) {
    const playlists = getPlaylists();
    const songs = playlists[playlistName];
    if (!songs || !songs[songIdx]) return;
    // Play this song (add to queue if not present, or just play)
    playSong(songs[songIdx].url, songs[songIdx].name, songs[songIdx].artists || songs[songIdx].artist, songs[songIdx].image);
};

// Remove a song from a playlist
window.removeSongFromPlaylist = function(playlistName, songIndex) {
    const playlists = getPlaylists();
    if (!playlists[playlistName]) {
        alert('Playlist not found.');
        return;
    }
    if (!playlists[playlistName][songIndex]) {
        alert('Song not found in playlist.');
        return;
    }
    if (confirm(`Remove "${playlists[playlistName][songIndex].name}" from "${playlistName}"?`)) {
        playlists[playlistName].splice(songIndex, 1);
        savePlaylists(playlists);
        updatePlaylistsDisplay();
    }
};

window.sharePlaylist = async function(playlistName) {
    const playlists = getPlaylists();
    const songs = playlists[playlistName];
    if (!songs || songs.length === 0) {
        alert('Playlist is empty or not found.');
        return;
    }
    // Encode songs as JSON and then URI
    const playlistData = encodeURIComponent(JSON.stringify(songs));
    const url = `${window.location.origin}${window.location.pathname}?playlistname=${encodeURIComponent(playlistName)}&playlistdata=${playlistData}`;

    // Properly encode the URL for spoo.me
    const encodedUrl = encodeURIComponent(url);

    // Use spoo.me to shorten the URL
    try {
        const response = await fetch('https://spoo.me', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `url=${encodedUrl}`
        });
        const data = await response.json();
        if (data.short_url) {
            const shareData = {
                title: `${playlistName} | Zolt`,
                text: `Check out my playlist "${playlistName}" on Zolt!`,
                url: data.short_url
            };
            if (navigator.share) {
                navigator.share(shareData).catch(() => {});
            } else {
                navigator.clipboard.writeText(data.short_url);
                alert('Short link copied to clipboard!');
            }
        } else {
            throw new Error('Shortening failed');
        }
    } catch (err) {
        alert('Failed to shorten URL. Sharing original link.');
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
        }
    }
};

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

    // Clear the queue and add all songs
    songQueue = songs.map(song => ({
        url: song.url,
        name: song.name,
        artist: song.artists || song.artist,
        image: song.image,
    }));

    updateQueueDisplay(); // Update the queue visualization

    // Play the first song immediately
    currentSongIndex = 0;
    loadAndPlaySong(songQueue[currentSongIndex]);
    updateMediaSession(songQueue[currentSongIndex]);
}

// Prompt to add a song to a playlist
function addToPlaylistPrompt(songName, artistNames = 'Unknown Artist', audioUrl, songImage) {
    const playlists = Object.keys(getPlaylists());
    if (playlists.length === 0) {
        alert('No playlists available. Please create a playlist first.');
        return;
    }

    // Create the popup container
    const popupContainer = document.createElement('div');
    popupContainer.id = 'popupContainer';
    popupContainer.style.position = 'fixed';
    popupContainer.style.top = '0';
    popupContainer.style.left = '0';
    popupContainer.style.width = '100vw';
    popupContainer.style.height = '100vh';
    popupContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popupContainer.style.backdropFilter = 'blur(5px)';
    popupContainer.style.display = 'flex';
    popupContainer.style.justifyContent = 'center';
    popupContainer.style.alignItems = 'center';
    popupContainer.style.zIndex = '1000';

    // Create the popup content
    const popupContent = document.createElement('div');
    popupContent.style.backgroundColor = '#202020';
    popupContent.style.color = 'white';
    popupContent.style.padding = '20px';
    popupContent.style.borderRadius = '10px';
    popupContent.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    popupContent.style.width = '300px';
    popupContent.style.textAlign = 'center';

    // Popup Title
    const title = document.createElement('h3');
    title.textContent = 'Add to Playlist';
    title.style.marginBottom = '15px';
    title.style.fontSize = '18px';
    title.style.fontWeight = 'bold';
    popupContent.appendChild(title);

    // Display Playlists with checkboxes
    const playlistContainer = document.createElement('div');
    playlists.forEach(playlist => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.marginBottom = '10px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = playlist;
        checkbox.style.marginRight = '10px';

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(playlist));
        playlistContainer.appendChild(label);
    });
    popupContent.appendChild(playlistContainer);

    // Add "Done" button
    const doneButton = document.createElement('button');
    doneButton.textContent = 'Done';
    doneButton.style.backgroundColor = '#4CAF50';
    doneButton.style.color = 'white';
    doneButton.style.border = 'none';
    doneButton.style.padding = '10px 15px';
    doneButton.style.borderRadius = '5px';
    doneButton.style.cursor = 'pointer';
    doneButton.style.marginTop = '15px';
    doneButton.addEventListener('click', () => {
        const selectedPlaylists = [];
        const checkboxes = playlistContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedPlaylists.push(checkbox.value);
            }
        });

        if (selectedPlaylists.length > 0) {
            const songDetails = {
                name: songName,
                artists: artistNames,
                url: audioUrl,
                image: songImage
            };

            // Add the song to the selected playlists
            selectedPlaylists.forEach(playlist => {
                addSongToPlaylist(playlist, songDetails);
            });

            alert(`Song added to playlists: ${selectedPlaylists.join(', ')}`);
        } else {
            alert('No playlists selected.');
        }

        // Remove the popup
        document.body.removeChild(popupContainer);
    });
    popupContent.appendChild(doneButton);

    // Append the popup content to the container
    popupContainer.appendChild(popupContent);

    // Append the container to the body
    document.body.appendChild(popupContainer);
}


// Event listener for creating a new playlist
createPlaylistBtn.addEventListener('click', createPlaylist);

// Initialize display
updatePlaylistsDisplay();