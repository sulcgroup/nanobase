import os
import sys
from flask import Flask, Response, request, send_file, session, jsonify, redirect, abort

app = Flask(__name__, static_url_path='/static', static_folder="static")
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

@app.route("/")
def index():
    print("TEST")
    return send_file("src/index.html")

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=9000)
    print("SERVER IS RUNNING")
