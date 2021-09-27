from flask import Flask, render_template, make_response, send_file, abort, jsonify, request, session
from time import sleep
import os
import sys
import auth
import user
import structure
from utilities import get_session_id
from crossref.restful import Works
import zipfile
import database

app = Flask(__name__, static_folder='ng/dist/ng', static_url_path='')
app.secret_key = b'_6#y2L"F4Q8z\n\xec]/'


@app.route('/')
def home():
    return make_response(open('ng/dist/ng/index.html').read())

@app.errorhandler(404)
def not_found_error(error):
    return make_response(open('ng/dist/ng/index.html').read())

@app.route('/file/<id>/<file_type>/<file>')
def get_file(id=None, file_type=None, file=None):
	if os.path.isfile('structures/{}/{}/{}'.format(id, file_type, file)):
		return send_file('structures/{}/{}/{}'.format(id, file_type, file))
	else:
		abort(404, description='File not found')

@app.route('/oxdna/<id>')
def get_oxdna_files(id=None):
	# zipf = zipfile.ZipFile('nanobase.zip','w', zipfile.ZIP_DEFLATED)
	filenames = structure.get_oxdna_files(id)
	# for file in filenames:
	# 	zipf.write(file)
	# zipf.close()
	# return send_file('nanobase.zip',
    #         mimetype = 'zip',
    #         attachment_filename= 'nanobase.zip',
    #         as_attachment = True)
	return filenames

@app.route('/download/<file>')
def file_downloads(file=None):
	if os.path.isfile('backups/{}'.format(file)):
		return send_file('backups/{}'.format(file))
	else:
		abort(404, description='File not found')


@app.route('/api/structure', methods=['POST'])
def upload_structure():
	user_id = get_session_id()
	if not user_id:
		return 'You are not logged in'
	structure_data = request.json['structure']
	return {'response': structure.upload_structure(structure_data, user_id)}

@app.route('/api/structure/<id>', methods=['GET'])
def get_structure(id):
	return {'response': structure.get_structure(id)}

@app.route('/api/publication', methods=['POST'])
def get_publication():
	doi_str = request.json['doi']
	return {'response': Works().doi(doi_str)}

@app.route('/api/structure/author/<id>', methods=['GET'])
def check_author(id):
	response = int(id) == get_session_id()
	return {'response': response}

@app.route('/api/isAdmin', methods=['GET'])
def check_admin():
	id = get_session_id()
	return {'response': auth.check_admin(id) if id else False}

@app.route('/api/structure/edit', methods=['POST'])
def edit_structure():
	struct = request.json['structure']
	id = get_session_id()
	authenticated = struct['user']['id'] == id or auth.check_admin(id)
	return {'response': structure.edit_structure(struct) if authenticated else 'Action not allowed'}

@app.route('/api/structure/recent/<count>', methods=['GET'])
def get_recent_structures(count):
	return structure.get_recent_structures(int(count))

@app.route('/api/structure/random/<count>', methods=['GET'])
def get_random_structures(count):
	return structure.get_random_structures(int(count))

@app.route('/api/structure/next/<id>', methods=['GET'])
def get_next_structures(id, n=5):
	return structure.get_next_structures(id, n)

@app.route('/api/tags/recent/<count>', methods=['GET'])
def get_recent_tags(count):
	return structure.get_recent_tags(int(count))

@app.route('/api/tags/autofill/<count>', methods=['GET'])
def get_autofill(count):
	return structure.get_autofill(int(count))
	
@app.route('/api/search/<input>/<category>', methods=['GET'])
def search(input, category):
	return structure.search(input, category)

@app.route('/api/users', methods=['GET', 'POST'])
def register():
	if request.method == 'GET':
		user_id = get_session_id()
		return {'response': user.get_user(user_id)} if user_id else {'response': '404'}

	if request.method == 'POST':
		user_data = request.json['user']
		return {'response':auth.register_user(user_data)}

@app.route('/api/users/id', methods=['GET'])
def get_user_id():
	return str(get_session_id())

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

@app.route('/api/users/forgot/<password>/<user_id>/<token>', methods=['GET'])
def resetPassword(password, user_id, token):
	return {'response': auth.resetPassword(password, user_id, token)}

@app.route('/api/users/login', methods=['POST'])
def login():
	credentials = request.json['credentials']
	return {'response': auth.login(credentials)}

@app.route('/api/users/forgot', methods=['POST'])
def send_reset_token():
	email = request.json['email']
	return {'response': auth.send_reset_token(email)}

@app.route('/api/users/forgot/<token>', methods=['GET'])
def check_reset_token(token):
	return {'response': auth.check_reset_token(token)}

@app.route('/api/logout')
def logout():
	session['user_id'] = None
	return {'response': 'OK'}

if __name__ == '__main__':
    app.run(host='0.0.0.0')
