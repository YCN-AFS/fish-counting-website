function showEditForm(filename) {
    var editForm = document.getElementById('edit-' + filename);
    if (editForm.style.display === 'none' || editForm.style.display === '') {
        fetch('/file_content/' + filename)
            .then(response => response.json())
            .then(data => {
                editForm.querySelector('textarea').value = data.content;
                editForm.style.display = 'block';
            });
    } else {
        editForm.style.display = 'none';
    }
}