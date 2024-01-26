from flask import Flask,render_template
from application.models import *
from application.config import DevelopmentConfig
from application.api import api
from flask_jwt_extended import JWTManager
from datetime import datetime as dt

from flask_caching import Cache
import redis
app = Flask(__name__) 
app.config.from_object(DevelopmentConfig)
app.jinja_options['variable_start_string'] = '[[' 
app.jinja_options['variable_end_string'] = ']]'

cache = Cache(app, config={'CACHE_TYPE': 'redis', 'CACHE_KEY_PREFIX': 'myapp', 'CACHE_REDIS_URL': 'redis://localhost:6379/0'})


db.init_app(app)
api.init_app(app)
jwt = JWTManager(app)

app.app_context().push()

with app.app_context():
    db.create_all()  # Create the database tables
    data = User.query.filter_by(user_type='admin').first()
    if not data:
        a = User(username="admin1", password = generate_password_hash('admin1'), user_type="admin", timestamp=dt.now())
        db.session.add(a)
        db.session.commit()


@app.route('/')
def home():
    return render_template("home.html")

@app.route('/register')
def user_register():
    return render_template("register.html")

@app.route('/user_login')
def user_login1():
    return render_template("user_login.html")

@app.route('/admin_login')
def admin_login1():
    return render_template("admin_login.html")

@app.get('/user_dashboard')
@cache.cached(timeout=60)
def user_dash():
    return render_template("user_dashboard.html") 

@app.get('/creator_dashboard')
def creator_dash():
    return render_template("creator_dashboard.html")  

@app.get('/admin_dashboard')
def admin_dash():
    return render_template("admin_dashboard.html")  


if __name__ == '__main__':
    app.run(debug=True)
