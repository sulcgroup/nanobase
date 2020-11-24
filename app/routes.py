import os

from flask import request, jsonify, make_response, send_file
from werkzeug.exceptions import abort

from app import app
import structure


@app.route('/')
def home():
    return make_response(open('ng/dist/ng/index.html').read())


@app.route('/images/<image>')
def getImage(image=None):
    if os.path.isfile('assets/images/{}'.format(image)):
        return send_file('assets/images/{}'.format(image))
    else:
        abort(404, discription='Image not found')


@app.route('/api/structure', methods=['POST', 'GET'])
def create_or_get_all_structures():
    if request.method == 'POST':
        dto = structure.dto_from_json(request.get_json())
        # call the service
        s = structure.add(dto)
        # convert the service response (a model object) to a service response
        response_dto = structure.to_dto(s)
        return jsonify(response_dto)
    else:
        ss = structure.get_all()
        return jsonify(list(map(lambda s: structure.to_dto(s), ss)))


@app.route('/api/structure/<structure_id>', methods=['GET'])
def get_a_structure_by_id(structure_id):
    s = structure.get(structure_id)
    if s is None:
        abort(404)
    return jsonify(structure.to_dto(s))


@app.route('/api/structure/fileupload', methods=['POST'])
def upload_file():
    uploaded_file = request.files['file']
    if uploaded_file.filename != '':
        uploaded_file.save(uploaded_file.filename)
    return 'Done!'
