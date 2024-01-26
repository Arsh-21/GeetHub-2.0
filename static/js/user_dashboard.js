const user_dashboard = {
    data: function () {
        return {
            recommendedData: [],
            playlistData: [],
            genreData: []

        }
    },
    async beforeMount() {
        
        await this.fetchRecommendedData();
        await this.fetchPlaylistData();
        await this.fetchGenreData();
    },
    methods: {
        fetchRecommendedData() {
            fetch('/api/top_songs',{headers: {
                'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                
            }}) 
                .then(response => response.json())
                .then(data => {
                    console.log('songs');
                    console.log(data);

                    this.recommendedData = data.top_songs;
                })
                .catch(error => {
                    console.error('Error fetching recommended data:', error);
                });
        },
        fetchPlaylistData() {
            const accessToken = localStorage.getItem('access_token'); 

            if (!accessToken) {
                console.error('Access token not found in local storage');
                return;
            }

            fetch('/api/playlists', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch playlists');
                    }
                    return response.json();
                })
                .then(data => {
                    this.playlistData = data.playlists;
                })
                .catch(error => {
                    console.error('Error fetching playlist data:', error);
                });
        }
        ,
        fetchGenreData() {
            fetch('/api/genre',{headers: {
                'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                
            }}) 
                .then(response => response.json())
                .then(data => {
                    console.log('songs by genre');
                    console.log(data);
                    this.genreData = data;
                })
                .catch(error => {
                    console.error('Error fetching genre data:', error);
                });
        }
    },

    template: `
    <nav class="navbar navbar-dark bg-dark">
    
    <span class="navbar-brand mb-0 h1">User Home Page</span>
    <div class="ml-auto">
        <router-link to="/creator_register">Creator Account</router-link> | <router-link to="/user_profile">Profile</router-link> | <router-link to="/user_tracks">All Tracks</router-link> | <router-link to="/user_albums">All Albums</router-link> | <button class="btn btn-danger" onclick="logout()">Logout</button>
    </div>
    </nav>
    
    <div class="container py-5">
    <!-- Render recommended data -->
    <div v-if="recommendedData.length > 0">
        <h3>Recommended Tracks</h3>
        <div class="row flex-nowrap overflow-auto">
            <div v-for="songData in recommendedData" :key="songData.song_id" class="col-md-3 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">{{ songData.song_name }}</h5>
                        <p class="card-text">Average Rating: {{ songData.average_rating }}</p>
                        <router-link :to="'/song_details/' + songData.song_id" class="btn btn-primary">View Lyrics</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <br><br>

    <!-- Render playlist data -->
    <div v-if="playlistData.length > 0">
        <div class="d-flex justify-content-between align-items-center">
        <h3 class="mb-4">Your Playlists</h3>
        <router-link to="/create_playlist" class="btn btn-primary">Create playlist</router-link>
        </div>
        <div class="row flex-nowrap overflow-auto">
            <div v-for="plData in playlistData" :key="plData.playlist_id" class="col-md-3 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">{{ plData.playlist_name }}</h5>
                        <!-- Other details -->
                        <router-link :to="'/playlist_details/'+plData.playlist_id" class="btn btn-primary">View Tracks</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <br>
    <!-- Render genre data -->
    <!-- <div v-if="genreData.length > 0"> -->
        <h3>Genres</h3>
        <br>
        <div v-for="(songs,genre) in genreData">
            <h4>{{ genre }}</h4>
            <div class="row flex-nowrap overflow-auto">
                <div v-for="song in songs"  class="col-md-3 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">{{ song }}</h5>
                            <router-link to="/song_details" class="btn btn-primary">View Lyrics</router-link>
                        </div>
                    </div>
                </div>
            </div> 
        </div>
</div>`

}


const create_playlist = {
    data() {
        return {
            playlistName: ''
        };
    },
    methods: {
        createPlaylist() {
            fetch('/api/playlists', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playlist_name: this.playlistName
                })
            })
                .then(response => response.json())
                .then(data => {
                    
                    console.log('Playlist created:', data);
                    url_red="/edit_playlist/"+data.playlist_id
                    
                    this.$router.push({ path: url_red});
                })
                .catch(error => {
                    
                    console.error('Error creating playlist:', error);
                });
        }
    },
    template: `
        <nav class="navbar navbar-dark bg-dark">
            <span class="navbar-brand mb-0 h1">Create Playlist</span>
            <div class="ml-auto">
                <router-link to="/creator_register">Creator Account</router-link> |
                <router-link to="/user_profile">Profile</router-link> |
                <router-link to="/">User Home page</router-link> |
                <button class="btn btn-danger" onclick="logout()">Logout</button>
            </div>
        </nav>
        <div class="container my-4">
            <div class="bg-light p-4 rounded">
                <h3>Create New Playlist</h3>
                <form @submit.prevent="createPlaylist"> 
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" v-model="playlistName" placeholder="Playlist Name" required>
                        <div class="input-group-append">
                            <button type="submit" class="btn btn-primary">Create Playlist</button>
                        </div>      
                    </div>
                </form>
            </div>
        </div>
    `,
};

const edit_playlist = {
    data() {
        return {
            playlistId: null,
            playlistName: '',
            songs: [], 
            songsInPlaylist: [] 
        };
    },
    methods: {
        
        fetchPlaylistData() {
            
            fetch('/api/all_tracks',{headers: {
                'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                
            }})
                .then(response => response.json())
                .then(data => {
                    
                    this.songs = data; 
                    
                })
                .catch(error => {
                    console.error('Error fetching playlist songs:', error);
                });

            
            fetch(`/api/playlist/${this.playlistId}`,{headers: {
                'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                
            }})
                .then(response => response.json())
                .then(data => {
                    
                    this.songsInPlaylist = data 
                    console.log("Playlist")
                })
                .catch(error => {
                    console.error('Error fetching songs in playlist:', error);
                });
        },
        isSongInPlaylist(songId) {
          
            return this.songsInPlaylist.some(song => song.song_id == songId);
        },
        
        toggleSongInPlaylist(songId, action) {
            console.log(songId)
            console.log(action)
            fetch(`/api/edit_playlist/${this.playlistId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    song_id: songId,
                    action: action
                })
            })
                .then(response => {
                    if (response.ok) {
                        
                        this.fetchPlaylistData();
                        
                    } else {
                        
                        console.error('Error adding/removing song from playlist');
                    }
                })
                .catch(error => {
                    console.error('Error adding/removing song from playlist:', error);
                });
        }
    },
    mounted() {
        
        this.playlistName = this.$route.params.playlistName; 
        const regex = /\/edit_playlist\/(\d+)/;
                const match = window.location.href.match(regex);

                this.playlistId=0   
                if (match && match[1]) {
                    this.playlistId = parseInt(match[1], 10);
                  }
                
        
        this.fetchPlaylistData();
    },
    template: `
    <div>
    <nav class="navbar navbar-dark bg-dark">
    <span class="navbar-brand mb-0 h1">Edit Playlist</span>
         <div class="ml-auto">
            <router-link to="/creator_register">Creator Account</router-link> |
        <router-link to="/user_profile">Profile</router-link> |
            <router-link to="/">User Home page</router-link> |
            <button class="btn btn-danger" onclick="logout()">Logout</button>
        </div>
    </nav>
        <div class="container my-4">
            <!-- New Playlist Section -->
            <div class="bg-light p-4 rounded">
                <h4>Add/Delete Songs</h4>
                <!-- Display added songs -->
                <ul class="list-group">
                    <li v-for="song in songs" :key="song.song_id" class="list-group-item d-flex justify-content-between align-items-center">
                        {{ song.song_name }}
                        <form @submit.prevent="toggleSongInPlaylist(song.song_id, isSongInPlaylist(song.song_id) ? 'remove' : 'add')">
                            <input type="hidden" :name="'song_id'" :value="song.song_id">
                            <button v-if="isSongInPlaylist(song.song_id)" class="btn btn-danger" type="submit">Remove from Playlist</button>
                            <button v-else class="btn btn-success" type="submit">Add to Playlist</button>
                        </form>
                    </li>
                </ul>
            </div>
        </div>
    </div>
`
};

const user_profile = {
    data() {
        return {
            username: localStorage.getItem("username"),
            playlists: []
        };
    },
    methods: {
        
        fetchUserProfile() {
            localStorage.getItem("access_token")
            fetch('/api/user_profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.username = data.username;
                })
                .catch(error => {
                    console.error('Error fetching user profile:', error);
                });
        },
        
        fetchUserPlaylists() {
            fetch('/api/playlists', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.playlists = data.playlists;
                })
                .catch(error => {
                    console.error('Error fetching user playlists:', error);
                });
        }
    },
    mounted() {
        this.fetchUserProfile();
        this.fetchUserPlaylists();
    },
    template: `
<nav class="navbar navbar-dark bg-dark">
    <span class="navbar-brand mb-0 h1">User Profile</span>
    <div class="ml-auto">
        <router-link to="/creator_register">Creator Account</router-link> |
        <router-link to="/">User Home Page</router-link> |
        <router-link to="/user_tracks">All Tracks</router-link> |
        <router-link to="/user_albums">All Albums</router-link> |
        <button class="btn btn-danger" onclick="logout()">Logout</button>
    </div>
</nav>
<div class="container py-5">
    <h2 class="mb-4">User Profile</h2>
    <div class="card mb-4">
        <div class="card-body">
            <h5>Username: {{ username }}</h5>
        </div>
    </div>
    <h3 class="mb-3">Playlists</h3>
    <router-link to="/create_playlist" class="btn btn-primary">Create playlist</router-link>
    <div class="row">
        <div v-for="playlist in playlists" :key="playlist.playlist_id" class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">{{ playlist.playlist_name }}</h5>
                    <router-link :to="'/playlist_details/' + playlist.playlist_id" class="btn btn-primary">View Playlist</router-link>
                </div>
            </div>
        </div>
    </div>
</div>
`
};


const user_albums = {
    data() {
        return {
            albums: [],
            searchInput: ''
        };
    },
    methods: {
        searchAlbums() {
            
            
            fetch(`/api/search?query=${this.searchInput}`)
                .then(response => response.json())
                .then(data => {
                    this.albums = data;
                })
                .catch(error => {
                    console.error('Error searching albums:', error);
                });
        }
    },
    mounted() {
        
        fetch('/api/all_albums',{method : "GET", headers: {
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`
            
        }})
            .then(response => response.json())
            .then(data => {
                this.albums = data; 
                console.log(data)
            })
            .catch(error => {
                console.error('Error fetching albums:', error);
            });
    },
    template: `
    <nav class="navbar navbar-dark bg-dark">
    <span class="navbar-brand mb-0 h1">All Albums</span>
    <div class="ml-auto">
        <router-link to="/creator_register">Creator Account</router-link> |
        <router-link to="/user_profile">User Profile</router-link> |
        <router-link to="/">User Home Page</router-link> |
        <router-link to="/user_tracks">All Tracks</router-link> |
        <button class="btn btn-danger" onclick="logout()">Logout</button>
    </div>
</nav>
<div class="container py-5">
    <div class="uploads-list">
        <h3><b>Albums</b></h3><br>
        <form @submit.prevent="searchAlbums">
            <input v-model="searchInput" type="text" name="searchstring" placeholder="Search">
            <button type="submit">Search</button>
        </form><br>
        <div class="table-responsive">
            <table class="table table-bordered table-striped text-center">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Genre</th>
                        <th>Artist</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="album in albums" :key="album.album_id">
                        <td>{{ album.album_name }}</td>
                        <td>{{ album.genre }}</td>
                        <td>{{ album.creator.user.username }}</td>
                            <td>
                                <router-link :to="'/album_details/' + album.album_id" class="btn btn-success">View Songs</router-link>
                            </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
`
};


const user_tracks = {
    data() {
        return {
            username: '', 
            searchstring: '', 
            trackInfo: [] 
        };
    },
    methods: {
        searchSongs() {
            
            fetch(`/api/search?query=${this.searchstring}&category=song`)
                .then(response => response.json())
                .then(data => {
                    this.trackInfo = data; 
                })
                .catch(error => {
                    console.error('Error searching songs:', error);
                });
        },
        
    },
    mounted() {
       
        fetch('/api/all_tracks',{headers: {
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`
            
        }}) 
            .then(response => response.json())
            .then(data => {
                this.trackInfo = data; 
            })
            .catch(error => {
                console.error('Error fetching track information:', error);
            });
    },
    template: `
<nav class="navbar navbar-dark bg-dark">
<span class="navbar-brand mb-0 h1">Music Streaming Application</span>
<div class="ml-auto">
    <router-link to="/creator_register">Creator Account</router-link> | <router-link to="/">User Home Page</router-link> | <router-link to="/user_profile">Profile</router-link> | <router-link to="/user_albums">All Albums</router-link> | <button class="btn btn-danger" onclick="logout()">Logout</button>
</div>
</nav>
<div class="container py-5">
<div class="uploads-list">
    <h3><b>Tracks</b></h3><br>
    <form @submit.prevent="searchSongs">
        <input type="text" v-model="searchstring" placeholder="Search">
        <button type="submit">Search</button>
    </form>
    <br>
    <div class="table-responsive">
        <table class="table table-bordered table-striped text-center">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Duration</th>
                    <th>Date Created</th>
                    <th>Album</th>
                    <th>Artist</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="track in trackInfo" :key="track.song_id">
                    <td>{{ track.song_name }}</td>
                    <td>{{ track.duration }}</td>
                    <td>{{ track.date_created }}</td>
                    <td>{{ track.album.album_name }}</td>
                    <td>{{ track.album.creator.user.username }}</td>
                    <td><router-link :to="'/song_details/' + track.song_id" class="btn btn-success">View lyrics</router-link></td>
            </tr>
            </tbody>
        </table>
    </div>
</div>
</div>
`
};


const album_details = {
    data() {
        return {
            album: {
            album_name: '',
            genre: '',
            artist_username: '',
            song_count: 0,
            song_data: [],
          },
        };
      },
      methods: {
        async fetchData() {
          const albumId = this.$route.params.album_id;
          const response = await fetch(`/api/album/${albumId}`,{headers: {
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`
            
        }});
          console.log(albumId)
          this.album = await response.json();
          console.log(this.album)
        },
      },
      mounted() {
        this.fetchData(); 
      },
    template: `
<nav class="navbar navbar-dark bg-dark">
<span class="navbar-brand mb-0 h1">Album Details</span>
<div class="ml-auto">
    <router-link to="/creator_register">Creator Account</router-link> | <router-link to="/user_profile">Profile</router-link> | <router-link to="/">User Home Page</router-link> | <button class="btn btn-danger" onclick="logout()">Logout</button>
</div>
</nav>
<div class="container main-content mt-3 text-center">
<!-- Album Details Section -->
<div class="card text-center p-3" style="max-width: 800px; margin: 0 auto; background-color: #f0f0f0; color: #333;">
            <h4 class="card-title font-weight-bold">{{ album.album_name }}</h4>
            <div class="card-body">
              <div class="song-details">
                <p>
                  <b>Creator:</b> {{ album.artist_username }} <br>
                  <b>Genre:</b> {{ album.genre }} <br>
                  <b>Number of songs:</b> {{ album.song_count }}
                </p>
              </div>
  
              <div class="row mt-3 justify-content-center">
                <div v-for="song in album.song_data" :key="song[0]" class="col-md-4 mb-3">
                  <div class="card text-center p-3" style="background-color: #ffffff;">
                    <h5 class="card-title font-weight-bold">{{ song[1] }}</h5>
                    <router-link :to="'/song_details/' + song[0]" class="btn btn-warning">View Lyrics</router-link>
                  </div>
            </div>
        </div>
    </div>
</div>
</div>
`
};


const song_details = {
    data() {
        return {
            songDetails: {
                song_name: '',
                lyrics: '',
                duration: 0,
                date_created: '',
                album_id: 0,
                ratings: [],
                playlists: [],
                artist_username: '',
                album_name: '',
                song_id: 0,
                is_flagged:''
            },
        };
    },
    methods: {
        async fetchSongDetails() {
            try {
                console.log(this.$route.params.song_id)
                const response = await fetch(`/api/song/${this.$route.params.song_id}`,{headers: {
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    
                }});
                const data = await response.json();
                this.songDetails = data;
                console.log(this.songDetails)
            } catch (error) {
                console.error('Error fetching song details:', error);
            }
        },
        async submitRating() {
            try {
                accessToken=localStorage.getItem("access_token")
                const response = await fetch(`/api/song_rating/${this.$route.params.song_id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                    },
                    body: JSON.stringify({
                        rating: this.userRating,
                    }),
                });

                const data = await response.json();
                console.log(data.message);

                
                this.fetchSongDetails();
            } catch (error) {
                console.error('Error submitting rating:', error);
            }
        },
    },
    mounted() {
        
        this.fetchSongDetails(); 
    },
    template: `
<nav class="navbar navbar-dark bg-dark">
<span class="navbar-brand mb-0 h1">Song Details</span>
<div class="ml-auto">
    <router-link to="/creator_register">Creator Account</router-link> | <router-link to="/user_profile">Profile</router-link> | <router-link to="/">User Home Page</router-link> | <button class="btn btn-danger" onclick="logout()">Logout</button>
</div>
</nav>
<div class="container main-content mt-3">
<!-- Song Details Section -->
<div class="card text-center p-3 bg-warning text-dark" style="max-width: 500px; margin: 0 auto;">
    <h4 class="card-title font-weight-bold">{{ songDetails.song_name }}</h4>
    <div class="card-body">
        <div class="song-details">
        <p>
        <b>Creator:</b> {{ songDetails.artist_username }} <br>
        <b>Year:</b> {{ songDetails.date_created }} <br>
        <b>Duration:</b> {{ songDetails.duration }}<br>
        <b>Album: </b>
        <router-link :to="'/album_details/' + songDetails.album_id">
            {{ songDetails.album_name }}
        </router-link>
    </p>
        </div>
        <div class="lyrics mt-3">
            <p>{{songDetails.lyrics}}</p>
        </div>
        <form @submit.prevent="submitRating">
        <div class="like-button mt-3">
        <div class="rating">
            <template v-for="rating in 5">
                <input :key="rating"
                       type="radio"
                       :id="'star' + rating"
                       :name="'rating-' + $route.params.song_id"
                       :value="rating"
                       v-model="userRating" />
                <label :key="'label-' + rating"
                       :for="'star' + rating"
                       :title="rating">{{ rating }}</label>
            </template>
        </div>
        <button class="btn btn-success btn-sm" type="submit">Rate</button>
    </div>
    
    </form>
    </div>
</div>
</div>
`
};


const playlist_details = {
    template: `
      <div>
        <nav class="navbar navbar-dark bg-dark">
          <span class="navbar-brand mb-0 h1">Playlist Details</span>
          <div class="ml-auto">
            <router-link to="/creator_register">Creator Account</router-link> | 
            <router-link to="/user_profile">Profile</router-link> | 
            <router-link to="/">User Home Page</router-link> | 
            <button class="btn btn-danger" onclick="logout()">Logout</button>
          </div>
        </nav>
        <div class="container py-5">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Playlist Name: {{ playlistSongs[0].playlist_name }}</h2>
            <router-link :to="'/edit_playlist/'+ playlistSongs[0].playlist_id" class="btn btn-primary" type="button">Edit playlist</router-link>
          </div>
          <!-- Playlist Table -->
          <table class="table">
            <thead class="thead-dark">
              <tr>
                <th scope="col">Song Title</th>
                <th scope="col">Duration</th>
                <th scope="col">Artist</th>
                <th scope="col">Album</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="song in playlistSongs" :key="song.song_id">
                <td>
                  <router-link :to="'/song_details/' + song.song_id">{{ song.song_name }}</router-link>
                </td>
                <td>{{ song.duration }}</td>
                <td>{{ song.artist_username }}</td>
                <td>
                  <router-link :to="'/album_details/' + song.album_id">{{ song.album_name }}</router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
    data() {
      return {
        playlistSongs: [], 
      };
    },
    methods: {
      async fetchPlaylistDetails() {
        try {
          const response = await fetch(`api/playlist/${this.$route.params.playlist_id}`,{headers: {
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`
            
        }});
          const data = await response.json();
          this.playlistSongs = data; 
          console.log(this.playlistSongs[0].playlist_name)
        } catch (error) {
          console.error('Error fetching playlist details:', error);
        }
      },
    },
    async beforeMount() {
      await this.fetchPlaylistDetails();
    },
  };
  

const creator_register = {
    template: `
<div>
<nav class="navbar navbar-dark bg-dark">
<span class="navbar-brand mb-0 h1">Creator Registration</span>
<div class="ml-auto">
  <router-link to="/">User Account</router-link> | 
  <router-link to="/user_profile">Profile</router-link> | 
  <button class="btn btn-danger" onclick="logout()">Logout</button>
</div>
</nav>
<!-- Main Content -->
<div class="container my-5 d-flex justify-content-center align-items-center">
<!-- Creator Registration Tile -->
<div class="card p-4 text-center">
  <h4 class="mb-3">Register as Creator</h4>
  <p>Become a creator and share your music with the world! <br>
    Create new songs and albums and explore your creativity!</p>
  <button @click="registerAsCreator" class="btn btn-success btn-bg">Register</button>
</div>
</div>
</div>
`,
    data() {
        return {
            username: '' 
        };
    },
    methods: {
        async registerAsCreator() {
            try {
                
                const response = await fetch(`/api/user2creator`, {
                    method: 'POST',
                    body: JSON.stringify({ username: localStorage.getItem("username") }), 
                    headers: {
                        
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    
                    console.log('Successfully registered as a creator!');
                    alert('Successfully registered as a creator!');
                    const currentBaseUrl = window.location.origin;

                    if (window.location.href.includes(`${currentBaseUrl}/user_dashboard#/creator_register`)) {

                    window.location.href = `${currentBaseUrl}/creator_dashboard#`;
                    }
                } else {
                    
                    alert("Failed to register as a creator. Go to Creator dashboard if you are already registered")
                    console.error('Failed to register as a creator');
                }
            } catch (error) {
                console.error('Error registering as a creator:', error);
            }
        }
    },
    mounted(){
        user_type=localStorage.getItem('user_type')
        if (user_type=="creator"){
            const currentBaseUrl = window.location.origin;

                    if (window.location.href.includes(`${currentBaseUrl}/user_dashboard#/creator_register`)) {

                    window.location.href = `${currentBaseUrl}/creator_dashboard#`;
                    }

        }
        
    }
};




const routes = [
    { path: '/', component: user_dashboard },
    { path: '/create_playlist', component: create_playlist },
    { path: '/edit_playlist/:playlist_id', component: edit_playlist },
    { path: '/user_profile', component: user_profile },
    { path: '/user_albums', component: user_albums },
    { path: '/user_tracks', component: user_tracks },
    { path: '/album_details/:album_id', component: album_details },
    { path: '/song_details/:song_id', component: song_details },
    { path: '/playlist_details/:playlist_id', component: playlist_details },
    { path: '/creator_register', component: creator_register }
]

const router = VueRouter.createRouter({
    
    history: VueRouter.createWebHashHistory(),
    routes, 
})


const app = Vue.createApp({})

app.use(router)

app.mount('#app')

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_type');
      
    window.location.href = '/';
    window.location.href.reload();
}