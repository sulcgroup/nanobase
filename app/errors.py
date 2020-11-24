from dataclasses import dataclass

from flask import app, json, jsonify
from werkzeug.exceptions import BadRequest
from app import app

@dataclass
class NanoBaseError:
    code: int
    error: str
    description: str


@app.errorhandler(BadRequest)
def handle_bad_request(e):
    error = NanoBaseError(400, e.name, e.description)
    response = e.get_response()
    response.data = jsonify(error)
    response.content_type = "application/json"
    return response


@app.errorhandler(404)
def resource_not_found(e):
    return jsonify(error=str(e)), 404
