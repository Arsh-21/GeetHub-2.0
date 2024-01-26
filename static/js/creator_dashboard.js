const creator_home = {template:`<nav class="navbar navbar-dark bg-dark">
    <span class="navbar-brand mb-0 h1">Creator Home Page</span>
    <div class="ml-auto">
        <router-link to="/creator_dashboard">Creator Dashboard</router-link> | <router-link to="/create_album">Create Album</router-link> | <router-link to="/add_song_from_album">Upload Song</router-link> | <router-link to="/user_dashboard">User Account</router-link> | <button class="btn btn-danger" onclick="logout()">Logout</button>
    </div>
</nav>

<!-- Main Content -->
<div class="container my-5">
    <div class="row justify-content-center">
        <div class="col-lg-6">
            <div class="card text-center p-4">
                <h3 class="mb-4">Explore your creator's journey</h3>
                <router-link to="/add_song_from_album" class="btn btn-success btn-lg btn-block mb-3">Upload a song</router-link>
                <router-link to="/create_album" class="btn btn-success btn-lg btn-block">Create an album</router-link>
            </div>
        </div>
    </div>
</div>`}

const creator_dashboard = {
    data() {
      return {
        data: {},      
        song_data: [],  
        album_data: [], 
      };
    },
    methods: {
      async fetchData() {
        
        const response = await fetch('/api/creator_dashboard1',{headers: {
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
          
      }});
        
        this.data = await response.json();
        
          
        
        const songResponse = await fetch('/api/all_tracks_c',{headers: {
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
          
      }});
        this.song_data = (await songResponse.json());
  
        
        const albumResponse = await fetch('/api/all_albums_c',{headers: {
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
          
      }});
        this.album_data = (await albumResponse.json());
      },
      async deleteSong(song_id) {
        const confirmed = window.confirm('Are you sure you want to delete this song?');

        if (confirmed) {
            try {
                const response = await fetch(`/api/song/${song_id}`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                      
                  }
                });

                if (response.ok) {
                    console.log('Song deleted successfully');
                    alert('Song deleted successfully');
                    this.fetchData()
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
    async deleteAlbum(albumId) {
        
        const confirmed = window.confirm('Are you sure you want to delete this album?');

        
        if (confirmed) {
            try {
                const response = await fetch(`/api/album/${albumId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    
                    console.log('Album deleted successfully');
                    this.fetchData()
                    
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
      this.fetchData(); 
    },
    template: `
      <div>
        <nav class="navbar navbar-dark bg-dark">
          <span class="navbar-brand mb-0 h1">Creator Dashboard</span>
          <div class="ml-auto">
            <router-link to="/create_album">Create Album</router-link> |
            <router-link to="/add_song_from_album">Upload Song</router-link> |
            <a style="color:blue;" onclick="to_user_dash()">User Account</a> |
            <button class="btn btn-danger" onclick="logout()">Logout</button>
          </div>
        </nav>
  
        <!-- Main Content -->
        <div class="container py-5">
          <!-- Creator Dashboard -->
          <h2 class="text-center text-white mb-4">Creator Dashboard</h2>
          <div class="dashboard-summary d-flex justify-content-around">
            <!-- Use data properties to display information -->
            <div class="summary-tile bg-info text-center text-white p-4 rounded">
              <h4><b>Average Rating</b></h4>
              <p class="summary-statistic display-4">{{ data.average_rating }}</p>
            </div>
            <div class="summary-tile bg-info text-center text-white p-4 rounded">
              <h4><b>Total Uploads</b></h4>
              <p class="summary-statistic display-4">{{ data.song_count }}</p>
            </div>
            <div class="summary-tile bg-info text-center text-white p-4 rounded">
              <h4><b>Number of Albums</b></h4>
              <p class="summary-statistic display-4">{{ data.album_count }}</p>
            </div>
          </div>
  
          <!-- Song Uploads -->
          <div class="uploads-list text-white bg-dark rounded p-4 mt-4">
            <h4>Song Uploads</h4>
            <table class="table table-dark mt-3">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Duration</th>
                    <th>Date Created</th>
                    <th>Album</th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
              <!-- Use v-for to loop through song_data -->
              <tr v-for="song in song_data">
                <td>{{ song.song_name }}</td>
                <td>{{ song.duration }}</td>
                <td>{{ song.date_created }}</td>
                <td>{{ song.album.album_name }}</td>
                <!-- Modify the links accordingly -->
                <td><router-link :to="'/song_details_creator/' + song.song_id" class="btn btn-success btn-sm">View lyrics</router-link></td>
                <td><router-link :to="'/edit_song/' + song.song_id" class="btn btn-primary btn-sm">Edit</router-link></td>
                <td>
                  <!--<form @submit.prevent="deleteEntry('song', song.song_id)">-->
                  <button class="btn btn-danger" @click="deleteSong(song.song_id)">Delete</button>
                  <!--</form>-->
                </td>
                <!--<td v-if="song.flagged">
                  <i class="fas fa-flag" title="This song is flagged by admin" style="color: red;"></i>
                </td>-->
              </tr>
            </table>
          </div>
  
          <!-- Album Uploads -->
          <div class="uploads-list text-white bg-dark rounded p-4 mt-4">
            <h4>Album Uploads</h4>
            <table class="table table-dark mt-3">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Genre</th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
              <!-- Use v-for to loop through album_data -->
              <tr v-for="album in album_data">
                <td>{{ album.album_name }}</td>
                <td>{{ album.genre }}</td>
                <!-- Modify the links accordingly -->
                <td><router-link :to="'/album_details_creator/' + album.album_id" class="btn btn-success btn-sm">View Songs</router-link></td>
                <td><router-link :to="'/edit_album/' + album.album_id" class="btn btn-primary btn-sm">Edit</router-link></td>
                <td>
                  <!--<form @submit.prevent="deleteEntry('album', album.album_id)">-->
                  <button class="btn btn-danger" @click="deleteAlbum(album.album_id)">Delete</button>
                  <!--</form>-->
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    `,
  };
  

  const create_album = {
    data() {
        return {
            album_name: '',
            genre: '',
            
        };
    },
    methods: {
        async createAlbum() {
            try {
                const response = await fetch('/api/album', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        
                          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                          
                      
                        
                    },
                    body: JSON.stringify({
                        album_name: this.album_name,
                        genre: this.genre,
                        
                    }),
                });

                
                
                url_red= '/creator_dashboard'
                this.$router.push({ path: url_red})

                
                
            } catch (error) {
                console.error('Error creating album:', error);
                
            }
        },
    },
    template: `
        <div>
            <nav class="navbar navbar-dark bg-dark">
                <span class="navbar-brand mb-0 h1">Creator Corner</span>
                <div class="ml-auto">
                    <router-link to="/creator_dashboard">Creator Dashboard</router-link> |
                    <router-link to="/add_song_from_album">Upload Song</router-link> |
                    <a style="color:blue;" onclick="to_user_dash()">User Account</a> |
                    <button class="btn btn-danger" onclick="logout()">Logout</button>
                </div>
            </nav>

            <!-- Main Content -->
            <div class="container py-5">
                <!-- Create Album Form -->
                <h3 class="text-center">Create an Album</h3>
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <form @submit.prevent="createAlbum">
                            <div class="form-group">
                                <label for="album_name">Name:</label>
                                <input type="text" class="form-control" id="album_name" v-model="album_name" placeholder="Enter album name" required>
                            </div>
                            <div class="form-group">
                                <label for="genre">Genre:</label>
                                <input type="text" class="form-control" id="genre" v-model="genre" placeholder="Enter genre" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Create</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,
};


const upload_song = {
    data() {
        return {
            album_id: this.$route.params.album_id, 
            duration: '',
            releaseDate: '',
            lyrics: '',
        };
    },
    methods: {
        uploadSong() {
            
            
            const formData = {
                song_name: this.title,
                duration: this.duration,
                release_date: this.releaseDate,
                lyrics:this.lyrics
                
              };
              console.log(formData)
            fetch(`/api/uploadsong/${this.album_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                      'Authorization': `Bearer ${localStorage.getItem("access_token")}`
                      
                  
                    
                },
                body: JSON.stringify(formData),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data); 
                
                const regex = /\/upload_song\/(\d+)/;
                const match = window.location.href.match(regex);

                creatorId=0   
                if (match && match[1]) {
                    creatorId = parseInt(match[1], 10);
                  }
                console.log(creatorId)
                url_red= '/creator_dashboard'
                this.$router.push({ path: url_red})

            })
            .catch(error => {
                console.error('Error uploading song:', error);
            });
        },
    },
    template: `<nav class="navbar navbar-dark bg-dark">
        <span class="navbar-brand mb-0 h1">Creator Corner</span>
        <div class="ml-auto">
            <router-link to="/creator_dashboard">Creator Dashboard</router-link> |
            <router-link to="/create_album">Create Album</router-link> |
            <a style="color:blue;" onclick="to_user_dash()">User Account</a> |
            <button class="btn btn-danger" onclick="logout()">Logout</button>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="container py-5">
        <!-- Upload Song Form -->
        <h3 class="text-center"> Upload a Song </h3>
        <div class="row justify-content-center">
            <div class="col-md-6">
                <form @submit.prevent="uploadSong">
                    <div class="form-group">
                        <label for="title">Title:</label>
                        <input v-model="title" type="text" class="form-control" id="title" placeholder="Enter song title" required>
                    </div>
                    <div class="form-group">
                        <label for="duration">Duration:</label>
                        <input v-model="duration" type="text" class="form-control" id="duration" placeholder="Enter duration of song" required>
                    </div>
                    <div class="form-group">
                        <label for="releaseDate">Release Date:</label>
                        <input v-model="releaseDate" type="date" class="form-control" id="releaseDate" required>
                    </div>
                    <div class="form-group">
                        <label for="lyrics">Lyrics:</label>
                        <textarea v-model="lyrics" class="form-control" id="lyrics" rows="5" placeholder="Enter song lyrics" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Upload</button>
                </form>
            </div>
        </div>
    </div>`,
};


const edit_album = {
    data() {
      return {
        album_name: '', 
        genre: '', 
      };
    },
    methods: {
      async fetchAlbumDetails() {
        
        const response = await fetch(`/api/album/${this.$route.params.album_id}`,{headers: {
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
          
      }});
        const data = await response.json();
        
        this.album_name = data.album_name;
        this.genre = data.genre;
      },
      async updateAlbum() {
        
        const response = await fetch(`/api/album/${this.$route.params.album_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            
              'Authorization': `Bearer ${localStorage.getItem("access_token")}`
              
          
          },
          body: JSON.stringify({
            album_name: this.album_name,
            genre: this.genre,
          }),
        });
        
        const result = await response.json();

                const regex = /\/edit_album\/(\d+)/;
                const match = window.location.href.match(regex);

                creatorId=0   
                if (match && match[1]) {
                    creatorId = parseInt(match[1], 10);
                  }
                console.log(creatorId)
                url_red= '/creator_dashboard'
                this.$router.push({ path: url_red})

                
                console.log(responseData);
    
        
      },
    },
    mounted() {
      
      this.fetchAlbumDetails();
    },
    template: `
      <nav class="navbar navbar-dark bg-dark">
        <span class="navbar-brand mb-0 h1">Creator Corner</span>
        <div class="ml-auto">
          <router-link to="/creator_dashboard">Creator Dashboard</router-link> |
          <router-link to="/create_album">Create Album</router-link> |
          <router-link to="/add_song_from_album">Upload Song</router-link> |
          <a style="color:blue;" onclick="to_user_dash()">User Account</a> |
          <button class="btn btn-danger" onclick="logout()">Logout</button>
        </div>
      </nav>
  
      <!-- Main Content -->
      <div class="container py-5">
        <!-- Edit Album Form -->
        <h3 class="text-center"> Edit Album </h3>
        <div class="row justify-content-center">
          <div class="col-md-6">
            <form @submit.prevent="updateAlbum">
              <div class="form-group">
                <label for="name">Name:</label>
                <input v-model="album_name" type="text" class="form-control" id="name" placeholder="Enter album name" required>
              </div>
              <div class="form-group">
                <label for="genre">Genre:</label>
                <input v-model="genre" type="text" class="form-control" id="genre" placeholder="Enter genre" required>
              </div>
              <button type="submit" class="btn btn-primary btn-block">Update</button>
            </form>
          </div>
        </div>
      </div>
    `,
  };
  

  const edit_song = {
    data() {
      return {
        title: '', 
        duration: '', 
        releaseDate: '', 
        lyrics: '', 
      };
    },
    methods: {
      async fetchSongDetails() {
        
        const response = await fetch(`/api/song/${this.$route.params.song_id}`,{headers: {
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`}
          
      });
        const data = await response.json();
        
        this.title = data.song_name;
        this.duration = data.duration;
        this.releaseDate = data.date_created;
        this.lyrics = data.lyrics;
      },
      async updateSong() {
        
        const response = await fetch(`/api/song/${this.$route.params.song_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            
              'Authorization': `Bearer ${localStorage.getItem("access_token")}`
              
          },
          body: JSON.stringify({
            song_name: this.title,
            duration: this.duration,
            release_date: this.releaseDate,
            lyrics: this.lyrics,
          }),
        });
        
        const result = await response.json();
        
        creatorId=localStorage.getItem("creatorId");
        url_red= '/creator_dashboard'
        this.$router.push({ path: url_red})
        console.log(result.message);
      },
    },
    mounted() {
      
      this.fetchSongDetails();
    },
    template: `
      <nav class="navbar navbar-dark bg-dark">
        <span class="navbar-brand mb-0 h1">Creator Corner</span>
        <div class="ml-auto">
          <router-link to="/creator_dashboard">Creator Dashboard</router-link> |
          <router-link to="/create_album">Create Album</router-link> |
          <router-link to="/add_song_from_album">Upload Song</router-link> |
          <a style="color:blue;" onclick="to_user_dash()">User Account</a> |
          <button class="btn btn-danger" onclick="logout()">Logout</button>
        </div>
      </nav>
  
      <!-- Main Content -->
      <div class="container py-5">
        <!-- Edit Song Form -->
        <h3 class="text-center"> Edit Song </h3>
        <div class="row justify-content-center">
          <div class="col-md-6">
            <form @submit.prevent="updateSong">
              <div class="form-group">
                <label for="title">Title:</label>
                <input v-model="title" type="text" class="form-control" id="title" placeholder="Enter song title">
              </div>
              <div class="form-group">
                <label for="duration">Duration:</label>
                <input v-model="duration" type="text" class="form-control" id="duration" placeholder="Enter duration">
              </div>
              <div class="form-group">
                <label for="releaseDate">Release Date:</label>
                <input v-model="releaseDate" type="date" class="form-control" id="releaseDate">
              </div>
              <div class="form-group">
                <label for="lyrics">Lyrics:</label>
                <textarea v-model="lyrics" class="form-control" id="lyrics" rows="5" placeholder="Enter song lyrics"></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-block">Update</button>
            </form>
          </div>
        </div>
      </div>
    `,
  };
  
//     const album_creator_view = {template:`<nav class="navbar navbar-dark bg-dark">
//     <span class="navbar-brand mb-0 h1">Creator Corner   </span>
//     <div class="ml-auto">
//         <router-link to="/{{ username }}/creator_dashboard">Creator Dashboard</router-link> | <router-link to="/{{ username }}/create_album">Create Album</router-link> | <router-link to="/{{ username }}/upload_song">Upload Song</router-link> | <router-link to="/{{ username }}/user_home_page">User Account</router-link> | <button class="btn btn-danger" onclick="logout()">Logout</button>
//     </div>
// </nav>

// <!-- Main Content -->
// <div class="container main-content mt-3 text-center">
//     <!-- Album Details Section -->
//     <div class="card text-center p-3" style="max-width: 800px; margin: 0 auto; background-color: #f0f0f0; color: #333;">
//         <h4 class="card-title font-weight-bold">Album 1</h4>
//         <div class="card-body">
//             <div class="song-details">
//                 <p><b>Creator:</b> {{ album[5] }} <br>
//                     <b>Genre:</b> {{ album[1] }} <br>
//                     <b>Number of songs:</b> {{album[3]}}
//                 </p>
//             </div>

//             <div class="row mt-3 justify-content-center">
//                 {% for song_data in album[4] %}
//                 <div class="col-md-4 mb-3">
//                     <div class="card text-center p-3" style="background-color: #ffffff;">
//                         <h5 class="card-title font-weight-bold">{{song_data[1]}}</h5>
//                         <router-link to="/song/{{song_data[0]}}"class="btn btn-warning">View Lyrics</router-link>
//                     </div>
//                 </div>
//                 {% endfor %}
                
//             </div>
//         </div>
//     </div>
// </div>`}

const add_song_from_album = {
    data() {
        return {
            albumInfo: [],
            username: '', 
        };
    },
    methods: {
        fetchAlbums() {
            fetch('api/all_albums_c',{headers: {
              'Authorization': `Bearer ${localStorage.getItem("access_token")}`
              
          }})
                .then(response => response.json())
                .then(data => {
                    this.albumInfo = data;
                })
                .catch(error => {
                    console.error('Error fetching albums:', error);
                });
        },
        
    },
    mounted() {
        this.fetchAlbums(); 
    },
    template: `<nav class="navbar navbar-dark bg-dark">
        <span class="navbar-brand mb-0 h1">Creator Corner</span>
        <div class="ml-auto">
            <router-link to="/creator_dashboard">Creator Dashboard</router-link> |
            <router-link to="/create_album">Create Album</router-link> |
            <router-link to="/add_song_from_album">Upload Song</router-link> |
            <a style="color:blue;" onclick="to_user_dash()">User Account</a> |
            <button class="btn btn-danger" onclick="logout()">Logout</button>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="container py-5">
        <div class="uploads-list">
            <h3><b>All Albums</b></h3><br>
            <!--<div class="form-group text-center">
                <input type="text" class="form-control w-50 mx-auto" id="trackSearch" placeholder="Search by name">
            </div>
            <br>-->
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
                        <tr v-for="album in albumInfo" :key="album.album_id">
                            <td>{{ album.album_name }}</td>
                            <td>{{ album.genre }}</td>
                            <td>{{ album.creator.user.username }}</td>
                            <td><router-link :to="'/album_details_creator/' + album.album_id" class="btn btn-success">View Songs</router-link></td>
                            <td><router-link :to="'/upload_song/' + album.album_id" class="btn btn-primary">Add Song</router-link></td>
                            <!--<td>
                                <form @submit.prevent="deleteAlbum(album.album_id)">
                                    <button type="submit" class="btn btn-danger">Delete</button>
                                </form>-->
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>`,
};

const song_details_creator = {
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
        <router-link :to="'/album_details_creator/' + songDetails.album_id">
            {{ songDetails.album_name }}
        </router-link>
    </p>
        </div>
        <div class="lyrics mt-3">
            <p>{{songDetails.lyrics}}</p>
        </div>
        <!-- <form @submit.prevent="submitRating">
            <div class="like-button mt-3">
                <div class="rating">
                    <input v-for="rating in 5" :key="rating" type="radio" :id="star{{rating}" :name="rating" :value="rating" />
                    <label v-for="rating in 5" :key="rating" :for="star{{rating}" :title="{{rating}"> {{ rating }}</label>
                </div>
                <button class="btn btn-success btn-sm" type="submit">Rate</button>
            </div>
        </form> -->
    </div>
</div>
</div>
`
};

const album_details_creator = {
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
                    <router-link :to="'/song_details_creator/' + song[0]" class="btn btn-warning">View Lyrics</router-link>
                  </div>
            </div>
        </div>
    </div>
</div>
</div>
`
};

    const routes = [
    { path: '/', component: creator_home },
    { path: '/creator_dashboard', component: creator_dashboard},
    { path: '/create_album', component: create_album},
    { path: '/upload_song/:album_id', component: upload_song},
    { path: '/edit_album/:album_id', component: edit_album},
    { path: '/edit_song/:song_id', component: edit_song},
    //{ path: '/album_creator_view', component: album_creator_view},
    { path: '/add_song_from_album', component: add_song_from_album},
    { path: '/song_details_creator/:song_id', component: song_details_creator},
    { path: '/album_details_creator/:album_id', component: album_details_creator}
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

function to_user_dash(){
  const baseUrl = window.location.protocol + '//' + window.location.host;


const newPath = '/user_dashboard';

const newUrl = baseUrl + newPath;

window.location.href = newUrl;
}