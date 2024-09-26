import os
import mimetypes
from app import UPLOAD_FOLDER

def get_file_content(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    mime_type, _ = mimetypes.guess_type(file_path)
    
    if mime_type and mime_type.startswith('text'):
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except UnicodeDecodeError:
            try:
                with open(file_path, 'r', encoding='iso-8859-1') as file:
                    return file.read()
            except:
                return "Unable to read file content. This may not be a text file."
    else:
        return "This is not a text file and cannot be displayed."

def save_file_content(filename, content):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    mime_type, _ = mimetypes.guess_type(file_path)
    
    if mime_type and mime_type.startswith('text'):
        try:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
            return "Success"
        except:
            return "Unable to write to file. The file may be in use or you may not have permission."
    else:
        return "This is not a text file and cannot be edited."