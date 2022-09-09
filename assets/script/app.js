let books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function loadDataFromStorage() {
  const serializeData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializeData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function clearFromData() {
  const inputTitle = document.getElementById("book-title");
  const inputAuthor = document.getElementById("book-author");
  const inputYear = document.getElementById("book-year");
  const checkbox = document.getElementById("book-status");
  const spanText = document.querySelector(".book-type");

  inputTitle.value = "";
  inputAuthor.value = "";
  inputYear.value = "";
  checkbox.checked = false;
  spanText.innerText = "Belum selesai dibaca";
}

function makeBook(bookObject) {
  const { id, title, author, year, isCompleted } = bookObject;

  const textTitle = document.createElement("h1");
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = author;

  const textYear = document.createElement("p");
  textYear.innerText = year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("book_content");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("book_card");
  container.append(textContainer);
  container.setAttribute("id", `book-${id}`);

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btnHapus");
  deleteButton.innerText = "Hapus buku";
  deleteButton.addEventListener("click", function () {
    if (confirm("Yakin ingin menghapus buku?")) {
      deleteBook(id);
    }
  });

  if (isCompleted) {
    const toggleButton = document.createElement("button");
    toggleButton.classList.add("btnStatus");
    toggleButton.innerText = "Belum selesai dibaca";
    toggleButton.addEventListener("click", function () {
      toggleBookStatus(id);
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("action");
    buttonContainer.append(toggleButton, deleteButton);

    container.append(buttonContainer);
  } else {
    const toggleButton = document.createElement("button");
    toggleButton.classList.add("btnStatus");
    toggleButton.innerText = "Selesai dibaca";
    toggleButton.addEventListener("click", function () {
      toggleBookStatus(id);
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("action");
    buttonContainer.append(toggleButton, deleteButton);

    container.append(buttonContainer);
  }

  return container;
}

function searchBook() {
  const searchText = document.querySelector(".search-book").value;
  const localStorageItem = JSON.parse(localStorage.getItem(STORAGE_KEY));

  const result = localStorageItem.filter(function (book) {
    return book.title.toLowerCase().includes(searchText);
  });

  if (searchText === "") {
    books = [];
    loadDataFromStorage();
  } else if (result.length === 0) {
    alert("Data buku tidak ditemukan");
  } else {
    books = [];
    for (const res of result) {
      books.push(res);
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

function addBook() {
  const bookTitle = document.getElementById("book-title").value;
  const bookAuthor = document.getElementById("book-author").value;
  const bookYear = document.getElementById("book-year").value;
  const bookStatus = document.getElementById("book-status").checked;

  const generatedId = generateId();
  const bookObject = generateBookObject(generatedId, bookTitle, bookAuthor, bookYear, bookStatus);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function toggleBookStatus(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  if (bookTarget.isCompleted === true) {
    bookTarget.isCompleted = false;
  } else {
    bookTarget.isCompleted = true;
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function updateBook(book) {
  const inputTitle = document.querySelector(".modal_judul").value;
  const inputAuthor = document.querySelector(".modal_penulis").value;
  const inputYear = document.querySelector(".modal_tahun").value;
  const checkboxStatus = document.querySelector(".modal_status").checked;

  book.title = inputTitle;
  book.author = inputAuthor;
  book.year = inputYear;
  book.isCompleted = checkboxStatus;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.querySelector("#form-input-book");
  const submitSearch = document.querySelector("#form_search");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    clearFromData();
  });

  submitSearch.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log("Data berhasil disimpan");
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.querySelector("#uncompletedBook");
  const completedBookList = document.querySelector("#completedBook");
  const bookStatus = document.getElementById("book-status");
  const spanText = document.querySelector(".type-book");

  bookStatus.addEventListener("change", function () {
    if (this.checked) {
      spanText.innerText = "Selesai dibaca";
    } else {
      spanText.innerText = "Belum selesai dibaca";
    }
  });

  uncompletedBookList.innerHTML = "";
  completedBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);

    if (bookItem.isCompleted) {
      completedBookList.appendChild(bookElement);
    } else {
      uncompletedBookList.appendChild(bookElement);
    }
  }
});
