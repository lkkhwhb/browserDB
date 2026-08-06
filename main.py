from flask import Flask, send_file

host = "0.0.0.0"

app = Flask(__name__)

@app.route("/")
def home(): return send_file("index.html")

app.run(host=host)

