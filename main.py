from flask import Flask, render_template, make_response, send_file, abort, jsonify, request, session
from time import sleep
import os
import auth
import user
import structure
from utilities import get_session_id

app = Flask(__name__, static_folder='ng/dist/ng', static_url_path='')
app.secret_key = b'_6#y2L"F4Q8z\n\xec]/'

structure1 = {'title': 'testTitle1','user': {'firstName': 'first1', 'lastName': 'last1'},'uploadDate': 'testDate1','description': 'testDescription1','img': '/images/6.jpg','sid': 0}
structure2 = {'title': 'testTitle2','user': {'firstName': 'first2', 'lastName': 'last2'},'uploadDate': 'testDate2','description': 'testDescription2','img': '/images/1.jpg','sid': 1}
structure3 = {'title': 'testTitle3','user': {'firstName': 'first3', 'lastName': 'last3'},'uploadDate': 'testDate3','description': 'testDescription3','sid': 2}
structure4 = {'title': 'testTitle4','user': {'firstName': 'first4', 'lastName': 'last4'},'uploadDate': 'testDate4','description': 'testDescription4','img': '/images/5.jpg','sid': 3}
structures = [structure1, structure2, structure3, structure4]

@app.route('/')
def home():
    return make_response(open('ng/dist/ng/index.html').read())

@app.errorhandler(404)
def not_found_error(error):
    return make_response(open('ng/dist/ng/index.html').read())

@app.route('/images/<image>')
def get_image(image=None):
	if os.path.isfile('assets/images/{}'.format(image)):
		return send_file('assets/images/{}'.format(image))
	else:
		abort(404, discription='Image not found')

@app.route('/api/structure', methods=['POST'])
def upload_structure():
	user_id = get_session_id()
	if not user_id:
		return 'You are not logged in'

	sleep(1)
	structure_data = request.json['structure']

	return {'response': structure.upload_structure(structure_data, user_id)}

@app.route('/api/structure/<sid>', methods=['GET'])
def get_structure(sid):
	# Query database for structure
	return jsonify(structures[int(sid)])

@app.route('/api/recent_structures', methods=['GET'])
def get_recent_structures():
	# Query database to get recent structures
	return jsonify(structures)

@app.route('/api/users', methods=['GET', 'POST'])
def register():
	if request.method == 'GET':
		user_id = get_session_id()
		return {'response': user.get_user(user_id)} if user_id else {'response': '404'}

	if request.method == 'POST':
		user_data = request.json['user']
		return {'response':auth.register_user(user_data)}

@app.route('/api/users/verify', methods=['PUT'])
def verify():
	user_id = request.json['user_id']
	verifycode = request.json['verify_code']
	return {'response': 'OK'} if auth.verify(user_id, verifycode) else {'response': 'INVALID'}

@app.route('/api/users/password', methods=['PUT'])
def setPassword():
	user_id = get_session_id()
	new_pass = request.json['new_pass']
	old_pass = request.json['old_pass']
	return {'response': user.setPassword(user_id, new_pass, old_pass)}

@app.route('/api/users/login', methods=['POST'])
def login():
	credentials = request.json['credentials']
	return {'response': auth.login(credentials)}

@app.route('/api/logout')
def logout():
	session['user_id'] = None
	return {'response': 'OK'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000)
