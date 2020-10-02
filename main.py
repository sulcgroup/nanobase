from flask import Flask, render_template
app = Flask(__name__)

print("TEST")

@app.route('/')
def hello_world():
    # return "Hello"
    return render_template('index.html')

app.run(host="0.0.0.0", port=9000)
 