from flask import render_template, request, jsonify, send_from_directory, redirect, url_for
from app import app, UPLOAD_FOLDER
from file_utils import get_file_content, save_file_content
import os

@app.route('/')
def index():
    files = os.listdir(UPLOAD_FOLDER)
    return render_template('index.html', files=files)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    return redirect(url_for('index'))

@app.route('/uploads/<filename>')
def download_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)

@app.route('/edit/<filename>', methods=['POST'])
def edit_file(filename):
    content = request.form['content']
    result = save_file_content(filename, content)
    if result != "Success":
        return result, 400
    return redirect(url_for('index'))

@app.route('/delete/<filename>', methods=['POST'])
def delete_file(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except:
            return "Unable to delete file. The file may be in use or you may not have permission.", 400
    return redirect(url_for('index'))

@app.route('/file_content/<filename>')
def file_content(filename):
    content = get_file_content(filename)
    return jsonify({'content': content})