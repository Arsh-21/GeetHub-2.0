const admin_home = {
    data() {
      return {
        userStats: {},
        songStats: {},
        albumStats: {},
      };
    },
    methods: {
      async fetchData() {
        
        const userStatsResponse = await fetch('/api/user_statistics',{headers: {
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
          
      }});
        this.userStats = await userStatsResponse.json();
  
        
        const songStatsResponse = await fetch('/api/song_statistics',{headers: {
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
          
      }});
        this.songStats = await songStatsResponse.json();
        console.log(this.songStats )
  
        
        const albumStatsResponse = await fetch('/api/album_statistics',{headers: {
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
          
      }});
        this.albumStats = await albumStatsResponse.json();
        
      },
    
    },
    mounted() {
      this.fetchData(); 
    },
    template: `
      <div>
        <nav class="navbar navbar-dark bg-dark">
          <span class="navbar-brand mb-0 h1">Administrator Dashboard</span>
          <div class="ml-auto">
            <router-link to="/admin_tracks">All Tracks</router-link> |
            <router-link to="/admin_albums">All Albums</router-link> |
            <button class="btn btn-danger" onclick="logout()">Logout</button>
          </div>
        </nav>
  
        <!-- Main Content -->
        <div class="container py-5">
          <!-- Creator Dashboard -->
          <div class="row justify-content-center">
            <div class="col-md-4 mb-3">
              <div class="bg-warning text-dark text-center p-4 rounded">
                <h5 class="mb-3"><b>Normal Users</b></h5>
                <p class="mb-0 display-4">{{ userStats.normal_users_count }}</p>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="bg-warning text-dark text-center p-4 rounded">
                <h5 class="mb-3"><b>Creators</b></h5>
                <p class="mb-0 display-4">{{ userStats.creators_count }}</p>
              </div>
            </div>
            <div class="col-md-8">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <div class="bg-warning text-dark text-center p-4 rounded">
                    <h5 class="mb-3"><b>Total Songs</b></h5>
                    <p class="mb-0 display-4">{{ songStats.songs_count }}</p>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="bg-warning text-dark text-center p-4 rounded">
                    <h5 class="mb-3"><b>Total Albums</b></h5>
                    <p class="mb-0 display-4">{{ albumStats.albums_count }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="bg-warning text-dark text-center p-4 rounded">
                <h5 class="mb-3"><b>Genres</b></h5>
                <p class="mb-0 display-4">{{ albumStats.genres_count }}</p>
              </div>
            </div>
  
            <!-- Top 5 Albums -->
            <div class="col-md-4 mb-4">
              <div class="bg-warning text-dark text-center p-4 rounded">
                <h5 class="mb-4"><b>Top 3 Albums</b></h5>
                <!-- Add logic to display top 5 albums -->
                <p class="mb-0 display-4" v-for="album in albumStats.top_albums">{{ album }}</p>
                <!-- Use similar display pattern as existing elements -->
              </div>
            </div>
  
            <!-- Top 5 Tracks -->
            <div class="col-md-4 mb-4">
              <div class="bg-warning text-dark text-center p-4 rounded">
                <h5 class="mb-4"><b>Top 3 Tracks</b></h5>
                <!-- Add logic to display top 5 tracks -->
                <p class="mb-0 display-4" v-for="song in songStats.top_songs">{{ song }}</p>
                <!-- Use similar display pattern as existing elements -->
              </div>
            </div>
  
            <!-- Top 5 Creators -->
            <div class="col-md-4 mb-4">
              <div class="bg-warning text-dark text-center p-4 rounded">
                <h5 class="mb-4"><b>Top 3 Creators</b></h5>
                <!-- Add logic to display top 5 creators -->
                <p class="mb-0 display-4" v-for="creator in albumStats.top_creators">{{ creator}}</p>
                <!-- Use similar display pattern as existing elements -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  };
  

    const admin_albums = {data() {
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
                },
                async deleteAlbum(albumId) {
                    
                    const confirmed = window.confirm('Are you sure you want to delete this album?');
            
                    
                    if (confirmed) {
                        try {
                            const response = await fetch(`/api/album/${albumId}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                                  
                              }
                            });
            
                            if (response.ok) {
                                
                                
                                alert('Album deleted successfully');
                                fetch('/api/all_albums',{method : "GET",headers: {
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
                            } else {
                                
                                console.error('Error deleting album');
                                alert('Error deleting album');
                            }
                        } catch (error) {
                            console.error('Error:', error);
                        }
                    }
                }
            },
            mounted() {
                
                fetch('/api/all_albums',{method : "GET",headers: {
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
            template:`<nav class="navbar navbar-dark bg-dark">
                      <span class="navbar-brand mb-0 h1">Administrator</span>
                      <div class="ml-auto">
                      <router-link to="/">Admin Dashboard</router-link> | <router-link to="/admin_tracks">All Tracks</router-link> | <button class="btn btn-danger" onclick="logout()">Logout</button>
                    </div>
                    </nav>

                    <!-- Main Content -->
                    <div class="container py-5">
                        <div class="uploads-list">
                            <h3><b>Albums</b></h3><br>
                            <!--<form @submit.prevent="searchAlbums">
                                <input v-model="searchInput" type="text" name="searchstring" placeholder="Search">
                                <button type="submit">Search</button>
                            </form>-->
                            
                            <br>
                            <div class="table-responsive">
                                <table class="table table-bordered table-striped text-center">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Genre</th>
                                            <th>Artist</th>
                                            <th></th>
                                            <th></th>
                                            
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="album in albums" :key="album.album_id">
                                            <td>{{ album.album_name }}</td>
                                            <td>{{ album.genre }}</td>
                                            <td>{{ album.creator.user.username }}</td>
                                            <td>
                                            <router-link :to="'/album_details_admin/' + album.album_id" class="btn btn-success">View Songs</router-link>

                                            </td>                         
                                        <td>                                            
                                        <button class="btn btn-danger" @click="deleteAlbum(album.album_id)">Delete</button>
                                        </td>
                                    </tr>
                                    
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>`}

    const admin_tracks = {data() {
                return {
                    username: '', 
                    searchstring: '', 
                    trackInfo: [], 
                    flagRequestInProgress: false,
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
                async deleteSong(song_id) {
                    const confirmed = window.confirm('Are you sure you want to delete this song?');
        
                    if (confirmed) {
                        try {
                            const response = await fetch(`/api/song/${song_id}`, {
                                method: 'DELETE', headers: {
                                  'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                                  
                              }
                            });
        
                            if (response.ok) {
                                console.log('Song deleted successfully');
                                alert('Song deleted successfully');
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
                            } else {
                                console.error('Error deleting song');
                                this.showErrorMessage('Error deleting song');
                            }
                        } catch (error) {
                            console.error('Error:', error);
                        }
                    }
                },
                showSuccessMessage(message) {
                    alert(message);
                },
                showErrorMessage(message) {
                    alert(message);
                },
                // async toggleFlag(song_id) {
                //     this.flagRequestInProgress = true;
              
                //     try {
                //       const response = await fetch(`/api/song/${song_id}`, {
                //         method: 'PUT',
                //       });
              
                //       if (response.ok) {
                //         const data = await response.json();
                //         console.log('Flag toggled successfully:', data);
              
                //         // Assuming your API returns 'flagged' in the response
                //         const updatedTrack = this.trackInfo.find(track => track.song_id === song_id);
                //         if (updatedTrack) {
                //           updatedTrack.flagged = data.flagged;
                //         }
                //       } else {
                //         console.error('Error toggling flag');
                //       }
                //     } catch (error) {
                //       console.error('Error:', error);
                //     } finally {
                //       this.flagRequestInProgress = false;
                //     }
                //   },
                // Other methods for handling functionality within this component
            },
            mounted() {
                
                fetch('/api/all_tracks',{headers: {
                  'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                  
              }}) 
                    .then(response => response.json())
                    .then(data => {
                        this.trackInfo = data; 
                        console.log(this.trackInfo)
                    })
                    .catch(error => {
                        console.error('Error fetching track information:', error);
                    });
            },template:`<nav class="navbar navbar-dark bg-dark">
                    <span class="navbar-brand mb-0 h1">Administrator</span>
                    <div class="ml-auto">
                        <router-link to="/">Admin Dashboard</router-link> | <router-link to="/admin_albums">All Albums</router-link> | <button class="btn btn-danger" onclick="logout()">Logout</button>
                    </div>
                </nav>

                <!-- Main Content -->
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
                            <td><router-link :to="'/song_details_admin/' + track.song_id" class="btn btn-success">View lyrics</router-link></td>
                            <!--<td>
                            <form @submit.prevent="toggleFlag(track)">
                            <button
                                class="btn"
                                :class="{'btn-warning': track.flagged, 'btn-danger': !track.flagged}"
                                :disabled="flagRequestInProgress"
                            >
                                {{ track.flagged ? 'Unflag' : 'Flag' }}
                            </button>
                            </form>
                        </td>-->
                        
                        <td>
                            
                        <button class="btn btn-danger" @click="deleteSong(track.song_id)">Delete</button>
                         </td>
                    </tr>
                    
                </tbody>
            </table>
        </div>
    </div>
</div>`}

const album_details_admin = {
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
        this.album = await response.json();
        console.log(this.album)
      },
    },
    mounted() {
      this.fetchData(); 
    },
    template: `
      <div>
        <nav class="navbar navbar-dark bg-dark">
          <span class="navbar-brand mb-0 h1">Administrator Dashboard</span>
          <div class="ml-auto">
            <router-link to="/">Admin Dashboard</router-link> |
            <router-link to="/admin_tracks">All Tracks</router-link> |
            <router-link to="/admin_albums">All Albums</router-link> |
            <button class="btn btn-danger" onclick="logout()">Logout</button>
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
                    <router-link :to="'/song_details_admin/' + song[0]" class="btn btn-warning">View Lyrics</router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  };
  

  const song_details_admin = {
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
                is_flagged:""
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
    },
    mounted() {
        console.log("Hi")
        this.fetchSongDetails(); 
    },
    template: `
        <nav class="navbar navbar-dark bg-dark">
            <span class="navbar-brand mb-0 h1">Administrator Dashboard</span>
            <div class="ml-auto">
                <router-link to="/">Admin Dashboard</router-link> |
                <router-link to="/admin_tracks">All Tracks</router-link> |
                <router-link to="/admin_albums">All Albums</router-link> |
                <button class="btn btn-danger" onclick="logout()">Logout</button>
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
                            <router-link :to="'/album_details_admin/' + songDetails.album_id">
                                {{ songDetails.album_name }}
                            </router-link>
                        </p>
                    </div>
                    <div class="lyrics mt-3">
                        <p>{{ songDetails.lyrics }}</p>
                    </div>
                </div>
            </div>
        </div>
    `,
};



    const routes = [
    { path: '/', component: admin_home },
    { path: '/admin_albums', component: admin_albums },
    { path: '/admin_tracks', component: admin_tracks},
    { path: '/album_details_admin/:album_id', component: album_details_admin },
    { path: '/song_details_admin/:song_id', component: song_details_admin}
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