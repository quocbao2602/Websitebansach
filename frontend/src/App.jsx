import React from 'react';
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import BookDetail from './pages/BookDetail';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState('home');
  const [cartItems, setCartItems] = React.useState([]);
  const [selectedBookId, setSelectedBookId] = React.useState(null);
  const [avatar, setAvatar] = React.useState(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setAvatar(savedAvatar);
    } else if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed?.avatar) setAvatar(parsed.avatar);
    }
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleViewBook = (bookId) => {
    setSelectedBookId(bookId);
    setCurrentPage('book-detail');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">📚 BookStore</h1>
          <div className="nav-links">
            <button
              onClick={() => setCurrentPage('home')}
              className={currentPage === 'home' ? 'active' : ''}
            >
              Trang Chủ
            </button>
            <button
              onClick={() => { loadCart(); setCurrentPage('cart'); }}
              className={currentPage === 'cart' ? 'active' : ''}
            >
              🛒 Giỏ hàng {getCartCount() > 0 && `(${getCartCount()})`}
            </button>
            {user ? (
              <>
                <button
                  onClick={() => setCurrentPage('orders')}
                  className={currentPage === 'orders' ? 'active' : ''}
                >
                  📦 Đơn hàng
                </button>
                <button
                  onClick={() => setCurrentPage('profile')}
                  className={`user-info ${currentPage === 'profile' ? 'active' : ''}`}
                  title="Xem và chỉnh sửa thông tin cá nhân"
                >
                  {avatar ? (
                    <img src={avatar} alt="avatar" style={{ width: 24, height: 24, borderRadius: 12, objectFit: 'cover', marginRight: 8, verticalAlign: 'middle' }} />
                  ) : (
                    <span style={{ marginRight: 8 }}>👤</span>
                  )}
                  {user.name}{user.role === 'admin' ? ' (Admin)' : ''}
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => setCurrentPage('admin')}
                    className={currentPage === 'admin' ? 'active' : ''}
                  >
                    Quản Trị
                  </button>
                )}
                <button onClick={handleLogout}>Đăng Xuất</button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentPage('login')}
                  className={currentPage === 'login' ? 'active' : ''}
                >
                  Đăng Nhập
                </button>
                <button
                  onClick={() => setCurrentPage('register')}
                  className={currentPage === 'register' ? 'active' : ''}
                >
                  Đăng Ký
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        {currentPage === 'home' && (
          <Home
            user={user}
            onViewBook={handleViewBook}
            onRequireLogin={() => {
              setCurrentPage('login');
            }}
          />
        )}
        {currentPage === 'book-detail' && (
          <BookDetail 
            bookId={selectedBookId}
            onBack={() => setCurrentPage('home')}
            onAddToCart={loadCart}
            user={user}
            onRequireLogin={() => {
              setCurrentPage('login');
            }}
          />
        )}
        {currentPage === 'cart' && (
          <Cart
            onCheckout={(items) => {
              if (!user) {
                alert('Vui lòng đăng nhập để đặt hàng.');
                setCurrentPage('login');
                return;
              }

              setCartItems(items);
              setCurrentPage('checkout');
            }}
          />
        )}
        {currentPage === 'checkout' && user && (
          <Checkout 
            user={user}
            cartItems={cartItems}
            onOrderSuccess={() => { loadCart(); setCurrentPage('orders'); }}
          />
        )}
        {currentPage === 'checkout' && !user && (
          <div className="login-required">
            <h2>Vui lòng đăng nhập để thanh toán</h2>
            <button onClick={() => setCurrentPage('login')}>Đăng nhập →</button>
          </div>
        )}
        {currentPage === 'orders' && user && <MyOrders />}
        {currentPage === 'orders' && !user && (
          <div className="login-required">
            <h2>Vui lòng đăng nhập để xem đơn hàng</h2>
            <button onClick={() => setCurrentPage('login')}>Đăng nhập →</button>
          </div>
        )}
        {currentPage === 'login' && (
          <Login onLoginSuccess={(user) => { setUser(user); setCurrentPage('home'); }} />
        )}
        {currentPage === 'register' && (
          <Register 
            onRegisterSuccess={(user) => { setUser(user); setCurrentPage('home'); }}
            onSwitchToLogin={() => setCurrentPage('login')}
          />
        )}
        {currentPage === 'admin' && user?.role === 'admin' && <AdminDashboard />}
        {currentPage === 'admin' && user?.role !== 'admin' && (
          <div className="admin-page">
            <h2>Lỗi: Bạn không có quyền truy cập trang này</h2>
            <button onClick={() => setCurrentPage('home')}>← Quay lại Trang Chủ</button>
          </div>
        )}
        {currentPage === 'profile' && user && (
          <Profile 
            user={user} 
            onUpdated={(u) => { setUser(u); }}
            onAvatarUpdated={(src) => { setAvatar(src); localStorage.setItem('userAvatar', src); }}
          />
        )}
        {currentPage === 'profile' && !user && (
          <div className="login-required">
            <h2>Vui lòng đăng nhập để xem trang cá nhân</h2>
            <button onClick={() => setCurrentPage('login')}>Đăng nhập →</button>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2024 Book Store. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
