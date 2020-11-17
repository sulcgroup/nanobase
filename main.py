from flask import json
from werkzeug.exceptions import BadRequest

from app import app


@app.errorhandler(BadRequest)
def handle_bad_request(e):
    response = e.get_response()
    response.data = json.dumps({
        "code": 400,
        "name": e.name,
        "description": e.description,
    })
    response.content_type = "application/json"
    return response


@app.errorhandler(404)
def not_found(error):
    return {}, 404


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
