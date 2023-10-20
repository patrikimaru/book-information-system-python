import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";

export default function LandingPage() {
  const { authenticated, logout } = useAuth();

  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    published_year: "",
  });

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/books")
      .then((response) => {
        setBooks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
      });
  }, [authenticated]);

  const createBook = () => {
    axios
      .post("http://127.0.0.1:5000/books", newBook)
      .then((response) => {
        setBooks([...books, response.data]);
        setNewBook({ title: "", author: "", published_year: "" });
      })
      .catch((error) => {
        console.error("Error creating book:", error);
      });
  };

  const updateBook = () => {
    axios
      .put(`http://127.0.0.1:5000/books/${selectedBook.id}`, selectedBook)
      .then((response) => {
        const updatedBooks = books.map((book) => {
          if (book.id === selectedBook.id) {
            return response.data;
          }
          return book;
        });
        setBooks(updatedBooks);
        closeModal(); 
      })
      .catch((error) => {
        console.error("Error updating book:", error);
      });
  };

  const deleteBook = (bookId) => {
    axios
      .delete(`http://127.0.0.1:5000/books/${bookId}`)
      .then(() => {
        setBooks(books.filter((book) => book.id !== bookId));
      })
      .catch((error) => {
        console.error("Error deleting book:", error);
      });
  };

  const filteredBooks = books.filter((book) => {
    const searchTerms = searchQuery.toLowerCase().split(" ");
    return searchTerms.every((term) => {
      return (
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term)
      );
    });
  });

  const openModal = (book) => {
    setSelectedBook(book);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedBook(null);
    setModalIsOpen(false);
  };

  const handleUpdateBookSubmit = (e) => {
    e.preventDefault(); 
    updateBook();
  };

  return (
    <div>
      {authenticated ? (
        <div className="container h-100">
          <div className="row h-100">
            <div className="col-md-6">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Book Information System</h1>
                <button className="btn btn-danger" onClick={logout}>
                  Logout
                </button>
              </div>
              <h2>Add a New Book</h2>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Title"
                  value={newBook.title}
                  onChange={(e) =>
                    setNewBook({ ...newBook, title: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Author"
                  value={newBook.author}
                  onChange={(e) =>
                    setNewBook({ ...newBook, author: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Published Year"
                  value={newBook.published_year}
                  onChange={(e) =>
                    setNewBook({ ...newBook, published_year: e.target.value })
                  }
                />
              </div>
              <button className="btn btn-primary" onClick={createBook}>
                Add Book
              </button>
            </div>
            <div className="col-md-6">
              <h2>Book List</h2>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by title or author"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <ul className="list-group">
                {filteredBooks.map((book) => (
                  <li key={book.id} className="list-group-item">
                    {book.title} by {book.author} (Published:{" "}
                    {book.published_year})
                    <button
                      className="btn btn-danger ms-2"
                      onClick={() => deleteBook(book.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="btn btn-primary ms-2"
                      onClick={() => openModal(book)}
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <Navigate to="/" />
      )}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Book"
        shouldCloseOnOverlayClick={true}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            padding: "20px",
            maxWidth: "400px",
            height: "fit-content",
            margin: "auto",
          },
        }}
      >
        <h2>Edit Book</h2>
        {selectedBook && (
          <form onSubmit={handleUpdateBookSubmit}>
            <div className="mb-3">
              <label className="form-label">Title:</label>
              <input
                type="text"
                className="form-control"
                value={selectedBook.title}
                onChange={(e) =>
                  setSelectedBook({ ...selectedBook, title: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Author:</label>
              <input
                type="text"
                className="form-control"
                value={selectedBook.author}
                onChange={(e) =>
                  setSelectedBook({ ...selectedBook, author: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Published Year:</label>
              <input
                type="text"
                className="form-control"
                value={selectedBook.published_year}
                onChange={(e) =>
                  setSelectedBook({
                    ...selectedBook,
                    published_year: e.target.value,
                  })
                }
              />
            </div>
            <button className="btn btn-secondary me-2" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
