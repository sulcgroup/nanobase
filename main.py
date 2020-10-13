from flask import Flask, render_template, make_response
app = Flask(__name__, static_folder="ng/dist/ng", static_url_path="")

print("TEST")

@app.route('/')
def home():
    return make_response(open('ng/dist/ng/index.html').read())

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=9000)