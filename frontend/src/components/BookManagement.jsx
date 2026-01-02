import React, { useState, useEffect } from 'react';
import { adminAPI, booksAPI } from '../api';
import './BookManagement.css';

export default function BookManagement() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    isbn: '',
    publicationYear: '',
    authorName: '',
    publisherName: '',
    categoryName: ''
  });

  useEffect(() => {
    fetchBooks();
    fetchMetadata();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getBooks();
      setBooks(res.data);
    } catch (err) {
      console.error('Error fetching books:', err);
      alert('Lỗi tải sách: ' + err.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [catRes, authRes, pubRes] = await Promise.all([
        adminAPI.getCategories(),
        adminAPI.getAuthors(),
        adminAPI.getPublishers()
      ]);
      setCategories(catRes.data);
      setAuthors(authRes.data);
      setPublishers(pubRes.data);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean data before sending
      const cleanData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: formData.price ? parseFloat(formData.price) : 0,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        imageUrl: formData.imageUrl.trim(),
        isbn: formData.isbn.trim(),
        publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : '',
        authorName: formData.authorName.trim(),
        publisherName: formData.publisherName.trim(),
        categoryName: formData.categoryName.trim()
      };

      console.log('Submitting book data:', cleanData);
      
      if (editingBook) {
        await adminAPI.updateBook(editingBook.id, cleanData);
        alert('Cập nhật sách thành công!');
      } else {
        await adminAPI.createBook(cleanData);
        alert('Thêm sách thành công!');
      }
      setFormData({ title: '', description: '', price: '', stock: '', imageUrl: '', isbn: '', publicationYear: '', authorName: '', publisherName: '', categoryName: '' });
      setEditingBook(null);
      setShowForm(false);
      fetchBooks();
      fetchMetadata(); // Refresh metadata to include newly created items
    } catch (err) {
      console.error('Submit error:', err);
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa sách này?')) {
      try {
        await adminAPI.deleteBook(id);
        alert('Xóa sách thành công!');
        fetchBooks();
      } catch (err) {
        alert('Lỗi: ' + err.response?.data?.error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBook(null);
    setFormData({ title: '', description: '', price: '', stock: '', imageUrl: '', isbn: '', publicationYear: '', authorName: '', publisherName: '', categoryName: '' });
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      description: book.description || '',
      price: book.price || '',
      stock: book.stock || '',
      imageUrl: book.imageUrl || '',
      isbn: book.isbn || '',
      publicationYear: book.publicationYear || '',
      authorName: book.Author?.name || '',
      publisherName: book.Publisher?.name || '',
      categoryName: book.Category?.name || ''
    });
    setShowForm(true);
  };

  return (
    <div className="book-management">
      <div className="management-header">
        <h2>Quản Lý Sách</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Đóng Form' : '+ Thêm Sách'}
        </button>
      </div>

      {showForm && (
        <form className="book-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-col">
              <input
                type="text"
                name="title"
                placeholder="Tên sách *"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="description"
                placeholder="Mô tả"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
              />
              <input
                type="text"
                name="imageUrl"
                placeholder="URL hình ảnh"
                value={formData.imageUrl}
                onChange={handleInputChange}
              />
              {formData.imageUrl && (
                <div className="image-preview">
                  <img src={formData.imageUrl} alt="Preview" />
                </div>
              )}
            </div>
            <div className="form-col">
              <input
                type="number"
                name="price"
                placeholder="Giá (VND) *"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="stock"
                placeholder="Số lượng *"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="isbn"
                placeholder="ISBN"
                value={formData.isbn}
                onChange={handleInputChange}
              />
              <input
                type="number"
                name="publicationYear"
                placeholder="Năm xuất bản"
                value={formData.publicationYear}
                onChange={handleInputChange}
              />
              <div className="input-with-label">
                <label>Tác giả (nhập tên hoặc chọn)</label>
                <input
                  type="text"
                  name="authorName"
                  placeholder="Nhập tên tác giả"
                  value={formData.authorName}
                  onChange={handleInputChange}
                  list="authors-list"
                />
                <datalist id="authors-list">
                  {authors.map(a => (
                    <option key={a.id} value={a.name} />
                  ))}
                </datalist>
              </div>
              <div className="input-with-label">
                <label>Nhà xuất bản (nhập tên hoặc chọn)</label>
                <input
                  type="text"
                  name="publisherName"
                  placeholder="Nhập tên NXB"
                  value={formData.publisherName}
                  onChange={handleInputChange}
                  list="publishers-list"
                />
                <datalist id="publishers-list">
                  {publishers.map(p => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>
              <div className="input-with-label">
                <label>Thể loại (nhập tên hoặc chọn)</label>
                <input
                  type="text"
                  name="categoryName"
                  placeholder="Nhập tên thể loại"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  list="categories-list"
                />
                <datalist id="categories-list">
                  {categories.map(c => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn-success">
              {editingBook ? '💾 Cập Nhật' : '➕ Thêm Mới'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              ✕ Hủy
            </button>
          </div>
        </form>
      )}

      {loading && <p>Đang tải...</p>}

      <div className="books-table">
        <table>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên Sách</th>
              <th>Giá</th>
              <th>Tồn Kho</th>
              <th>Tác Giả</th>
              <th>NXB</th>
              <th>Thể Loại</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id}>
                <td>
                  <img 
                    src={book.imageUrl || 'https://via.placeholder.com/60x80?text=No+Image'} 
                    alt={book.title}
                    className="book-thumbnail"
                  />
                </td>
                <td>
                  <strong>{book.title}</strong>
                  {book.isbn && <div className="book-meta">ISBN: {book.isbn}</div>}
                </td>
                <td>{book.price?.toLocaleString('vi-VN')}₫</td>
                <td>{book.stock}</td>
                <td>{book.Author?.name || 'N/A'}</td>
                <td>{book.Publisher?.name || 'N/A'}</td>
                <td>{book.Category?.name || 'N/A'}</td>
                <td>
                  <button className="btn-sm btn-edit" onClick={() => handleEditBook(book)}>✏️ Sửa</button>
                  <button className="btn-sm btn-delete" onClick={() => handleDelete(book.id)}>🗑️ Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
