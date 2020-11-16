from flask import Flask, render_template, make_response, send_file, abort, jsonify, request, session
from time import sleep
import os
import auth
import user

app = Flask(__name__, static_folder='ng/dist/ng', static_url_path='')
app.secret_key = b'_6#y2L"F4Q8z\n\xec]/'

structure1 = {'title': 'testTitle1','author': 'testAuthor1','date': 'testDate1','description': 'testDescription1','img': '/images/6.jpg','sid': 0}
structure2 = {'title': 'testTitle2','author': 'testAuthor2','date': 'testDate2','description': 'testDescription2','img': '/images/1.jpg','sid': 1}
structure3 = {'title': 'testTitle3','author': 'testAuthor3','date': 'testDate3','description': 'testDescription3','sid': 2}
structure4 = {'title': 'testTitle4','author': 'testAuthor4','date': 'testDate4','description': 'testDescription4','img': '/images/5.jpg','sid': 3}
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
	sleep(2)
	# Insert structure into database
	return request.json

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
		try:
			user_id = session['user_id']
			if not user_id:
				raise KeyError
			return {'response': user.get_user(user_id)}
		except KeyError:
			return {'response': '404'}

	if request.method == 'POST':
		user_data = request.json['user']
		return {'response':auth.register_user(user_data)}

@app.route('/api/users/verify', methods=['PUT'])
def verify():
	user_id = request.json['user_id']
	verifycode = request.json['verify_code']
	return {'response': 'OK'} if auth.verify(user_id, verifycode) else {'response': 'INVALID'}

@app.route('/api/users/login', methods=['POST'])
def login():
	credentials = request.json['credentials']
	return {'response': auth.login(credentials)}

@app.route('/api/logout')
def logout():
	session["user_id"] = None
	return {'response': 'OK'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000)
