from flask import Flask, render_template, make_response, send_file, abort, jsonify, request
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


@app.route("/recent_structures", methods=["GET"])
def test():
	# Query database to get recent structures
	structure1 = {
		'title': 'testTitle1',
		'author': 'testAuthor1',
		'date': 'testDate1',
		'description': 'testDescription1',
		'img': '/images/6.jpg',
		'sid': 0
	}

	structure2 = {
		'title': 'testTitle2',
		'author': 'testAuthor2',
		'date': 'testDate2',
		'description': 'testDescription2',
		'img': '/images/1.jpg',
		'sid': 1
	}

	structure3 = {
		'title': 'testTitle3',
		'author': 'testAuthor3',
		'date': 'testDate3',
		'description': 'testDescription3',
		# 'img': '/images/6.jpg',
		'sid': 2
	}

	structure4 = {
		'title': 'testTitle4',
		'author': 'testAuthor4',
		'date': 'testDate4',
		'description': 'testDescription4',
		'img': '/images/5.jpg',
		'sid': 3
	}

	response = [structure1, structure2, structure3, structure4]
	
	return jsonify(response)

@app.route("/users", methods=["POST"])
def register():
	user = request.json
	print(request.json)
	return user


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=9000)