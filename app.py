from flask import Flask
import os

app = Flask(__name__)

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

from routes import *

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)