import React, { useEffect, useState } from 'react';
import { booksAPI, categoriesAPI } from '../api';
import './Home.css';

export default function Home({ onViewBook, user, onRequireLogin }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', categoryId: '', sort: '' });

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await booksAPI.getAll(filters);
      setBooks(res.data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const addToCart = (book) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng.');
      onRequireLogin?.();
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === book.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: book.id,
        title: book.title,
        price: book.price,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Đã thêm "${book.title}" vào giỏ hàng!`);
  };

  const renderStars = (rating) => {
    if (!rating || Number.isNaN(Number(rating))) return '☆☆☆☆☆';
    const r = Math.round(Number(rating));
    return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(r);
  };

  return (
    <div className="home-container">
      <h1>Cửa Hàng Sách</h1>
      
      <div className="home-content">
        {/* Sidebar Categories */}
        <aside className="categories-sidebar">
          <h3>📚 Danh Mục</h3>
          <div className="category-list">
            <button
              className={`category-item ${filters.categoryId === '' ? 'active' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, categoryId: '' }))}
            >
              🌟 Tất cả
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-item ${filters.categoryId === String(category.id) ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, categoryId: String(category.id) }))}
              >
                📖 {category.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="main-section">
          <div className="filters">
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm sách..."
              value={filters.search}
              onChange={handleFilterChange}
            />
            <select name="sort" value={filters.sort} onChange={handleFilterChange}>
              <option value="">Sắp xếp</option>
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá: Thấp → Cao</option>
              <option value="price-desc">Giá: Cao → Thấp</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>

          {loading && <p>Đang tải...</p>}
          
          {!loading && books.length === 0 && (
            <div className="no-books">
              <p>Không tìm thấy sách nào</p>
            </div>
          )}
          
          <div className="books-grid">
            {books.map(book => (
              <div key={book.id} className="book-card">
                <div className="book-card-image" onClick={() => onViewBook(book.id)}>
                  <img src={book.image || 'https://via.placeholder.com/150'} alt={book.title} />
                </div>
                <h3 onClick={() => onViewBook(book.id)}>{book.title}</h3>
                <p className="author">{book.Author?.name || 'N/A'}</p>
                <p className="price">{book.price.toLocaleString('vi-VN')}₫</p>
                <p className="rating">{renderStars(book.rating)} <span className="rating-value">{Number(book.rating || 0).toFixed(1)}</span></p>
                <p className="stock">Còn {book.stock} cuốn</p>
                <button className="add-to-cart" onClick={() => addToCart(book)}>
                  🛒 Thêm vào giỏ
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
