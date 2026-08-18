import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  X,
  CheckCircle2,
  AlertCircle,
  Image,
  Star
} from 'lucide-react';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/slices/toastSlice';

export default function BookManagement() {
  const dispatch = useDispatch();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [pages, setPages] = useState('');
  const [language, setLanguage] = useState('English');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/books?limit=50${search ? `&search=${encodeURIComponent(search)}` : ''}`);
      if (res.data.success) {
        setBooks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [search]);

  const openAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setCategory(categories[0]?.name || 'Technology');
    setIsbn(`978-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setPublisher('BookVerse Publications');
    setPages('300');
    setLanguage('English');
    setPrice('29.99');
    setDiscountPrice('24.99');
    setStock('25');
    setCoverImage('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop');
    setDescription('');
    setFeatured(false);
    setIsBestSeller(false);
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBook(b);
    setTitle(b.title);
    setAuthor(b.author);
    setCategory(b.category);
    setIsbn(b.isbn);
    setPublisher(b.publisher);
    setPages(b.pages?.toString() || '');
    setLanguage(b.language || 'English');
    setPrice(b.price?.toString() || '');
    setDiscountPrice(b.discountPrice?.toString() || '0');
    setStock(b.stock?.toString() || '0');
    setCoverImage(b.coverImage);
    setDescription(b.description);
    setFeatured(Boolean(b.featured));
    setIsBestSeller(Boolean(b.isBestSeller));
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!title || !author || !isbn || !price || !stock || !coverImage || !description) {
      setModalError('Please complete all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        author: author.trim(),
        category,
        isbn: isbn.trim(),
        publisher: publisher.trim(),
        pages: Number(pages),
        language,
        price: Number(price),
        discountPrice: Number(discountPrice) || 0,
        stock: Number(stock) || 0,
        coverImage: coverImage.trim(),
        description: description.trim(),
        featured,
        isBestSeller
      };

      if (editingBook) {
        const res = await api.put(`/books/${editingBook._id}`, payload);
        if (res.data.success) {
          dispatch(showToast('Book updated successfully!', 'success'));
        }
      } else {
        const res = await api.post('/books', payload);
        if (res.data.success) {
          dispatch(showToast('New book added to catalog!', 'success'));
        }
      }

      setIsModalOpen(false);
      fetchBooks();
    } catch (err) {
      setModalError(err.message || 'Failed to save book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await api.delete(`/books/${id}`);
      if (res.data.success) {
        dispatch(showToast('Book deleted from catalog', 'success'));
        fetchBooks();
      }
    } catch (err) {
      dispatch(showToast(err.message || 'Failed to delete book', 'error'));
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif">
            Book Inventory Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add new titles, update pricing and stock levels, and organize categories
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter books by title, author, category, or ISBN..."
          className="w-full text-xs bg-transparent focus:outline-none placeholder:text-slate-400 font-medium"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-3.5 px-4">Book Title & Author</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">ISBN</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Sold</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    Loading book catalog...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No books found.
                  </td>
                </tr>
              ) : (
                books.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.coverImage}
                          alt={b.title}
                          className="w-9 h-12 object-cover rounded-lg shadow-sm shrink-0"
                        />
                        <div className="max-w-xs">
                          <span className="font-bold text-slate-900 line-clamp-1">{b.title}</span>
                          <span className="text-[11px] text-slate-400 block">{b.author}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold text-[11px]">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{b.isbn}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 font-sans">${b.price.toFixed(2)}</span>
                      {b.discountPrice > 0 && b.discountPrice < b.price && (
                        <span className="text-[10px] text-rose-600 block">Sale: ${b.discountPrice.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 font-bold rounded-md text-[10px] ${
                          b.stock <= 0
                            ? 'bg-rose-100 text-rose-800'
                            : b.stock <= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {b.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{b.totalSold || 0}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="Edit Book"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(b._id, b.title)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                          title="Delete Book"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 font-serif">
                {editingBook ? 'Edit Book Details' : 'Add New Book to Store'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveBook} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 mb-1">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c._id || c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">ISBN *</label>
                  <input
                    type="text"
                    required
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Publisher</label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Retail Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Discount Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Stock Units Available *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Page Count</label>
                  <input
                    type="number"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 mb-1">Cover Image URL *</label>
                  <input
                    type="url"
                    required
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 mb-1">Book Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-500"
                  ></textarea>
                </div>

                <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span>Featured on Home Page</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span>Mark as Best Seller</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  {submitting ? 'Saving...' : editingBook ? 'Save Changes' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
