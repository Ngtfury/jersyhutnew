'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Upload, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  Image as ImageIcon, 
  RefreshCw, 
  ExternalLink, 
  Search, 
  Package, 
  Database,
  ArrowLeft,
  X,
  Sliders,
  Layers,
  Sparkles,
  Copy
} from 'lucide-react';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  uploadProductImage, 
  isSupabaseConfigured,
  getHeroBanner,
  saveHeroBanner,
  getCategoryCovers,
  saveCategoryCovers,
  uploadBannerImage,
  DEFAULT_HERO_BANNER,
  DEFAULT_CATEGORY_COVERS
} from '../../lib/supabase';
import { PRODUCTS as LOCAL_PRODUCTS } from '../../data/products';

const CATEGORIES = [
  'BEST SELLERS',
  'FULL SLEEVES',
  'HALF SLEEVES',
  'OVERSIZED',
  'TSHIRTS'
];

const SIZES = ['S', 'M', 'L', 'XL', '2XL'];

const COLOR_OPTIONS = [
  '-- No Color --',
  'Blue',
  'White',
  'Red',
  'Black',
  'Green',
  'Yellow',
  'Navy / Turquoise',
  'Orange / Blue',
  'Gold',
  'Silver',
  'Pink',
  'Purple'
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'add' | 'banners'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Banners and Covers state
  const [heroBanner, setHeroBanner] = useState(DEFAULT_HERO_BANNER);
  const [categoryCovers, setCategoryCovers] = useState(DEFAULT_CATEGORY_COVERS);
  const [savingHero, setSavingHero] = useState(false);
  const [savingCovers, setSavingCovers] = useState(false);
  const [uploadingHeroImg, setUploadingHeroImg] = useState(false);
  const [uploadingCoverIdx, setUploadingCoverIdx] = useState(null);

  const heroFileInputRef = useRef(null);
  const coverFileInputRefs = useRef([]);

  // Form State
  const initialFormState = {
    name: '',
    price: '',
    original_price: '',
    category: 'BEST SELLERS',
    badge: '',
    color: '-- No Color --',
    stock_per_size: { S: 5, M: 5, L: 5, XL: 5, '2XL': 5 },
    active_sizes: ['S', 'M', 'L', 'XL', '2XL'],
    images: [],
    player: '',
    team: '',
    country: '',
    edition: '',
    material: 'DOTKNIT AERO-COOL',
    description: '',
    isBestSeller: true,
    featured: false
  };

  const [formData, setFormData] = useState(initialFormState);
  const fileInputRef = useRef(null);

  // Load products & site banners
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      const hero = await getHeroBanner();
      if (hero) setHeroBanner(hero);
      const covers = await getCategoryCovers();
      if (covers) setCategoryCovers(covers);
    } catch (err) {
      console.error('Failed to load data:', err);
      setProducts(LOCAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Image Upload handler to Supabase Storage for Products
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    const uploadedUrls = [];

    for (const file of files) {
      try {
        if (isSupabaseConfigured) {
          const publicUrl = await uploadProductImage(file, editingId || 'new');
          uploadedUrls.push(publicUrl);
        } else {
          const localUrl = URL.createObjectURL(file);
          uploadedUrls.push(localUrl);
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        showToast(`Image upload failed: ${err.message}`, 'error');
      }
    }

    if (uploadedUrls.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      showToast(`Uploaded ${uploadedUrls.length} image(s) to Supabase Storage!`);
    }

    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const exists = prev.active_sizes.includes(size);
      const newActive = exists
        ? prev.active_sizes.filter(s => s !== size)
        : [...prev.active_sizes, size];
      
      return {
        ...prev,
        active_sizes: newActive
      };
    });
  };

  const handleStockChange = (size, qty) => {
    const parsed = parseInt(qty, 10);
    setFormData(prev => ({
      ...prev,
      stock_per_size: {
        ...prev.stock_per_size,
        [size]: isNaN(parsed) ? 0 : Math.max(0, parsed)
      }
    }));
  };

  // Switch to edit product
  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      original_price: product.original_price || '',
      category: product.category || 'BEST SELLERS',
      badge: product.badge || '',
      color: product.color || '-- No Color --',
      stock_per_size: product.stock_per_size || { S: 5, M: 5, L: 5, XL: 5, '2XL': 5 },
      active_sizes: product.sizes || ['S', 'M', 'L', 'XL', '2XL'],
      images: product.images || [],
      player: product.player || '',
      team: product.team || '',
      country: product.country || '',
      edition: product.edition || '',
      material: product.material || '',
      description: product.description || '',
      isBestSeller: Boolean(product.isBestSeller),
      featured: Boolean(product.featured)
    });
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setActiveTab('manage');
  };

  // Delete product
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      if (isSupabaseConfigured) {
        await deleteProduct(id);
      }
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast(`"${name}" deleted successfully.`);
    } catch (err) {
      console.error('Delete failed:', err);
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  // Submit product (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter a product name', 'error');
      return;
    }
    if (!formData.price) {
      showToast('Please enter a price', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      price: Number(formData.price),
      original_price: formData.original_price ? Number(formData.original_price) : undefined,
      color: formData.color === '-- No Color --' ? null : formData.color,
      sizes: formData.active_sizes,
      images: formData.images.length > 0 ? formData.images : ['/images/placeholder-jersey.jpg'],
    };

    try {
      if (editingId) {
        if (isSupabaseConfigured) {
          const updated = await updateProduct(editingId, payload);
          setProducts(prev => prev.map(p => p.id === editingId ? updated : p));
        } else {
          setProducts(prev => prev.map(p => p.id === editingId ? { ...payload, id: editingId } : p));
        }
        showToast('Product updated successfully!');
      } else {
        if (isSupabaseConfigured) {
          const created = await createProduct(payload);
          setProducts(prev => [created, ...prev]);
        } else {
          const mockCreated = { ...payload, id: 'demo-' + Date.now() };
          setProducts(prev => [mockCreated, ...prev]);
        }
        showToast('Product added successfully!');
      }

      setFormData(initialFormState);
      setEditingId(null);
      setActiveTab('manage');
    } catch (err) {
      console.error('Save failed:', err);
      showToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Upload Hero Banner image
  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHeroImg(true);
    try {
      if (isSupabaseConfigured) {
        const publicUrl = await uploadBannerImage(file, 'hero');
        setHeroBanner(prev => ({ ...prev, image_url: publicUrl }));
        showToast('Hero banner image uploaded to Supabase Storage!');
      } else {
        const localUrl = URL.createObjectURL(file);
        setHeroBanner(prev => ({ ...prev, image_url: localUrl }));
        showToast('Hero banner image loaded!');
      }
    } catch (err) {
      console.error('Hero upload error:', err);
      showToast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setUploadingHeroImg(false);
    }
  };

  // Save Hero Banner
  const handleSaveHeroBanner = async (e) => {
    e.preventDefault();
    setSavingHero(true);
    try {
      await saveHeroBanner(heroBanner);
      showToast('Hero banner updated and saved successfully!');
    } catch (err) {
      showToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSavingHero(false);
    }
  };

  // Upload Category Cover Image
  const handleCoverImageUpload = async (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCoverIdx(idx);
    const cover = categoryCovers[idx];

    try {
      if (isSupabaseConfigured) {
        const publicUrl = await uploadBannerImage(file, cover.id);
        setCategoryCovers(prev => {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], image_url: publicUrl };
          return updated;
        });
        showToast(`${cover.name} cover image uploaded to Supabase Storage!`);
      } else {
        const localUrl = URL.createObjectURL(file);
        setCategoryCovers(prev => {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], image_url: localUrl };
          return updated;
        });
        showToast(`${cover.name} cover image updated!`);
      }
    } catch (err) {
      console.error('Cover upload error:', err);
      showToast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setUploadingCoverIdx(null);
    }
  };

  // Save Category Covers
  const handleSaveCategoryCovers = async () => {
    setSavingCovers(true);
    try {
      await saveCategoryCovers(categoryCovers);
      showToast('All category covers updated and saved successfully!');
    } catch (err) {
      showToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSavingCovers(false);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.player?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || p.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: '2rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Top Navigation & Status Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #27272a' }}>
          <div>
            <Link 
              href="/" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: '#a1a1aa', textTransform: 'uppercase', textDecoration: 'none', marginBottom: '0.75rem' }}
            >
              <ArrowLeft size={14} /> Back to Store
            </Link>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, color: '#ffffff' }}>
              Admin Dashboard
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 1rem', 
              borderRadius: '9999px', 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              backgroundColor: isSupabaseConfigured ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
              border: `1px solid ${isSupabaseConfigured ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
              color: isSupabaseConfigured ? '#4ade80' : '#facc15'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isSupabaseConfigured ? '#22c55e' : '#eab308' }} />
              {isSupabaseConfigured ? 'Supabase Live' : 'Demo / Mock Mode'}
            </div>

            <button 
              onClick={loadData} 
              title="Refresh all data"
              style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div style={{ 
            position: 'fixed', 
            top: '20px', 
            right: '20px', 
            zIndex: 9999, 
            backgroundColor: notification.type === 'error' ? '#dc2626' : '#18181b', 
            color: '#fff', 
            padding: '1rem 1.5rem', 
            borderRadius: '6px', 
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.875rem'
          }}>
            {notification.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} color="#22c55e" />}
            {notification.message}
          </div>
        )}

        {/* Dashboard Tabs Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid #27272a', marginBottom: '2rem', overflowX: 'auto' }}>
          <button
            onClick={() => { setActiveTab('manage'); setEditingId(null); }}
            style={{
              padding: '1rem 1.5rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: activeTab === 'manage' ? '#ffffff' : '#71717a',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'manage' ? '2px solid #ffffff' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
              whiteSpace: 'nowrap'
            }}
          >
            Manage Inventory ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('add')}
            style={{
              padding: '1rem 1.5rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: activeTab === 'add' ? '#ffffff' : '#71717a',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'add' ? '2px solid #ffffff' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
              whiteSpace: 'nowrap'
            }}
          >
            {editingId ? 'Edit Product' : 'Add New Product'}
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            style={{
              padding: '1rem 1.5rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: activeTab === 'banners' ? '#ffffff' : '#71717a',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'banners' ? '2px solid #ffffff' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
              whiteSpace: 'nowrap'
            }}
          >
            Home Banners & Covers
          </button>
        </div>

        {/* TAB 1: MANAGE INVENTORY */}
        {activeTab === 'manage' && (
          <div>
            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '420px' }}>
                <Search size={16} color="#71717a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search products by title, player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    padding: '0.65rem 1rem 0.65rem 2.25rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {['ALL', ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    style={{
                      padding: '0.45rem 0.9rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor: filterCategory === cat ? '#ffffff' : '#27272a',
                      backgroundColor: filterCategory === cat ? '#ffffff' : '#18181b',
                      color: filterCategory === cat ? '#000000' : '#a1a1aa',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Product Cards Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#71717a' }}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '0.5rem', letterSpacing: '0.1em' }}>LOADING INVENTORY...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed #27272a', borderRadius: '8px' }}>
                <Package size={36} color="#71717a" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: '#a1a1aa', fontWeight: 600, fontSize: '0.95rem' }}>Database is empty (0 products found).</p>
                <p style={{ color: '#71717a', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Use the "Add New Product" tab above to start adding official kits!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {filteredProducts.map((p) => {
                  const displayImage = p.images && p.images[0] ? p.images[0] : '/images/placeholder-jersey.jpg';
                  return (
                    <div 
                      key={p.id}
                      style={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ display: 'flex', padding: '1rem', gap: '1rem', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ width: '64px', height: '80px', backgroundColor: '#000', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                          <img 
                            src={displayImage} 
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 
                            title={p.name}
                            style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: '#fff', margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {p.name}
                          </h3>
                          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {p.category}
                          </div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 800, marginTop: '0.25rem', color: '#e5ff00' }}>
                            Rs. {p.price}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', borderTop: '1px solid #27272a' }}>
                        <button
                          onClick={() => handleEdit(p)}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            background: 'none',
                            border: 'none',
                            borderRight: '1px solid #27272a',
                            color: '#e4e4e7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>

                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            background: 'none',
                            border: 'none',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADD NEW / EDIT PRODUCT FORM */}
        {activeTab === 'add' && (
          <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '10px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #27272a' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, color: '#ffffff' }}>
                {editingId ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{ background: 'none', border: '1px solid #3f3f46', color: '#a1a1aa', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              
              {/* Product Images Upload Box */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.75rem' }}>
                  Product Images
                </label>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  {/* Upload Trigger Square */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100px',
                      height: '110px',
                      border: '1px dashed #3f3f46',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                      backgroundColor: '#18181b',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <Plus size={20} color="#a1a1aa" />
                    <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600 }}>
                      {uploadingImage ? 'Uploading...' : 'Upload'}
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />

                  {/* Uploaded Images Preview List */}
                  {formData.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        width: '100px',
                        height: '110px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#000',
                        border: '1px solid #27272a'
                      }}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Product ${idx}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Name */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MBAPPE | FRANCE WC 26 HOME"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    backgroundColor: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Price Fields Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                    Current Price (Rs)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="499"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{
                      width: '100%',
                      backgroundColor: '#09090b',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                    Original Price (Rs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="899"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    style={{
                      width: '100%',
                      backgroundColor: '#09090b',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Category, Badge, Color Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      backgroundColor: '#09090b',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                    Badge (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SAVE 28%"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    style={{
                      width: '100%',
                      backgroundColor: '#09090b',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                    Color (For AI Stylist)
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{
                      width: '100%',
                      backgroundColor: '#09090b',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {COLOR_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Inventory Stock & Availability Row */}
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.75rem' }}>
                  Inventory Stock & Availability
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  {SIZES.map((size) => {
                    const isChecked = formData.active_sizes.includes(size);
                    const qty = formData.stock_per_size[size] ?? 5;

                    return (
                      <div
                        key={size}
                        style={{
                          backgroundColor: '#09090b',
                          border: '1px solid #27272a',
                          borderRadius: '6px',
                          padding: '0.6rem 0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem'
                        }}
                      >
                        <input
                          type="checkbox"
                          id={`size-${size}`}
                          checked={isChecked}
                          onChange={() => handleSizeToggle(size)}
                          style={{ cursor: 'pointer', accentColor: '#ffffff', width: '16px', height: '16px' }}
                        />
                        <label 
                          htmlFor={`size-${size}`}
                          style={{ fontSize: '0.8125rem', fontWeight: 700, color: isChecked ? '#fff' : '#71717a', cursor: 'pointer', minWidth: '24px' }}
                        >
                          {size}
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: 'auto' }}>
                          <span style={{ fontSize: '0.75rem', color: '#71717a' }}>Qty</span>
                          <input
                            type="number"
                            min="0"
                            disabled={!isChecked}
                            value={isChecked ? qty : 0}
                            onChange={(e) => handleStockChange(size, e.target.value)}
                            style={{
                              width: '44px',
                              backgroundColor: isChecked ? '#18181b' : '#09090b',
                              border: '1px solid #27272a',
                              borderRadius: '4px',
                              padding: '2px 4px',
                              color: isChecked ? '#fff' : '#52525b',
                              fontSize: '0.75rem',
                              textAlign: 'center',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Extra Optional Meta Fields Accordion */}
              <details style={{ marginBottom: '2.5rem', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '1rem' }}>
                <summary style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', color: '#a1a1aa' }}>
                  + Additional Details (Player, Team, Material & Story)
                </summary>

                <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Player Name</label>
                    <input
                      type="text"
                      placeholder="e.g. MBAPPE"
                      value={formData.player}
                      onChange={(e) => setFormData({ ...formData, player: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.5rem', color: '#fff', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Team / Club</label>
                    <input
                      type="text"
                      placeholder="e.g. FRANCE"
                      value={formData.team}
                      onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.5rem', color: '#fff', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Edition</label>
                    <input
                      type="text"
                      placeholder="e.g. WORLD CUP 2026 HOME"
                      value={formData.edition}
                      onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.5rem', color: '#fff', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Material</label>
                    <input
                      type="text"
                      placeholder="e.g. DOTKNIT AERO-COOL"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.5rem', color: '#fff', fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Product details, fabric technology, fit advice..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.5rem', color: '#fff', fontSize: '0.8125rem', resize: 'vertical' }}
                  />
                </div>
              </details>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '0',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  transition: 'background-color 0.2s',
                  boxShadow: '0 4px 14px rgba(255, 255, 255, 0.15)'
                }}
              >
                {submitting ? 'SAVING PRODUCT...' : (editingId ? 'UPDATE PRODUCT' : 'ADD PRODUCT')}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: HOME BANNERS & CATEGORY COVERS */}
        {activeTab === 'banners' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Section 1: Hero Banner */}
            <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '10px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #27272a' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, color: '#ffffff' }}>
                    Main Home Page Banner (Hero)
                  </h2>
                  <p style={{ color: '#a1a1aa', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                    Update the full-bleed campaign image and editorial headline displayed at the top of your homepage.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveHeroBanner}>
                {/* Hero Banner Preview & Upload */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                      Current Banner Image
                    </label>
                    
                    <div style={{ 
                      position: 'relative', 
                      width: '100%', 
                      height: '240px', 
                      backgroundColor: '#000', 
                      border: '1px solid #27272a', 
                      borderRadius: '8px', 
                      overflow: 'hidden' 
                    }}>
                      <img 
                        src={heroBanner.image_url || '/images/hero.jpg'} 
                        alt="Hero Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => heroFileInputRef.current?.click()}
                        disabled={uploadingHeroImg}
                        style={{
                          backgroundColor: '#18181b',
                          border: '1px solid #3f3f46',
                          color: '#fff',
                          padding: '0.6rem 1.25rem',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Upload size={14} />
                        {uploadingHeroImg ? 'Uploading to Supabase...' : 'Upload New Hero Photo'}
                      </button>

                      <input
                        ref={heroFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleHeroImageUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.4rem' }}>
                        Image Direct URL (or CDN link)
                      </label>
                      <input
                        type="text"
                        value={heroBanner.image_url}
                        onChange={(e) => setHeroBanner({ ...heroBanner, image_url: e.target.value })}
                        style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.4rem' }}>
                          Brand Tag
                        </label>
                        <input
                          type="text"
                          value={heroBanner.brand_tag}
                          onChange={(e) => setHeroBanner({ ...heroBanner, brand_tag: e.target.value })}
                          style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.8125rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.4rem' }}>
                          Season Tag
                        </label>
                        <input
                          type="text"
                          value={heroBanner.season_tag}
                          onChange={(e) => setHeroBanner({ ...heroBanner, season_tag: e.target.value })}
                          style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.8125rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.4rem' }}>
                        Hero Headline Title (Use enter for line breaks)
                      </label>
                      <textarea
                        rows={3}
                        value={heroBanner.title}
                        onChange={(e) => setHeroBanner({ ...heroBanner, title: e.target.value })}
                        style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.8125rem', fontFamily: 'inherit' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.4rem' }}>
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={heroBanner.subtitle}
                        onChange={(e) => setHeroBanner({ ...heroBanner, subtitle: e.target.value })}
                        style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.4rem' }}>
                          Primary Button Text & Link
                        </label>
                        <input
                          type="text"
                          placeholder="EXPLORE NOW"
                          value={heroBanner.explore_text}
                          onChange={(e) => setHeroBanner({ ...heroBanner, explore_text: e.target.value })}
                          style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.5rem 0.85rem', color: '#fff', fontSize: '0.8125rem', marginBottom: '0.4rem' }}
                        />
                        <input
                          type="text"
                          placeholder="/collections/half-sleeves"
                          value={heroBanner.explore_link}
                          onChange={(e) => setHeroBanner({ ...heroBanner, explore_link: e.target.value })}
                          style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.5rem 0.85rem', color: '#fff', fontSize: '0.8125rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.4rem' }}>
                          Secondary Button Text & Link
                        </label>
                        <input
                          type="text"
                          placeholder="SHOP JERSEYS"
                          value={heroBanner.shop_text}
                          onChange={(e) => setHeroBanner({ ...heroBanner, shop_text: e.target.value })}
                          style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.5rem 0.85rem', color: '#fff', fontSize: '0.8125rem', marginBottom: '0.4rem' }}
                        />
                        <input
                          type="text"
                          placeholder="/collections/full-sleeves"
                          value={heroBanner.shop_link}
                          onChange={(e) => setHeroBanner({ ...heroBanner, shop_link: e.target.value })}
                          style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.5rem 0.85rem', color: '#fff', fontSize: '0.8125rem' }}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingHero}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    padding: '0.85rem 2rem',
                    fontSize: '0.8125rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: savingHero ? 'not-allowed' : 'pointer'
                  }}
                >
                  {savingHero ? 'Saving Hero Banner...' : 'Save Hero Banner'}
                </button>
              </form>
            </div>

            {/* Section 2: Category Cover Images */}
            <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '10px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #27272a' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, color: '#ffffff' }}>
                    Category Cover Images (Full Sleeves, Half Sleeves, Oversized, T-Shirts)
                  </h2>
                  <p style={{ color: '#a1a1aa', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                    Change the tall editorial thumbnail cover image for each category tile on your homepage.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {categoryCovers.map((cover, idx) => (
                  <div
                    key={cover.id}
                    style={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff' }}>
                        {cover.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                        Tile #{idx + 1}
                      </span>
                    </div>

                    {/* Image Preview Container */}
                    <div style={{ 
                      width: '100%', 
                      height: '240px', 
                      backgroundColor: '#000', 
                      borderRadius: '6px', 
                      overflow: 'hidden', 
                      border: '1px solid #27272a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img 
                        src={cover.image_url} 
                        alt={cover.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => coverFileInputRefs.current[idx]?.click()}
                        disabled={uploadingCoverIdx === idx}
                        style={{
                          flex: 1,
                          backgroundColor: '#27272a',
                          border: '1px solid #3f3f46',
                          color: '#fff',
                          padding: '0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <Upload size={12} />
                        {uploadingCoverIdx === idx ? 'Uploading...' : 'Upload Cover'}
                      </button>

                      <input
                        ref={(el) => (coverFileInputRefs.current[idx] = el)}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCoverImageUpload(idx, e)}
                        style={{ display: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={cover.image_url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCategoryCovers(prev => {
                            const updated = [...prev];
                            updated[idx] = { ...updated[idx], image_url: val };
                            return updated;
                          });
                        }}
                        style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.75rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>
                        Description
                      </label>
                      <input
                        type="text"
                        value={cover.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCategoryCovers(prev => {
                            const updated = [...prev];
                            updated[idx] = { ...updated[idx], description: val };
                            return updated;
                          });
                        }}
                        style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.75rem' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveCategoryCovers}
                disabled={savingCovers}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  padding: '0.85rem 2rem',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: savingCovers ? 'not-allowed' : 'pointer'
                }}
              >
                {savingCovers ? 'Saving Category Covers...' : 'Save All Category Covers'}
              </button>
            </div>

            {/* SQL Table Info Accordion */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Database size={16} color="#e5ff00" />
                <strong style={{ fontSize: '0.875rem', color: '#fff' }}>Supabase Banners Table Setup (Optional SQL)</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#a1a1aa', margin: '0 0 0.75rem 0' }}>
                To save banners across all devices directly in your PostgreSQL database, run this quick snippet in your Supabase SQL Editor:
              </p>
              <pre style={{ backgroundColor: '#09090b', padding: '1rem', borderRadius: '6px', fontSize: '0.75rem', color: '#e5ff00', overflowX: 'auto', border: '1px solid #27272a' }}>
{`CREATE TABLE IF NOT EXISTS public.site_banners (
  id TEXT PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  tagline TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  description TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read site_banners" ON public.site_banners FOR SELECT USING (true);
CREATE POLICY "Allow anon insert site_banners" ON public.site_banners FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update site_banners" ON public.site_banners FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete site_banners" ON public.site_banners FOR DELETE USING (true);`}
              </pre>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
