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
  Copy,
  Users,
  Building2,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Tag,
  Palette
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
  DEFAULT_CATEGORY_COVERS,
  getCategories,
  createCategory,
  deleteCategory,
  DEFAULT_CATEGORIES,
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  DEFAULT_VENDORS
} from '../../lib/supabase';
import { PRODUCTS as LOCAL_PRODUCTS } from '../../data/products';

const SIZES = ['S', 'M', 'L', 'XL', '2XL'];

const COLOR_PRESETS = [
  'White',
  'Black',
  'Blue',
  'Red',
  'Navy',
  'Green',
  'Yellow',
  'Gold',
  'Silver',
  'Orange',
  'Pink',
  'Purple',
  'Turquoise',
  'Maroon',
  'Albiceleste',
  'Crimson'
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'add' | 'vendors' | 'categories' | 'banners'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [vendors, setVendors] = useState(DEFAULT_VENDORS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterVendor, setFilterVendor] = useState('ALL');
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Selected Vendor profile view state
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [submittingVendor, setSubmittingVendor] = useState(false);

  // Category Form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [submittingCat, setSubmittingCat] = useState(false);

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
    category: 'HALF SLEEVES',
    badge: '',
    primaryColor: 'Blue',
    secondaryColor: 'White',
    stock_per_size: { S: 5, M: 5, L: 5, XL: 5, '2XL': 5 },
    active_sizes: ['S', 'M', 'L', 'XL', '2XL'],
    images: [],
    player: '',
    team: '',
    country: '',
    edition: '',
    material: 'DOTKNIT AERO-COOL',
    description: '',
    isBestSeller: false,
    featured: false,
    vendorId: '',
    vendorPrice: '',
    minStockAlert: 5
  };

  const [formData, setFormData] = useState(initialFormState);
  const fileInputRef = useRef(null);

  // Load all products, categories, vendors & site banners
  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData, vendsData, heroData, coversData] = await Promise.all([
        getProducts(),
        getCategories(),
        getVendors(),
        getHeroBanner(),
        getCategoryCovers()
      ]);

      setProducts(prodsData || []);
      if (catsData && catsData.length > 0) setCategories(catsData);
      if (vendsData && vendsData.length > 0) {
        setVendors(vendsData);
        if (!selectedVendorId) setSelectedVendorId(vendsData[0].id);
      }
      if (heroData) setHeroBanner(heroData);
      if (coversData) setCategoryCovers(coversData);
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
      category: product.category || 'HALF SLEEVES',
      badge: product.badge || '',
      primaryColor: product.primaryColor || (product.color ? product.color.split('/')[0]?.trim() : ''),
      secondaryColor: product.secondaryColor || (product.color && product.color.includes('/') ? product.color.split('/')[1]?.trim() : ''),
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
      featured: Boolean(product.featured),
      vendorId: product.vendorId || '',
      vendorPrice: product.vendorPrice !== undefined && product.vendorPrice !== null ? product.vendorPrice : '',
      minStockAlert: product.minStockAlert !== undefined && product.minStockAlert !== null ? product.minStockAlert : 5
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
      sizes: formData.active_sizes,
      images: formData.images.length > 0 ? formData.images : ['/images/placeholder-jersey.jpg'],
      vendorPrice: formData.vendorPrice !== '' ? Number(formData.vendorPrice) : undefined,
      minStockAlert: formData.minStockAlert !== '' ? Number(formData.minStockAlert) : 5,
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

  // Category creation
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSubmittingCat(true);
    try {
      const created = await createCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim() || undefined
      });
      setCategories(prev => [...prev.filter(c => c.name !== created.name), created]);
      setNewCatName('');
      setNewCatDesc('');
      showToast(`Category "${created.name}" created!`);
    } catch (err) {
      console.error('Failed to create category:', err);
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Existing jerseys in this category will keep their name.`)) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast(`Category "${name}" removed.`);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Vendor creation & editing
  const handleOpenVendorModal = (vendorToEdit = null) => {
    if (vendorToEdit) {
      setEditingVendor(vendorToEdit);
      setVendorForm({
        name: vendorToEdit.name,
        contact_person: vendorToEdit.contact_person || '',
        phone: vendorToEdit.phone || '',
        email: vendorToEdit.email || '',
        notes: vendorToEdit.notes || ''
      });
    } else {
      setEditingVendor(null);
      setVendorForm({ name: '', contact_person: '', phone: '', email: '', notes: '' });
    }
    setShowVendorModal(true);
  };

  const handleSaveVendor = async (e) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) {
      showToast('Vendor name is required', 'error');
      return;
    }

    setSubmittingVendor(true);
    try {
      if (editingVendor) {
        const updated = await updateVendor(editingVendor.id, vendorForm);
        setVendors(prev => prev.map(v => v.id === editingVendor.id ? { ...v, ...updated } : v));
        showToast(`Vendor "${vendorForm.name}" updated!`);
      } else {
        const created = await createVendor(vendorForm);
        setVendors(prev => [...prev, created]);
        setSelectedVendorId(created.id);
        showToast(`Vendor "${vendorForm.name}" profile created!`);
      }
      setShowVendorModal(false);
      setEditingVendor(null);
    } catch (err) {
      console.error('Vendor save failed:', err);
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSubmittingVendor(false);
    }
  };

  const handleDeleteVendor = async (id, name) => {
    if (!window.confirm(`Delete vendor profile "${name}"? Products linked to this vendor will remain unassigned.`)) return;
    try {
      await deleteVendor(id);
      const remaining = vendors.filter(v => v.id !== id);
      setVendors(remaining);
      if (selectedVendorId === id) {
        setSelectedVendorId(remaining[0]?.id || null);
      }
      showToast(`Vendor "${name}" deleted.`);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
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

  // Helper: compute total stock for a product
  const getProductTotalStock = (p) => {
    if (!p.stock_per_size) return 0;
    return Object.values(p.stock_per_size).reduce((sum, val) => sum + (Number(val) || 0), 0);
  };

  // Filtered products list for inventory
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.player?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || p.category === filterCategory;
    const matchesVendor = filterVendor === 'ALL' || p.vendorId === filterVendor;
    return matchesSearch && matchesCat && matchesVendor;
  });

  // Selected vendor details & inventory analytics
  const currentVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];
  const vendorProducts = products.filter(p => p.vendorId === currentVendor?.id);
  const vendorTotalStock = vendorProducts.reduce((sum, p) => sum + getProductTotalStock(p), 0);
  const vendorTotalCost = vendorProducts.reduce((sum, p) => {
    const stock = getProductTotalStock(p);
    const cost = p.vendorPrice || 0;
    return sum + (stock * cost);
  }, 0);
  const vendorLowStockCount = vendorProducts.filter(p => {
    const total = getProductTotalStock(p);
    const threshold = p.minStockAlert !== undefined ? p.minStockAlert : 5;
    return total <= threshold;
  }).length;

  return (
    <div suppressHydrationWarning style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: '2rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
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
        <div style={{ display: 'flex', borderBottom: '1px solid #27272a', marginBottom: '2rem', overflowX: 'auto', gap: '0.5rem' }}>
          <button
            onClick={() => { setActiveTab('manage'); setEditingId(null); }}
            style={{
              padding: '1rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.8125rem',
              letterSpacing: '0.1em',
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
            Inventory ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('add')}
            style={{
              padding: '1rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.8125rem',
              letterSpacing: '0.1em',
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
            {editingId ? 'Edit Jersey' : '+ Add Jersey'}
          </button>

          <button
            onClick={() => setActiveTab('vendors')}
            style={{
              padding: '1rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.8125rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: activeTab === 'vendors' ? '#ffffff' : '#71717a',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'vendors' ? '2px solid #ffffff' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
              whiteSpace: 'nowrap'
            }}
          >
            Vendors & Stock ({vendors.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            style={{
              padding: '1rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.8125rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: activeTab === 'categories' ? '#ffffff' : '#71717a',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'categories' ? '2px solid #ffffff' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
              whiteSpace: 'nowrap'
            }}
          >
            Categories ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            style={{
              padding: '1rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.8125rem',
              letterSpacing: '0.1em',
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

        {/* ========================================================= */}
        {/* TAB 1: MANAGE INVENTORY */}
        {/* ========================================================= */}
        {activeTab === 'manage' && (
          <div>
            {/* Filter Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', backgroundColor: '#18181b', padding: '1rem', borderRadius: '8px', border: '1px solid #27272a' }}>
              <div style={{ position: 'relative', flex: '1 1 260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                <input
                  type="text"
                  placeholder="Search by jersey, player, club..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff', padding: '0.625rem 1rem', borderRadius: '6px', fontSize: '0.8125rem', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="ALL">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={filterVendor}
                  onChange={(e) => setFilterVendor(e.target.value)}
                  style={{ backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff', padding: '0.625rem 1rem', borderRadius: '6px', fontSize: '0.8125rem', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="ALL">All Vendors</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>

                <button
                  onClick={() => { setActiveTab('add'); setEditingId(null); setFormData(initialFormState); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff', color: '#000', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  <Plus size={16} /> Add Jersey
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#71717a' }}>Loading inventory...</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a' }}>
                <Package size={48} style={{ margin: '0 auto 1rem', color: '#52525b' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.5rem', color: '#fff' }}>No Jerseys Found</h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '1.5rem' }}>No inventory matches your current search or filters.</p>
                <button
                  onClick={() => { setSearchQuery(''); setFilterCategory('ALL'); setFilterVendor('ALL'); }}
                  style={{ background: '#27272a', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {filteredProducts.map((product) => {
                  const totalStock = getProductTotalStock(product);
                  const minAlert = product.minStockAlert !== undefined ? product.minStockAlert : 5;
                  const isLowStock = totalStock <= minAlert;
                  const vendor = vendors.find(v => v.id === product.vendorId);

                  return (
                    <div 
                      key={product.id}
                      style={{ 
                        backgroundColor: '#18181b', 
                        border: isLowStock ? '1px solid #eab308' : '1px solid #27272a', 
                        borderRadius: '8px', 
                        overflow: 'hidden', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.15s ease, border-color 0.15s ease'
                      }}
                    >
                      {/* Product Thumbnail */}
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#09090b', overflow: 'hidden' }}>
                        <img 
                          src={product.images?.[0] || '/images/placeholder-jersey.jpg'} 
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        
                        {/* Status Badges */}
                        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {product.isBestSeller && (
                            <span style={{ backgroundColor: '#fff', color: '#000', fontSize: '0.625rem', fontWeight: 800, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              BEST SELLER
                            </span>
                          )}
                          {product.badge && (
                            <span style={{ backgroundColor: '#000', color: '#fff', fontSize: '0.625rem', fontWeight: 700, padding: '2px 6px', textTransform: 'uppercase', border: '1px solid #3f3f46' }}>
                              {product.badge}
                            </span>
                          )}
                        </div>

                        {/* Low stock pill */}
                        {isLowStock && (
                          <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(234, 179, 8, 0.9)', color: '#000', fontSize: '0.6875rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} /> LOW STOCK ({totalStock} left / min {minAlert})
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', color: '#a1a1aa', textTransform: 'uppercase' }}>
                            {product.category}
                          </span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#fff' }}>
                            ₹{product.price}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.5rem', color: '#fff', lineHeight: 1.3 }}>
                          {product.name}
                        </h4>

                        {/* Colors & Vendor tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.6875rem' }}>
                          {(product.primaryColor || product.secondaryColor) && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#d4d4d8', backgroundColor: '#27272a', padding: '2px 6px', borderRadius: '4px' }}>
                              <Palette size={10} />
                              {product.primaryColor}
                              {product.secondaryColor ? ` / ${product.secondaryColor}` : ''}
                            </span>
                          )}

                          {vendor && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#93c5fd', backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                              <Building2 size={10} />
                              {vendor.name}
                            </span>
                          )}
                        </div>

                        {/* Stock breakdown */}
                        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #27272a', fontSize: '0.6875rem', color: '#a1a1aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Total Stock: <strong style={{ color: isLowStock ? '#eab308' : '#fff' }}>{totalStock}</strong></span>
                          {product.vendorPrice && (
                            <span>Cost: ₹{product.vendorPrice}</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <button
                            onClick={() => handleEdit(product)}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', backgroundColor: '#27272a', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#27272a', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ADD / EDIT JERSEY */}
        {/* ========================================================= */}
        {activeTab === 'add' && (
          <div style={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '1px solid #27272a', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, color: '#fff' }}>
                  {editingId ? 'Edit Jersey' : 'Add New Jersey'}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#a1a1aa', margin: '0.25rem 0 0' }}>
                  Fill in jersey details, pricing, supplier info, and upload photos.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{ background: 'none', border: '1px solid #3f3f46', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Product Name */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                  Jersey Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MBAPPE | FRANCE WC 26 HOME"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              {/* Pricing Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="499"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                    Original / MRP Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="899"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SAVE 45% or HOT"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Category Selection (Custom + Core, NO Best Seller) */}
              <div style={{ marginBottom: '1.75rem', backgroundColor: '#09090b', padding: '1.25rem', borderRadius: '8px', border: '1px solid #27272a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8' }}>
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('categories')}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    + Manage Categories
                  </button>
                </div>

                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}
                >
                  {categories.map(cat => (
                    <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.35rem', display: 'block' }}>
                  * Best Seller is controlled independently via the checkbox below.
                </span>
              </div>

              {/* TWO COLOR OPTIONS: PRIMARY & SECONDARY */}
              <div style={{ marginBottom: '1.75rem', backgroundColor: '#09090b', padding: '1.25rem', borderRadius: '8px', border: '1px solid #27272a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Palette size={16} color="#fff" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff' }}>
                    Colorway Options (Primary & Secondary)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  {/* Primary Color */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '0.35rem' }}>
                      Primary Color *
                    </label>
                    <input
                      type="text"
                      list="color-presets-list"
                      placeholder="e.g. Blue or White"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.625rem 0.75rem', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                    />
                  </div>

                  {/* Secondary Color */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '0.35rem' }}>
                      Secondary Color (Optional)
                    </label>
                    <input
                      type="text"
                      list="color-presets-list"
                      placeholder="e.g. Gold or Crimson"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.625rem 0.75rem', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Preset Datalist */}
                <datalist id="color-presets-list">
                  {COLOR_PRESETS.map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>

                {/* Color preview chip */}
                {(formData.primaryColor || formData.secondaryColor) && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#d4d4d8' }}>
                    <span>Selected Palette:</span>
                    <span style={{ backgroundColor: '#27272a', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {formData.primaryColor || 'None'} 
                      {formData.secondaryColor ? ` / ${formData.secondaryColor}` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* VENDOR & INVENTORY PURCHASING SECTION */}
              <div style={{ marginBottom: '1.75rem', backgroundColor: '#09090b', padding: '1.25rem', borderRadius: '8px', border: '1px solid #27272a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={16} color="#60a5fa" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff' }}>
                      Vendor & Supplier Procurement
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenVendorModal()}
                    style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    + Add New Vendor
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  {/* Select Vendor */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '0.35rem' }}>
                      Assigned Vendor
                    </label>
                    <select
                      value={formData.vendorId}
                      onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.625rem 0.75rem', color: '#fff', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="">-- No Vendor Assigned --</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Vendor Giving Price */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '0.35rem' }}>
                      Vendor Purchase Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 250"
                      value={formData.vendorPrice}
                      onChange={(e) => setFormData({ ...formData, vendorPrice: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.625rem 0.75rem', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                    />
                  </div>

                  {/* Min Stock Alert Count */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '0.35rem' }}>
                      Min Stock Reorder Alert Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="5"
                      value={formData.minStockAlert}
                      onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.625rem 0.75rem', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Profit Margin Preview if prices provided */}
                {formData.price && formData.vendorPrice && (
                  <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: '#18181b', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', gap: '1rem', color: '#a1a1aa' }}>
                    <span>Estimated Profit: <strong style={{ color: '#4ade80' }}>₹{Number(formData.price) - Number(formData.vendorPrice)}</strong></span>
                    <span>Margin: <strong style={{ color: '#4ade80' }}>{Math.round(((Number(formData.price) - Number(formData.vendorPrice)) / Number(formData.price)) * 100)}%</strong></span>
                  </div>
                )}
              </div>

              {/* PROMINENT CHECKBOXES: BEST SELLER & FEATURED */}
              <div style={{ marginBottom: '1.75rem', backgroundColor: '#09090b', padding: '1.25rem', borderRadius: '8px', border: '1px solid #27272a' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', marginBottom: '0.75rem' }}>
                  Visibility & Merchandising Flags
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                      style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: '#ffffff' }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.875rem', color: '#fff' }}>
                        Mark as Best Seller
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                        Display in the "Best Sellers" curated section on the homepage.
                      </span>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: '#ffffff' }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.875rem', color: '#fff' }}>
                        Featured in Fresh Kits
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                        Display in the "Fresh Kits" horizontal carousel on the homepage.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Inventory Stock by Sizes */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.75rem' }}>
                  Available Sizes & Stock Quantity per Size
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {SIZES.map(size => {
                    const isChecked = formData.active_sizes.includes(size);
                    const qty = formData.stock_per_size[size] ?? 0;

                    return (
                      <div
                        key={size}
                        style={{
                          backgroundColor: isChecked ? '#27272a' : '#09090b',
                          border: isChecked ? '1px solid #52525b' : '1px solid #27272a',
                          borderRadius: '6px',
                          padding: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <input
                          type="checkbox"
                          id={`size-${size}`}
                          checked={isChecked}
                          onChange={() => handleSizeToggle(size)}
                          style={{ cursor: 'pointer', accentColor: '#fff' }}
                        />
                        <label htmlFor={`size-${size}`} style={{ fontSize: '0.875rem', fontWeight: 700, color: isChecked ? '#fff' : '#71717a', cursor: 'pointer' }}>
                          {size}
                        </label>

                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.6875rem', color: '#71717a' }}>Qty</span>
                          <input
                            type="number"
                            min="0"
                            disabled={!isChecked}
                            value={isChecked ? qty : 0}
                            onChange={(e) => handleStockChange(size, e.target.value)}
                            style={{ width: '44px', padding: '3px', backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', textAlign: 'center' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Image Upload to Supabase Storage */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                  Jersey Images (Supabase Storage)
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  {formData.images.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', aspectRatio: '1/1', backgroundColor: '#09090b', borderRadius: '6px', overflow: 'hidden', border: '1px solid #27272a' }}>
                      <img src={url} alt={`img-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#ef4444', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ aspectRatio: '1/1', backgroundColor: '#09090b', border: '2px dashed #27272a', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', cursor: uploadingImage ? 'not-allowed' : 'pointer', color: '#a1a1aa' }}
                  >
                    <Upload size={18} />
                    <span style={{ fontSize: '0.6875rem' }}>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>

              {/* Extra Details Accordion */}
              <details style={{ marginBottom: '2rem', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '1rem' }}>
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Editorial Description</label>
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
                {submitting ? 'SAVING JERSEY...' : (editingId ? 'UPDATE JERSEY' : 'ADD JERSEY TO INVENTORY')}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: VENDORS PROFILE & PROCUREMENT ANALYTICS */}
        {/* ========================================================= */}
        {activeTab === 'vendors' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, color: '#fff' }}>
                  Vendor Profiles & Inventory Tracking
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#a1a1aa', margin: '0.25rem 0 0' }}>
                  Track supplier profiles, cost prices, supplied jersey counts, and minimum stock alerts.
                </p>
              </div>

              <button
                onClick={() => handleOpenVendorModal()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff', color: '#000', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                <Plus size={16} /> Add Vendor Profile
              </button>
            </div>

            {vendors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a' }}>
                <Building2 size={48} style={{ margin: '0 auto 1rem', color: '#52525b' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.5rem', color: '#fff' }}>No Vendors Registered</h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Create vendor profiles to link with jersey purchases and track stock alerts.</p>
                <button
                  onClick={() => handleOpenVendorModal()}
                  style={{ backgroundColor: '#fff', color: '#000', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Create First Vendor
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: '2rem' }}>
                {/* Vendors Sidebar List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {vendors.map(v => {
                    const isSelected = v.id === currentVendor?.id;
                    const count = products.filter(p => p.vendorId === v.id).length;
                    const lowCount = products.filter(p => {
                      if (p.vendorId !== v.id) return false;
                      const stock = getProductTotalStock(p);
                      const alert = p.minStockAlert !== undefined ? p.minStockAlert : 5;
                      return stock <= alert;
                    }).length;

                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVendorId(v.id)}
                        style={{
                          backgroundColor: isSelected ? '#27272a' : '#18181b',
                          border: isSelected ? '1px solid #ffffff' : '1px solid #27272a',
                          borderRadius: '8px',
                          padding: '1.25rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#fff' }}>
                            {v.name}
                          </h4>
                          {lowCount > 0 && (
                            <span style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#facc15', fontSize: '0.625rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                              {lowCount} LOW
                            </span>
                          )}
                        </div>

                        {v.contact_person && (
                          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                            Contact: {v.contact_person}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#71717a', borderTop: '1px solid #27272a', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                          <span>{count} Products</span>
                          {v.phone && <span>{v.phone}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Vendor Detail & Stock Analytics */}
                {currentVendor && (
                  <div style={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '1.75rem' }}>
                    {/* Vendor Header */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #27272a' }}>
                      <div>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', color: '#60a5fa', textTransform: 'uppercase' }}>
                          Vendor Profile
                        </span>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: '0.25rem 0 0.5rem', color: '#fff' }}>
                          {currentVendor.name}
                        </h3>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.8125rem', color: '#a1a1aa' }}>
                          {currentVendor.contact_person && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Users size={14} /> {currentVendor.contact_person}
                            </span>
                          )}
                          {currentVendor.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Phone size={14} /> {currentVendor.phone}
                            </span>
                          )}
                          {currentVendor.email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Mail size={14} /> {currentVendor.email}
                            </span>
                          )}
                        </div>

                        {currentVendor.notes && (
                          <p style={{ fontSize: '0.8125rem', color: '#71717a', margin: '0.75rem 0 0', fontStyle: 'italic' }}>
                            "{currentVendor.notes}"
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenVendorModal(currentVendor)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#27272a', color: '#fff', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          <Edit3 size={14} /> Edit Profile
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(currentVendor.id, currentVendor.name)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#27272a', color: '#ef4444', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Analytics Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                      <div style={{ backgroundColor: '#09090b', padding: '1rem', borderRadius: '6px', border: '1px solid #27272a' }}>
                        <span style={{ fontSize: '0.6875rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supplied Products</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>{vendorProducts.length}</div>
                      </div>

                      <div style={{ backgroundColor: '#09090b', padding: '1rem', borderRadius: '6px', border: '1px solid #27272a' }}>
                        <span style={{ fontSize: '0.6875rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Units Stock</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>{vendorTotalStock}</div>
                      </div>

                      <div style={{ backgroundColor: '#09090b', padding: '1rem', borderRadius: '6px', border: '1px solid #27272a' }}>
                        <span style={{ fontSize: '0.6875rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Value (Cost)</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ade80', marginTop: '0.25rem' }}>₹{vendorTotalCost}</div>
                      </div>

                      <div style={{ backgroundColor: '#09090b', padding: '1rem', borderRadius: '6px', border: vendorLowStockCount > 0 ? '1px solid #eab308' : '1px solid #27272a' }}>
                        <span style={{ fontSize: '0.6875rem', color: vendorLowStockCount > 0 ? '#facc15' : '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock Alerts</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: vendorLowStockCount > 0 ? '#facc15' : '#fff', marginTop: '0.25rem' }}>{vendorLowStockCount}</div>
                      </div>
                    </div>

                    {/* Products supplied by this vendor table */}
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem', color: '#fff' }}>
                      Jerseys Supplied by {currentVendor.name}
                    </h4>

                    {vendorProducts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: '#09090b', borderRadius: '6px', border: '1px solid #27272a', color: '#71717a', fontSize: '0.8125rem' }}>
                        No jerseys currently linked to this vendor. Assign this vendor when adding or editing jerseys in the product form!
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #27272a', color: '#71717a', textAlign: 'left' }}>
                              <th style={{ padding: '0.75rem 0.5rem' }}>Jersey</th>
                              <th style={{ padding: '0.75rem 0.5rem' }}>Category</th>
                              <th style={{ padding: '0.75rem 0.5rem' }}>Vendor Price</th>
                              <th style={{ padding: '0.75rem 0.5rem' }}>Selling Price</th>
                              <th style={{ padding: '0.75rem 0.5rem' }}>Current Stock</th>
                              <th style={{ padding: '0.75rem 0.5rem' }}>Min Alert</th>
                              <th style={{ padding: '0.75rem 0.5rem' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vendorProducts.map(p => {
                              const stock = getProductTotalStock(p);
                              const minAlert = p.minStockAlert !== undefined ? p.minStockAlert : 5;
                              const isLow = stock <= minAlert;

                              return (
                                <tr key={p.id} style={{ borderBottom: '1px solid #27272a' }}>
                                  <td style={{ padding: '0.75rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <img src={p.images?.[0] || '/images/placeholder-jersey.jpg'} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#09090b' }} />
                                    <div>
                                      <strong style={{ color: '#fff', display: 'block' }}>{p.name}</strong>
                                      <span style={{ fontSize: '0.6875rem', color: '#71717a' }}>
                                        {p.primaryColor}{p.secondaryColor ? ` / ${p.secondaryColor}` : ''}
                                      </span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '0.75rem 0.5rem', color: '#a1a1aa' }}>{p.category}</td>
                                  <td style={{ padding: '0.75rem 0.5rem', color: '#fff' }}>₹{p.vendorPrice || 'N/A'}</td>
                                  <td style={{ padding: '0.75rem 0.5rem', color: '#fff' }}>₹{p.price}</td>
                                  <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <span style={{ color: isLow ? '#facc15' : '#fff', fontWeight: isLow ? 800 : 400 }}>
                                      {stock} units
                                    </span>
                                  </td>
                                  <td style={{ padding: '0.75rem 0.5rem', color: '#a1a1aa' }}>
                                    {minAlert} units
                                  </td>
                                  <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <button
                                      onClick={() => handleEdit(p)}
                                      style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem' }}
                                    >
                                      Edit
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CATEGORIES MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Create Category Form */}
            <div style={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.5rem', color: '#fff' }}>
                Create Custom Category
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#a1a1aa', margin: '0 0 1.5rem' }}>
                Custom categories automatically show up in the category dropdowns and collection routing.
              </p>

              <form onSubmit={handleCreateCategory}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RETRO CLASSICS or TRAINING"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                    style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of this collection..."
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.875rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingCat}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.8125rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: submittingCat ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submittingCat ? 'CREATING...' : 'ADD CATEGORY'}
                </button>
              </form>
            </div>

            {/* Existing Categories List */}
            <div style={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 1.25rem', color: '#fff' }}>
                Active Categories ({categories.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {categories.map(cat => {
                  const isCore = ['FULL SLEEVES', 'HALF SLEEVES', 'OVERSIZED T', 'TSHIRTS'].includes(cat.name);
                  const count = products.filter(p => p.category === cat.name).length;

                  return (
                    <div
                      key={cat.id || cat.name}
                      style={{
                        backgroundColor: '#09090b',
                        border: '1px solid #27272a',
                        borderRadius: '6px',
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.875rem', color: '#fff', textTransform: 'uppercase' }}>
                            {cat.name}
                          </strong>
                          {isCore && (
                            <span style={{ fontSize: '0.625rem', backgroundColor: '#27272a', color: '#a1a1aa', padding: '2px 5px', borderRadius: '3px' }}>
                              Core
                            </span>
                          )}
                        </div>
                        {cat.description && (
                          <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.25rem' }}>
                            {cat.description}
                          </div>
                        )}
                        <span style={{ fontSize: '0.6875rem', color: '#a1a1aa', marginTop: '0.25rem', display: 'block' }}>
                          {count} jerseys in inventory
                        </span>
                      </div>

                      {!isCore && (
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                          title="Delete custom category"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: HOME BANNERS & CATEGORY COVERS */}
        {/* ========================================================= */}
        {activeTab === 'banners' && (
          <div>
            {/* HERO BANNER EDITING */}
            <div style={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '2rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #27272a' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, color: '#fff' }}>
                    Home Hero Banner Settings
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: '#a1a1aa', margin: '0.25rem 0 0' }}>
                    Controls the full-width high-fashion hero photograph and typography on your storefront.
                  </p>
                </div>

                <Link
                  href="/"
                  target="_blank"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#a1a1aa', fontSize: '0.75rem', textDecoration: 'none' }}
                >
                  Preview Storefront <ExternalLink size={12} />
                </Link>
              </div>

              <form onSubmit={handleSaveHeroBanner}>
                {/* Hero Banner Preview & Upload */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#d4d4d8', marginBottom: '0.5rem' }}>
                      Hero Banner Image
                    </label>
                    <div style={{ position: 'relative', width: '100%', height: '240px', backgroundColor: '#09090b', borderRadius: '6px', overflow: 'hidden', border: '1px solid #27272a', marginBottom: '0.75rem' }}>
                      <img
                        src={heroBanner.image_url}
                        alt="Hero Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <input
                      type="file"
                      ref={heroFileInputRef}
                      onChange={handleHeroImageUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        type="button"
                        disabled={uploadingHeroImg}
                        onClick={() => heroFileInputRef.current?.click()}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#27272a', color: '#fff', border: 'none', padding: '0.625rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: uploadingHeroImg ? 'not-allowed' : 'pointer' }}
                      >
                        <Upload size={14} /> {uploadingHeroImg ? 'Uploading...' : 'Upload Image'}
                      </button>

                      <input
                        type="text"
                        placeholder="Or paste image URL"
                        value={heroBanner.image_url}
                        onChange={(e) => setHeroBanner({ ...heroBanner, image_url: e.target.value })}
                        style={{ flex: 2, backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.75rem' }}
                      />
                    </div>
                  </div>

                  {/* Typography Inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Brand Tag</label>
                        <input
                          type="text"
                          value={heroBanner.brand_tag}
                          onChange={(e) => setHeroBanner({ ...heroBanner, brand_tag: e.target.value })}
                          style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.5rem', color: '#fff', fontSize: '0.8125rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Season Tag</label>
                        <input
                          type="text"
                          value={heroBanner.season_tag}
                          onChange={(e) => setHeroBanner({ ...heroBanner, season_tag: e.target.value })}
                          style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.5rem', color: '#fff', fontSize: '0.8125rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Main Title (line breaks supported)</label>
                      <textarea
                        rows={3}
                        value={heroBanner.title}
                        onChange={(e) => setHeroBanner({ ...heroBanner, title: e.target.value })}
                        style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.5rem', color: '#fff', fontSize: '0.8125rem', resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Subtitle</label>
                      <input
                        type="text"
                        value={heroBanner.subtitle}
                        onChange={(e) => setHeroBanner({ ...heroBanner, subtitle: e.target.value })}
                        style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.5rem', color: '#fff', fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingHero}
                  style={{ backgroundColor: '#ffffff', color: '#000000', border: 'none', padding: '0.75rem 2rem', fontWeight: 800, fontSize: '0.8125rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: savingHero ? 'not-allowed' : 'pointer' }}
                >
                  {savingHero ? 'SAVING HERO...' : 'SAVE HERO BANNER'}
                </button>
              </form>
            </div>

            {/* CATEGORY COVER CARDS */}
            <div style={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #27272a' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, color: '#fff' }}>
                    Category Cover Cards
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: '#a1a1aa', margin: '0.25rem 0 0' }}>
                    Change cover images for the 4 core homepage cards (Full Sleeves, Half Sleeves, Oversized T, T-Shirts).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveCategoryCovers}
                  disabled={savingCovers}
                  style={{ backgroundColor: '#ffffff', color: '#000000', border: 'none', padding: '0.625rem 1.25rem', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: savingCovers ? 'not-allowed' : 'pointer' }}
                >
                  {savingCovers ? 'SAVING...' : 'SAVE ALL COVERS'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {categoryCovers.map((cover, idx) => (
                  <div key={cover.id} style={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '1rem' }}>
                    <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#18181b', marginBottom: '0.75rem' }}>
                      <img src={cover.image_url} alt={cover.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <strong style={{ display: 'block', fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', marginBottom: '0.5rem' }}>
                      {cover.name}
                    </strong>

                    <input
                      type="file"
                      ref={el => coverFileInputRefs.current[idx] = el}
                      onChange={(e) => handleCoverImageUpload(idx, e)}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />

                    <button
                      type="button"
                      disabled={uploadingCoverIdx === idx}
                      onClick={() => coverFileInputRefs.current[idx]?.click()}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', backgroundColor: '#27272a', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: uploadingCoverIdx === idx ? 'not-allowed' : 'pointer' }}
                    >
                      <Upload size={12} /> {uploadingCoverIdx === idx ? 'Uploading...' : 'Replace Cover'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VENDOR PROFILE MODAL (CREATE / EDIT) */}
        {/* ========================================================= */}
        {showVendorModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', padding: '2rem', maxWidth: '520px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #27272a', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase', margin: 0, color: '#fff' }}>
                  {editingVendor ? 'Edit Vendor Profile' : 'Add New Vendor'}
                </h3>
                <button
                  onClick={() => setShowVendorModal(false)}
                  style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveVendor}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.35rem' }}>Vendor / Company Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Kit Manufacturing"
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    required
                    style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.625rem', color: '#fff', fontSize: '0.8125rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.35rem' }}>Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Verma"
                      value={vendorForm.contact_person}
                      onChange={(e) => setVendorForm({ ...vendorForm, contact_person: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.625rem', color: '#fff', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.35rem' }}>Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={vendorForm.phone}
                      onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.625rem', color: '#fff', fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.35rem' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. sales@apexkits.in"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.625rem', color: '#fff', fontSize: '0.8125rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.35rem' }}>Procurement Notes / Address</label>
                  <textarea
                    rows={3}
                    placeholder="Fabric notes, payment terms, location..."
                    value={vendorForm.notes}
                    onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.625rem', color: '#fff', fontSize: '0.8125rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowVendorModal(false)}
                    style={{ background: 'none', border: '1px solid #3f3f46', color: '#fff', padding: '0.625rem 1.25rem', borderRadius: '4px', fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingVendor}
                    style={{ backgroundColor: '#fff', color: '#000', border: 'none', padding: '0.625rem 1.5rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.8125rem', cursor: submittingVendor ? 'not-allowed' : 'pointer' }}
                  >
                    {submittingVendor ? 'Saving...' : 'Save Vendor Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
