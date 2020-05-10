const API_TOKEN = '2abbf7c3-245b-404f-9473-ade729ed4653';
const fields = ['title', 'description', 'url', 'rating']; 

// HELPERS

function showAlert(alert, text) {
  document.getElementById(alert).innerHTML = text;
  document.getElementById(alert).classList.remove('d-none');
  setTimeout(function() { 
    document.getElementById(alert).classList.add('d-none');
  }, 10000);
}

function showTab(tab) {
  document.getElementById(`${tab}-tab`).click();
}

// END HELPERS

function createBookmark(bookmark) {
  let url = '/bookmarks';
  let settings = {
    method : 'POST',
    headers : {
        Authorization : `Bearer ${API_TOKEN}`,
        'Content-Type' : 'application/json'
    },
    body : JSON.stringify(bookmark)
  }

  fetch(url, settings)
    .then(response => {
      if(response.ok){
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(createdBookmark => {
      showAlert('successAlert', 'Bookmark creado exitosamente!');
      appendBookmark(createdBookmark, 'bookmarksIndex');
      showTab('index');
    })
    .catch(err => {
      showAlert('errorAlert', err);
    });
}

function updateBookmark(bookmark) {
  let url = `/bookmark/${bookmark.id}`;
  let settings = {
    method : 'PATCH',
    headers : {
        Authorization : `Bearer ${API_TOKEN}`,
        'Content-Type' : 'application/json'
    },
    body : JSON.stringify(bookmark)
  }

  fetch(url, settings)
    .then(response => {
      if(response.ok){
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(updatedBookmark => {
      showAlert('successAlert', 'Bookmark actualizado exitosamente!');
      bookmarkContainer = document.getElementById(bookmark.id);
      bookmarkContainer.innerHTML = `
        <div class="row justify-content-between">
          <div class="col-auto mr-auto">
            <h5><a href="${bookmark.url}">${bookmark.title}</a></h5>
          </div>
          <div class="col-auto">
            <button id="editBookmarkButton-${bookmark.id}" type="button" class="btn btn-link d-inline">
              <i data-feather="edit"></i>
            </button>
            <form id="deleteBookmark-${bookmark.id}" class="d-inline">
              <button type="submit" class="btn btn-link">
                <i data-feather="trash"></i>
              </button>
            </form>
          </div>
        </div>
        <p>${bookmark.description}</p>
        <p><b>Rating: </b>${bookmark.rating}</p>
        <p><b>URL: </b><a href="${bookmark.url}">${bookmark.url}</a></p>`;
      bookmarkContainer.classList.remove('d-none');
      // DELETE EVENTS
      deleteForm = document.getElementById(`deleteBookmark-${bookmark.id}`);
      deleteForm.addEventListener('submit', function(event) {
        event.preventDefault();
        deleteBookmark(bookmark.id);
      });

      // EDIT EVENTS
      editForm = document.getElementById(`editBookmark-${bookmark.id}`);
      editForm.classList.add('d-none');
      editButton = document.getElementById(`editBookmarkButton-${bookmark.id}`);
      editButton.addEventListener('click', function(event) {
        editForm.classList.remove('d-none');
        document.getElementById(bookmark.id).classList.add('d-none');
      });

      feather.replace();
    })
    .catch(err => {
      showAlert('errorAlert', err);
    });
}

function searchBookmark(title) {
  document.getElementById('searchResults').innerHTML = '';
  let url = `/bookmark?title=${title}`;
  let settings = {
    method : 'GET',
    headers : {
        Authorization : `Bearer ${API_TOKEN}`,
        'Content-Type' : 'application/json'
    }
  }

  fetch(url, settings)
    .then(response => {
      if(response.ok){
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(bookmarks => {
      bookmarks.forEach(bookmark => {
        appendBookmark(bookmark, 'searchResults');
      })
    })
    .catch(err => {
      showAlert('errorAlert', err);
    });
}

function watchSearchForm() {
  let searchForm = document.getElementById('searchBookmark');

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBookmark(document.getElementById('searchTitle').value);
  });
}

function watchBookmarkForm() {
  let bookmarkForm = document.getElementById('createBookmark');

  bookmarkForm.addEventListener('submit', function (event) {
    event.preventDefault();
    bookmark = {};

    fields.forEach(field => {
      bookmark[field] = document.getElementById(field).value;
      document.getElementById(field).value = '';
    })

    createBookmark(bookmark);
  });
}

function loadBookmarks() {
  let url = '/bookmarks';
  let settings = {
    method : 'GET',
    headers : {
        Authorization : `Bearer ${API_TOKEN}`,
        'Content-Type' : 'application/json'
    }
  }

  fetch(url, settings)
    .then(response => {
      if(response.ok){
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(bookmarks => {
      bookmarks.forEach(bookmark => {
        appendBookmark(bookmark, 'bookmarksIndex');
      })
    })
    .catch(err => {
      showAlert('errorAlert', err);
    });
}

function appendBookmark(bookmark, containerId) {
  let bookmarksContainer = document.getElementById(containerId);
  let newBookmark = document.createElement('div');
  newBookmark.innerHTML = `
    <div class="m-2 mt-4 p-4 border border-primary rounded" id="bookmark-${bookmark.id}">
      <div id="${bookmark.id}">
        <div class="row justify-content-between">
          <div class="col-auto mr-auto">
            <h5><a href="${bookmark.url}">${bookmark.title}</a></h5>
          </div>
          <div class="col-auto">
            <button id="editBookmarkButton-${bookmark.id}" type="button" class="btn btn-link d-inline">
              <i data-feather="edit"></i>
            </button>
            <form id="deleteBookmark-${bookmark.id}" class="d-inline">
              <button type="submit" class="btn btn-link">
                <i data-feather="trash"></i>
              </button>
            </form>
          </div>
        </div>
        <p>${bookmark.description}</p>
        <p><b>Rating: </b>${bookmark.rating}</p>
        <p><b>URL: </b><a href="${bookmark.url}">${bookmark.url}</a></p>
      </div>
      <form id="editBookmark-${bookmark.id}" class="d-none">
        <div class="form-group">
            <label for="title-${bookmark.id}">Título</label>
            <input type="text" class="form-control" id="title-${bookmark.id}" placeholder="Introduzca el título del libro" value="${bookmark.title}">
        </div>
        <div class="form-group">
            <label for="description-${bookmark.id}">Descripción</label>
            <textarea id="description-${bookmark.id}" class="form-control" rows="5">${bookmark.description}</textarea>
        </div>
        <div class="form-group">
            <label for="url-${bookmark.id}">URL</label>
            <input id="url-${bookmark.id}" type="url" class="form-control" placeholder="https://www.example.com" value="${bookmark.url}">
        </div>
        <div class="form-group">
            <label for="rating-${bookmark.id}">Rating</label>
            <input type="number" class="form-control" id="rating-${bookmark.id}" min="1" max="5" value="${bookmark.rating}">
        </div>
        <button type="submit" class="btn btn-primary" id="submit-${bookmark.id}">Guardar</button>
      </form>
    </div>`;
  if (bookmarksContainer.childElementCount > 0) {
    bookmarksContainer.insertBefore(newBookmark, bookmarksContainer.firstChild);
  } else {
    bookmarksContainer.appendChild(newBookmark);
  }
  // DELETE EVENTS
  deleteForm = document.getElementById(`deleteBookmark-${bookmark.id}`);
  deleteForm.addEventListener('submit', function(event) {
    event.preventDefault();
    deleteBookmark(bookmark.id);
  });

  // EDIT EVENTS
  editButton = document.getElementById(`editBookmarkButton-${bookmark.id}`);
  editButton.addEventListener('click', function(event) {
    console.log(event);
    console.log(bookmark.id);
    document.getElementById(`editBookmark-${bookmark.id}`).classList.remove('d-none');
    document.getElementById(bookmark.id).classList.add('d-none');
  });

  editForm = document.getElementById(`editBookmark-${bookmark.id}`);
  editForm.addEventListener('submit', function(event) {
    event.preventDefault();
    updatedBookmark = {};
    updatedBookmark['id'] = bookmark.id;
    fields.forEach(field => {
      updatedBookmark[field] = document.getElementById(`${field}-${bookmark.id}`).value;
    });
    updateBookmark(updatedBookmark);    
  });

  feather.replace();
}

function deleteBookmark(bookmarkId) {
  let url = `/bookmark/${bookmarkId}`;
  let settings = {
    method : 'DELETE',
    headers : {
        Authorization : `Bearer ${API_TOKEN}`,
        'Content-Type' : 'application/json'
    }
  };
  
  fetch(url, settings)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(result => {
      bookmarkToDelete = document.getElementById(`bookmark-${bookmarkId}`);
      bookmarkToDelete.parentNode.removeChild(bookmarkToDelete);
      showAlert('successAlert', 'Bookmark eliminado exitosamente!');
    })
    .catch(err => {
      showAlert('errorAlert', err);
    });
}

window.addEventListener('load', function(event) {
  watchBookmarkForm();
  watchSearchForm();
  loadBookmarks();
});