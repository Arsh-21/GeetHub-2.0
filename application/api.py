from flask import Flask, request, jsonify
from flask import render_template, redirect, request, url_for, flash
from flask_restful import Resource, Api, reqparse, marshal_with, fields, marshal
from application.models import *
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime

from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_current_user, JWTManager
import datetime
 
api = Api(prefix='/api')

##########################################################################################################

register_parser = reqparse.RequestParser()
register_parser.add_argument('username', type=str, required=True)
register_parser.add_argument('password', type=str, required=True)

class Register(Resource):
    def post(self):
        data = register_parser.parse_args()
        username = data['username']
        password = generate_password_hash(data['password'])
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return {'message': 'Username already exists'}, 400

        currentDateTime = datetime.datetime.now()
        new_user = User(username=username, password=password, user_type = 'user',timestamp=currentDateTime)
        db.session.add(new_user)
        db.session.commit()

        return {'message': 'User registered successfully'}, 201
        
api.add_resource(Register, '/register')

#############################################################################################################

user_login_parser = reqparse.RequestParser()
user_login_parser.add_argument('username', type=str, required=True)
user_login_parser.add_argument('password', type=str, required=True)

class User_Login(Resource):
    def post(self):
        data = user_login_parser.parse_args()
        username = data['username']
        password = data['password']
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password) and user.user_type != 'admin':
            expires = datetime.timedelta(days=7)
            access_token = create_access_token(identity=user.user_id,expires_delta=expires)
            
            return {"access_token":access_token, "message":'Login successful',"user_type":user.user_type}, 200
        else:
            return {'message': 'Invalid credentials'}, 401

    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        return jsonify(username=current_user), 200

api.add_resource(User_Login, '/user_login')

##########################################################################################################

admin_login_parser = reqparse.RequestParser()
admin_login_parser.add_argument('username', type=str, required=True)
admin_login_parser.add_argument('password', type=str, required=True)

class Admin_Login(Resource):
    def post(self):
        data = admin_login_parser.parse_args()
        username = data['username']
        password = data['password']
        
        user = User.query.filter_by(username=username, user_type='admin').first()
        if user:
            if check_password_hash(user.password, password):
                access_token = create_access_token(identity=user.username)
                return {'access_token': access_token, 'message': 'Admin login successful'}, 200
            else:
                return {'message': 'Invalid password for admin'}, 401
        else:
            return {'message': 'Admin not found'}, 401
        

api.add_resource(Admin_Login, '/admin_login')

#####################################################################################################

from sqlalchemy import desc, func

class TopSongs(Resource):
    @jwt_required()
    def get(self):
        top_songs = db.session.query(Rating.song_id, func.avg(Rating.rating).label('avg_rating')).\
            group_by(Rating.song_id).order_by(desc('avg_rating')).limit(10).all()

        top_songs_data = []
        for song_id, avg_rating in top_songs:
            song = Song.query.get(song_id)
            if song:
                top_songs_data.append({
                    'song_id': song.song_id,
                    'song_name': song.song_name,
                    'average_rating': round(avg_rating, 2)
                })
        # print({'top_songs': top_songs_data})
        return {'top_songs': top_songs_data}, 200

api.add_resource(TopSongs, '/top_songs')

#############################################################################################

playlist_parser = reqparse.RequestParser()
playlist_parser.add_argument('playlist_name', type=str, required=True, help='Playlist name is required')

playlist_fields = {
    'playlist_id': fields.Integer, 
    'playlist_name': fields.String,
    'user_id': fields.Integer,
}

class PlaylistResource(Resource):  
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        playlists = Playlist.query.filter_by(user_id = current_user)
        
        if not playlists:
            return {'message': 'No playlists found'}, 404

        playlist_data = [{
            'playlist_id': playlist.playlist_id,
            'playlist_name': playlist.playlist_name,
            'user_id': playlist.user_id
        } for playlist in playlists]
        # print({'playlists': playlist_data})
        return {'playlists': playlist_data}, 200

    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        args = playlist_parser.parse_args()
        new_playlist = Playlist(playlist_name=args['playlist_name'], user_id=current_user)
        db.session.add(new_playlist)
        db.session.commit()

        return {"message":"Playlist Created","playlist_id":new_playlist.playlist_id}, 201

api.add_resource(PlaylistResource, '/playlists')

######################################################################################################

class SongsbyGenre(Resource):
    @jwt_required()
    def get(self):
        genres = {}
        albums = Album.query.all()
        for album in albums:  
            if album.genre not in genres:
                genres[album.genre] = []
                songs = Song.query.filter_by(album_id = album.album_id).all()
                for i in songs:
                    genres[album.genre].append(i.song_name)    
            else:
                songs = Song.query.filter_by(album_id = album.album_id).all()
                for i in songs:
                    genres[album.genre].append(i.song_name)
                   
        return genres

api.add_resource(SongsbyGenre,'/genre')

###########################################################################################

class UserProfile(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
         # Or whatever key contains the user ID in your JWT

        user = User.query.get(current_user)
        if not user:
            return {'message': 'User not found'}, 404

        user_playlists = Playlist.query.filter_by(user_id=current_user).all()
        playlists_data = [{
            'playlist_id': playlist.playlist_id,
            'playlist_name': playlist.playlist_name
        } for playlist in user_playlists]

        return {
            'username': user.username,
            'playlists': playlists_data
        }, 200

api.add_resource(UserProfile, '/user_profile')

#####################################################################################################

from sqlalchemy import or_

class Search(Resource):
    output = {
        'song_id': fields.String,
        'song_name': fields.String,
        'duration': fields.Integer,
        'date_created': fields.DateTime,
        'album': fields.Nested({
            'album_name': fields.String,
            'creator': fields.Nested({
                'user': fields.Nested({
                    'username': fields.String
                })
            })
        })
    }

    @marshal_with(output)
    def get(self):
        query = request.args.get('query')
        if not query:
            return jsonify({'message': 'Please provide a search query'}), 400

       # Search for songs matching the query in song name, lyrics, album name, or artist name
        songs = Song.query.join(Album).join(Creator).join(User).filter(
            or_(
                Song.song_name.ilike(f"%{query}%"),
                Song.lyrics.ilike(f"%{query}%"),
                Album.album_name.ilike(f"%{query}%"),
                User.username.ilike(f"%{query}%")
            )
            ).all()
        return songs, 200

api.add_resource(Search, '/search')

#################################################################################################

class Album_info(Resource):
    output = {
        'album_id': fields.Integer,
        'album_name': fields.String,
        'genre': fields.String,
        'creator': fields.Nested({
            'user': fields.Nested({
                'username': fields.String
                })
        }) 
    }

    @marshal_with(output)
    @jwt_required()
    def get(self):
        albums = Album.query.all()
        return albums, 200

api.add_resource(Album_info, '/all_albums')

class Album_info_creator(Resource):
    output = {
        'album_id': fields.Integer,
        'album_name': fields.String,
        'genre': fields.String,
        'creator': fields.Nested({
            'user': fields.Nested({
                'username': fields.String
                })
        }) 
    }

    @marshal_with(output)
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        creator = Creator.query.filter_by(user_id = current_user).first()
        albums = Album.query.filter_by(artist = creator.creator_id).all()
        return albums, 200

api.add_resource(Album_info_creator, '/all_albums_c') 

##############################################################################################

class Song_info(Resource):
    output = {
        'song_id': fields.String,
        'song_name': fields.String,
        'duration': fields.Integer,
        'date_created': fields.DateTime,
        'flagged':fields.Boolean,
        'album': fields.Nested({
            'album_name': fields.String,
            'creator': fields.Nested({
                'user': fields.Nested({
                    'username': fields.String
                })
            })
        })
    }

    @marshal_with(output)
    @jwt_required()
    def get(self):
        songs = Song.query.all()
        return songs,200

api.add_resource(Song_info, '/all_tracks')

class Song_info_creator(Resource):
    output = {
        'song_id': fields.String,
        'song_name': fields.String,
        'duration': fields.Integer,
        'date_created': fields.DateTime,
        'flagged': fields.Boolean,
        'album': fields.Nested({
            'album_name': fields.String,
            'creator': fields.Nested({
                'user': fields.Nested({
                    'username': fields.String
                })
            })
        })
    }

    @marshal_with(output)
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        creator = Creator.query.filter_by(user_id = current_user).first()
        songs = (
            db.session.query(Song)
            .join(Album)  # Join Song with Album based on the relationship
            .join(Creator)  # Join the result with Creator based on the relationship
            .join(User, Creator.user_id == User.user_id)  # Join with User to get the username
            .filter(Creator.creator_id == creator.creator_id)
            .all()
        )

        return songs, 200

api.add_resource(Song_info_creator, '/all_tracks_c')

####################################################################################################

user2creator_parser = reqparse.RequestParser()
user2creator_parser.add_argument('username', type=str, required=True)


class User2Creator(Resource):
    @jwt_required()
    def post(self):
        data = user2creator_parser.parse_args()
        username = data['username']
        print(data)
        existing_user = User.query.filter_by(username=username).first()
        if not existing_user:
            return {'message': 'User does not exist'}, 404

       
        existing_creator = Creator.query.filter_by(user_id=existing_user.user_id).first()
        if existing_creator:
            return {'message': 'User is already registered as a creator'}, 400

        
        existing_user.user_type = 'creator'
        new_creator = Creator(user_id=existing_user.user_id)
        
        
        db.session.add(new_creator)
        db.session.commit()

        return {'message': 'User registered as a creator successfully'}, 201

api.add_resource(User2Creator, '/user2creator')

######################################################################################################

user_statistics_fields = {
    'normal_users_count': fields.Integer,
    'creators_count': fields.Integer,
}

song_statistics_fields = {
    'songs_count': fields.Integer,
    'top_songs': fields.List(fields.String),
}

album_statistics_fields = {
    'albums_count': fields.Integer,
    'genres_count': fields.Integer,
    'top_albums': fields.List(fields.String),
    'top_creators': fields.List(fields.String),
}

# Resource classes
class UserStatisticsResource(Resource):
    @marshal_with(user_statistics_fields)
    @jwt_required()
    def get(self):
        # user = User.query.filter_by(username=username).first()
        # if user.user_type != 'admin':
        #     return {'message': 'Not accessible to user'}, 403

        normal_users_count = User.query.filter_by(user_type="user").count()
        creators_count = User.query.filter_by(user_type="creator").count()
        return {
            'normal_users_count': normal_users_count,
            'creators_count': creators_count
        }

class SongStatisticsResource(Resource):
    @marshal_with(song_statistics_fields)
    @jwt_required()
    def get(self):
        # user = User.query.filter_by(username=username).first()
        # if user.user_type != 'admin':
        #     return {'message': 'Not accessible to user'}, 403

        songs_count = Song.query.count()

        # Top 3 songs based on rating
        song_rating = {}
        for song in Song.query.filter_by(flagged=0).all():
            ratings = Rating.query.filter_by(song_id=song.song_id).all()
            if ratings:
                total_rating = sum(r.rating for r in ratings)
                avg_rating = total_rating / len(ratings) if len(ratings) != 0 else 0
                song_rating[song.song_name] = avg_rating
        
        top_songs_temp = sorted(song_rating.items(), key=lambda x: x[1], reverse=True)[:3]
        
        top_songs=[]
        for i in top_songs_temp:
            top_songs.append(i[0])

        return {
            'songs_count': songs_count,
            'top_songs': top_songs
        }

class AlbumStatisticsResource(Resource):
    @marshal_with(album_statistics_fields)
    @jwt_required()
    def get(self):
        # user = User.query.filter_by(username=username).first()
        # if user.user_type != 'admin':
        #     return {'message': 'Not accessible to user'}, 403

        albums_count = Album.query.count()

        # Number of genres
        genres = set(album.genre for album in Album.query.all())
        genres_count = len(genres)

        album_rating = {}
        for album in Album.query.all():
            album_songs = Song.query.filter_by(album_id=album.album_id, flagged=0).all()
            
            if album_songs:
                
                l=[]
                for song in album_songs:
                    if len(song.ratings)!=0:
                        l.append(song.ratings[0].rating)
                
                total_album_rating = sum(l) / len(l)
                album_rating[album.album_name] = total_album_rating

        top_albums_1 = sorted(album_rating.items(), key=lambda x: x[1], reverse=True)[:3]
        top_albums=[]
        for i in top_albums_1:
            top_albums.append(i[0])
        # Top 3 creators based on average album ratings
        creator_rating = {}
        for creator in Creator.query.all():
            user = User.query.filter_by(user_id=creator.user_id).first()
            creator_albums = Album.query.filter_by(artist=creator.creator_id).all()
            if creator_albums:
                total_creator_rating = sum(album_rating.get(album.album_name, 0) for album in creator_albums) / len(creator_albums)
                creator_rating[user.username] = total_creator_rating

        top_creators_1 = sorted(list(creator_rating.items()), key=lambda x: x[1], reverse=True)[:3]
        top_creators=[]

        for i in top_creators_1:
            top_creators.append(i[0])

        return {
            'albums_count': albums_count,
            'genres_count': genres_count,
            'top_albums': top_albums,
            'top_creators': top_creators
        }


api.add_resource(UserStatisticsResource, '/user_statistics')
api.add_resource(SongStatisticsResource, '/song_statistics')
api.add_resource(AlbumStatisticsResource, '/album_statistics')

####################################################################################################

data_fields = {
    'average_rating': fields.Float,
    'song_count': fields.Integer,
    'album_count': fields.Integer,
}

class CreatorDashboardResource(Resource):
    @marshal_with(data_fields)
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        creator = Creator.query.filter_by(user_id = current_user).first()
        albums = Album.query.filter_by(artist=creator.creator_id)

        album_count = 0
        song_count = 0
        ratings = []

        for album in albums:
            album_count += 1

            songs = Song.query.filter_by(album_id=album.album_id)
            for song in songs:
                rating_data = Rating.query.filter_by(song_id=song.song_id)
                for i in rating_data:
                    ratings.append(i.rating)
                song_count += 1

        if len(ratings) == 0:
            average_rating = 0
        else:
            average_rating = sum(ratings) / len(ratings)
            average_rating = round(average_rating,2)
        
        return {
            'average_rating': average_rating,
            'song_count': song_count,
            'album_count': album_count,
        }

api.add_resource(CreatorDashboardResource, '/creator_dashboard1')

####################################################################################################

album_parser = reqparse.RequestParser()
album_parser.add_argument('album_name', type=str, required=True)
album_parser.add_argument('genre', type=str, required=True)

album_fields = {
    'album_name': fields.String,
    'genre': fields.String,
    'artist': fields.String,
    'song_count': fields.Integer,
    'song_data': fields.List(fields.List(fields.String)),
    'artist_username': fields.String,
}

class AlbumResource(Resource):
    @marshal_with(album_fields)
    @jwt_required()
    def get(self, album_id):
        album_data = Album.query.filter_by(album_id=album_id).first()
        song_data = Song.query.filter_by(album_id=album_id, flagged=0)
        creator_data = Creator.query.filter_by(creator_id=album_data.artist).first()
        username_artist = User.query.filter_by(user_id=creator_data.user_id).first()

        album_song_data_list = []
        for i in song_data:
            song = [i.song_id, i.song_name]
            album_song_data_list.append(song)
       
        album_data_list = {
            'album_name': album_data.album_name,
            'genre': album_data.genre,
            'artist': album_data.artist,
            'song_count': len(album_song_data_list),
            'song_data': album_song_data_list,
            'artist_username': username_artist.username,
        }

        return album_data_list, 200
    
    @jwt_required()
    def post(self):
        data = album_parser.parse_args()
        name = data['album_name']
        genre = data['genre']
        current_user = get_jwt_identity()
        creator = Creator.query.filter_by(user_id = current_user).first()
        a = Album(album_name = name, genre = genre, artist = creator.creator_id)
        db.session.add(a)
        db.session.commit()
        return {'message': 'Album created succesfully'}, 200

    @jwt_required()
    def put(self,album_id):
        data = album_parser.parse_args()
        name = data['album_name']
        genre = data['genre']
        album = Album.query.filter_by(album_id = album_id).first()
        album.album_name = name
        album.genre = genre
        db.session.commit()
        return {'message': 'Album edited succesfully'}, 200

    # @jwt_required()
    def delete(self, album_id):
        album = Album.query.filter_by(album_id = album_id).first()
        if album:
            songs = Song.query.filter_by(album_id = album.album_id)
            for song in songs:
                if song:
                    temps = PlaylistSong.query.filter_by(song_id = song.song_id)
                    for temp in temps:
                        db.session.delete(temp)
                        
            db.session.delete(album)
            db.session.commit()
            return {'message': 'Album deleted succesfully'}, 200
        return {'message':'Album not found'}, 404



api.add_resource(AlbumResource, '/album', '/album/<int:album_id>')

####################################################################################

song_parser = reqparse.RequestParser()
song_parser.add_argument('song_name', type=str)
song_parser.add_argument('duration', type=str)
song_parser.add_argument('release_date', type=str)
song_parser.add_argument('lyrics', type=str)

song_details_fields = {
    'song_name': fields.String,
    'lyrics': fields.String,
    'duration': fields.Integer,
    'date_created': fields.String,
    'album_id': fields.Integer,
    'ratings': fields.List(fields.Integer),
    'playlists': fields.List(fields.String),
    'artist_username': fields.String,
    'album_name': fields.String,
    'username': fields.String,
    'song_id': fields.Integer,
}


class SongDetailsResource(Resource):
    @marshal_with(song_details_fields)
    @jwt_required()
    def get(self, song_id):
        song_data = Song.query.filter_by(song_id=song_id).first()
        album_data = Album.query.filter_by(album_id=song_data.album_id).first()
        creator_data = Creator.query.filter_by(creator_id=album_data.artist).first()
        artist_data = User.query.filter_by(user_id=creator_data.user_id).first()
        print("data",song_data.date_created)
        song_data_dict = {
            'song_name': song_data.song_name,
            'lyrics': song_data.lyrics,
            'duration': song_data.duration,
            'date_created': str(song_data.date_created)[0:10],
            'album_id': song_data.album_id,
            'ratings': [rating.rating for rating in song_data.ratings],
            'artist_username': artist_data.username,
            'album_name': album_data.album_name,
            'song_id': song_data.song_id
        }
        return song_data_dict, 200
    
    # def put(self, song_id):
    #     song = Song.query.filter_by(song_id = song_id).first()
    #     if song.flagged=="False":
    #         song.flagged = True
    #         db.session.commit()
    #         return {'message':"Flag update successfully","is_flagged":"True"},200
    #     elif song.flagged=="True":
    #         song.flagged = False
    #         db.session.commit()
    #         return {'message':"Flag update successfully","is_flagged":"False"},200
        

    # def post(self,album_id):
    #     print("Hello")
    #     data = song_parser.parse_args()
    #     title = data['song_name']
    #     duration = data['duration']
    #     date_created = data['release_date']
    #     lyrics = data['lyrics']
    #     a = Song(song_name = title, lyrics = lyrics , duration = duration, date_created = date_created, album_id = album_id)
    #     db.session.add(a)
    #     db.session.commit()
    #     return {'message': 'Song uploaded succesfully'}, 200

    @jwt_required()
    def put(self, song_id):
        song = Song.query.filter_by(song_id = song_id).first()
        data = song_parser.parse_args()
        song.song_name = data['song_name']
        song.duration = data['duration']
        song.date_created = datetime.datetime.strptime(data['release_date'], '%Y-%m-%d')
        song.lyrics = data['lyrics']
        db.session.commit()
        return {'message': 'Song edited succesfully'}, 200

    @jwt_required()
    def delete(self, song_id):
        song = Song.query.filter_by(song_id = song_id).first()
        if song:
            temps = PlaylistSong.query.filter_by(song_id = song_id)
            for temp in temps:
                db.session.delete(temp)
                db.session.commit()
            db.session.delete(song)
            db.session.commit()
            return {'message': 'Song deleted succesfully'}, 200
        return {'message':'Song not found'}, 404

    

api.add_resource(SongDetailsResource,'/song', '/song/<int:song_id>') 


rating_parser = reqparse.RequestParser()
rating_parser.add_argument('rating', type=int, required=True)

class SongRating(Resource):
    @jwt_required()
    def post(self,song_id):
        user = get_jwt_identity()
        args = rating_parser.parse_args()
        rating_value = args['rating']
        user = User.query.filter_by(user_id=user).first()

        existing_rating = Rating.query.filter_by(user_id=user.user_id, song_id=song_id).first()

        if existing_rating:
            existing_rating.rating = rating_value
        else:
            new_rating = Rating(user_id=user.user_id, song_id=song_id, rating=rating_value)
            db.session.add(new_rating)

        db.session.commit()

        return {'message':'Rating submitted'},200

api.add_resource(SongRating, '/song_rating/<int:song_id>')

class SongUpload(Resource):
    @jwt_required()
    def post(self,album_id):
        data = song_parser.parse_args()
        
        title = data['song_name']
        
        duration = data['duration']
        date_created = datetime.datetime.strptime(data['release_date'], '%Y-%m-%d')
        lyrics = data['lyrics']
        
        a = Song(song_name = title, lyrics = lyrics , duration = int(duration), date_created = date_created, album_id = album_id, flagged=0)
        db.session.add(a)
        db.session.commit()
        return {'message': 'Song uploaded succesfully'}, 200
    
    


api.add_resource(SongUpload,'/uploadsong/<int:album_id>') 


#############################################################################################

playlist_detail_fields = {
    'song_name': fields.String,
    'duration': fields.Float,
    'artist_username': fields.String,
    'album_name': fields.String,
    'song_id': fields.Integer,
    'album_id': fields.Integer,
    'playlist_name': fields.String,
    'playlist_id': fields.Integer,
}

class PlaylistResource1(Resource):
    @marshal_with(playlist_detail_fields)
    @jwt_required()
    def get(self, playlist_id):
        details = []
        playlist_name = Playlist.query.filter_by(playlist_id = playlist_id).first().playlist_name
        
        playlist_songs = PlaylistSong.query.filter_by(playlist_id = playlist_id).all()
        
       
        for i in playlist_songs:
            song_detail = Song.query.filter_by(song_id=i.song_id, flagged=0).first()
           
            if song_detail:
                album_detail = Album.query.filter_by(album_id=song_detail.album_id).first()
                creator_detail = Creator.query.filter_by(creator_id=album_detail.artist).first()
                x = User.query.filter_by(user_id=creator_detail.user_id).first()
                details.append({
                    'song_name': song_detail.song_name,
                    'duration': song_detail.duration,
                    'artist_username': x.username,
                    'album_name': album_detail.album_name,
                    'song_id': song_detail.song_id,
                    'album_id': album_detail.album_id,
                    'playlist_name': playlist_name,
                    'playlist_id': playlist_id,
                })
        
        
        return details       

api.add_resource(PlaylistResource1, '/playlist/<int:playlist_id>')

######################################################################################################


edit_playlist_parser = reqparse.RequestParser()
edit_playlist_parser.add_argument('song_id', type=int, required=True)
edit_playlist_parser.add_argument('action', type=str, required=True, choices=['add', 'remove'])

playlist_song_fields = {
    'id': fields.Integer,
    'playlist_id': fields.Integer,
    'song_id': fields.Integer,
}

class EditPlaylistResource(Resource):
    @marshal_with(playlist_song_fields)
    @jwt_required()
    def post(self, playlist_id):
        args = edit_playlist_parser.parse_args()
        song_id = args['song_id']
        action = args['action']

        playlist = Playlist.query.get(playlist_id)
        if not playlist:
            return {'message': 'Playlist not found'}, 404

        if action == 'add':
            playlist_song = PlaylistSong(playlist_id=playlist_id, song_id=song_id)
            db.session.add(playlist_song)
            db.session.commit()
        elif action == 'remove':
            song_to_remove = PlaylistSong.query.filter_by(playlist_id=playlist_id, song_id=song_id).first()
            if song_to_remove:
                db.session.delete(song_to_remove)
                db.session.commit()
            else:
                return {'message': 'Song not found in the playlist'}, 404

        return playlist_song, 200

api.add_resource(EditPlaylistResource, '/edit_playlist/<int:playlist_id>', endpoint='edit_playlist')