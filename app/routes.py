from flask import request, jsonify
from werkzeug.exceptions import abort

from app import app
import structure


@app.route('/api/structures', methods=['POST', 'GET'])
def post_or_get_all():
    if request.method == 'POST':
        # convert the payload received to a DTO
        payload = request.get_json()
        dto = structure.from_json(payload)
        # call the service
        s = structure.add(dto)
        # convert the service response (a model object) to a service response
        response_dto = structure.to_dto(s)
        return jsonify(response_dto)
    else:
        ss = structure.get_all()
        return jsonify(list(map(lambda s: structure.to_dto(s), ss)))


@app.route('/api/structures/<structure_id>', methods=['GET'])
def find(structure_id):
    s = structure.find(structure_id)
    if s is None:
        abort(404)
    return jsonify(structure.to_dto(s))
