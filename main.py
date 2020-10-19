from flask import Flask, render_template, make_response, send_file, abort
import os
app = Flask(__name__, static_folder="ng/dist/ng", static_url_path="")

@app.route('/')
def home():
    return make_response(open('ng/dist/ng/index.html').read())

@app.errorhandler(404)
def not_found_error(error):
    return make_response(open('ng/dist/ng/index.html').read())

@app.route("/images/<image>")
def getImage(image=None):
	if os.path.isfile("assets/images/{}".format(image)):
		return send_file("assets/images/{}".format(image))
	else:
		abort(404, discription="Image not found")

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=9000)