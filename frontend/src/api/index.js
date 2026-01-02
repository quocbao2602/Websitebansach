import API from './client';

export const authAPI = {
  register: (email, password, name) => API.post('/auth/register', { email, password, name }),
  login: (email, password) => API.post('/auth/login', { email, password }),
  getMe: () => API.get('/auth/me'),
  updateMe: (data) => API.put('/auth/me', data),
  logout: () => API.post('/auth/logout')
};

export const booksAPI = {
  getAll: (filters = {}) => API.get('/books', { params: filters }),
  getById: (id) => API.get(`/books/${id}`),
  create: (data) => API.post('/books', data)
};

export const categoriesAPI = {
  getAll: () => API.get('/categories')
};

export const ordersAPI = {
  create: (data) => API.post('/orders', data),
  getAll: () => API.get('/orders'),
  getById: (id) => API.get(`/orders/${id}`),
  cancel: (id) => API.put(`/orders/${id}/cancel`)
};

export const adminAPI = {
  // Categories
  getCategories: () => API.get('/admin/categories'),
  createCategory: (data) => API.post('/admin/categories', data),
  updateCategory: (id, data) => API.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/admin/categories/${id}`),

  // Books
  getBooks: () => API.get('/admin/books'),
  createBook: (data) => API.post('/admin/books', data),
  updateBook: (id, data) => API.put(`/admin/books/${id}`, data),
  deleteBook: (id) => API.delete(`/admin/books/${id}`),

  // Orders
  getOrders: () => API.get('/admin/orders'),
  updateOrderStatus: (id, status) => API.put(`/admin/orders/${id}/status`, { status }),

  // Authors
  getAuthors: () => API.get('/admin/authors'),
  createAuthor: (data) => API.post('/admin/authors', data),

  // Publishers
  getPublishers: () => API.get('/admin/publishers'),
  createPublisher: (data) => API.post('/admin/publishers', data),

  // Users
  getUsers: () => API.get('/admin/users'),
  updateUserRole: (id, role) => API.put(`/admin/users/${id}/role`, { role })
};

export const reviewsAPI = {
  getByBook: (bookId) => API.get(`/reviews/book/${bookId}`),
  create: (data) => API.post('/reviews', data)
};
