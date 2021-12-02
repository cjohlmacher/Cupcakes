"""Flask app for Cupcakes"""
from flask import Flask, render_template, redirect, flash, jsonify, request, session
from flask_debugtoolbar import DebugToolbarExtension
from models import db, connect_db, Cupcake
import os

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///cupcakes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY',"placeholder")
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
debug = DebugToolbarExtension(app)

connect_db(app)

@app.route('/')
def home_page():
    return render_template('home.html')

@app.route('/api/cupcakes')
def get_cupcakes():
    all_cupcakes = Cupcake.query.all()
    serialized_cupcakes = [
        cupcake.serialize() for cupcake in all_cupcakes]
    return jsonify(cupcakes=serialized_cupcakes)

@app.route('/api/cupcakes', methods=['POST'])
def create_cupcake():
    print(request.json)
    flavor = request.json['flavor']
    size = request.json['size']
    rating = request.json['rating'] 
    image = request.json.get('image',None) 
    if image:
        new_cupcake = Cupcake(flavor=flavor, size=size, rating=rating, image=image)
    else:
        new_cupcake = Cupcake(flavor=flavor, size=size, rating=rating)
    db.session.add(new_cupcake)
    db.session.commit()
    serialized_cupcake = new_cupcake.serialize()
    response_json = jsonify(cupcake=serialized_cupcake)
    return (response_json,201)

@app.route('/api/cupcakes/<int:cupcake_id>')
def get_cupcake(cupcake_id):
    cupcake = Cupcake.query.get_or_404(cupcake_id)
    serialized_cupcake = cupcake.serialize()
    return jsonify(cupcake=serialized_cupcake)

@app.route('/api/cupcakes/<int:cupcake_id>', methods=['PATCH'])
def update_cupcake(cupcake_id):
    cupcake = Cupcake.query.get_or_404(cupcake_id)
    cupcake.flavor = request.json.get('flavor',cupcake.flavor)
    cupcake.size = request.json.get('size',cupcake.size)
    cupcake.rating = request.json.get('rating',cupcake.rating)
    cupcake.image = request.json.get('image',cupcake.image)
    db.session.add(cupcake)
    db.session.commit()
    serialized_cupcake = cupcake.serialize()
    return jsonify(cupcake=serialized_cupcake)

@app.route('/api/cupcakes/<int:cupcake_id>', methods=['DELETE'])
def delete_cupcake(cupcake_id):
    cupcake = Cupcake.query.get_or_404(cupcake_id)
    db.session.delete(cupcake)
    db.session.commit()
    return jsonify(message="Deleted")
