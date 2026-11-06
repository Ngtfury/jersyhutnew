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
  Palette,
  Shield,
  Calendar,
  Lock,
  LogOut,
  Truck,
  Send
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
  DEFAULT_VENDORS,
  getOrders,
  updateOrderStatus
} from '../../lib/supabase';
import { PRODUCTS as LOCAL_PRODUCTS } from '../../data/products';

export const JERSEY_VERSIONS = [
  'MASTER QUALITY',
  'PLAYER VERSION',
  'SUBLIMATION',
  'EMBROIDERY'
];

export const KIT_TYPES = [
  { id: 'HOME', label: 'Home Kit' },
  { id: 'AWAY', label: 'Away Kit' },
  { id: 'THIRD', label: 'Third Kit' },
  { id: 'FOURTH', label: 'Fourth Kit' },
  { id: 'SPECIAL', label: 'Special Edition' }
];

export const COMMON_SEASONS = [
  '2026',
  '2025-26',
  '2024-25',
  '2023-24',
  'Retro / Classic'
];

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
  const [mounted, setMounted] = useState(false);
  const [authenticating, setAuthenticating] = useState(true);
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'add' | 'vendors' | 'categories' | 'banners' | 'orders'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  const [orderSearch, setOrderSearch] = useState('');
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const [trackingForms, setTrackingForms] = useState({});
  const [shippingInProgress, setShippingInProgress] = useState({});
  const [activeFulfillOrderId, setActiveFulfillOrderId] = useState(null);
  const [savedCouriers, setSavedCouriers] = useState(['Blue Dart', 'Delhivery', 'DTDC', 'Speed Post']);
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
    min_order_quantity: 10,
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

  // Users Management state
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'verified' | 'unverified'
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [cleaningUnverified, setCleaningUnverified] = useState(false);

  // Form State
  const initialFormState = {
    name: '',
    price: '',
    original_price: '',
    category: 'HALF SLEEVES',
    categories: ['HALF SLEEVES'],
    badge: '',
    primaryColor: 'Blue',
    secondaryColor: 'White',
    stock_per_size: { S: 5, M: 5, L: 5, XL: 5, '2XL': 5 },
    active_sizes: ['S', 'M', 'L', 'XL', '2XL'],
    images: [],
    player: '',
    team: '',
    year: '2025-26',
    version: 'MASTER QUALITY',
    kit_type: 'HOME',
    country: '',
    edition: '',
    material: 'DOTKNIT AERO-COOL',
    description: '',
    isBestSeller: false,
    featured: false,
    vendorId: '',
    vendorPrice: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [customTeams, setCustomTeams] = useState([]);
  const [isNewTeamMode, setIsNewTeamMode] = useState(false);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const fileInputRef = useRef(null);

  // Load all products, categories, vendors & site banners
  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData, vendsData, heroData, coversData, ordersData] = await Promise.all([
        getProducts(),
        getCategories(),
        getVendors(),
        getHeroBanner(),
        getCategoryCovers(),
        getOrders()
      ]);

      setProducts(Array.isArray(prodsData) ? prodsData : []);
      if (catsData && catsData.length > 0) setCategories(catsData);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      
      const cleanVendors = Array.isArray(vendsData)
        ? vendsData.filter(v => v.name !== 'Apex Jersey Manufacturers' && v.id !== 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d')
        : [];
      setVendors(cleanVendors);
      if (cleanVendors.length > 0) {
        if (!selectedVendorId || !cleanVendors.some(v => v.id === selectedVendorId)) {
          setSelectedVendorId(cleanVendors[0].id);
        }
      } else {
        setSelectedVendorId(null);
      }

      if (heroData) setHeroBanner(heroData);
      if (coversData) setCategoryCovers(coversData);

      // Also pre-fetch registered users
      fetchUsers();
    } catch (err) {
      console.error('Failed to load data:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersList(data.users || []);
      } else {
        console.error('Failed to load users:', data.error);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersList(prev => prev.filter(u => u.id !== userId));
        showNotification(`User ${userEmail} was deleted successfully.`);
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Network error while deleting user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleDeleteUnverifiedUsers = async () => {
    const unverifiedCount = usersList.filter(u => !u.is_verified).length;
    if (unverifiedCount === 0) {
      alert('There are no unverified users to delete.');
      return;
    }
    if (!window.confirm(`Delete all ${unverifiedCount} unverified users? Users who have not clicked their confirmation email link will be purged.`)) {
      return;
    }
    setCleaningUnverified(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_unverified' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(`Cleaned up ${data.deletedCount} unverified accounts.`);
        fetchUsers();
      } else {
        alert(data.error || 'Failed to clean up unverified accounts');
      }
    } catch (err) {
      alert('Network error while cleaning unverified users');
    } finally {
      setCleaningUnverified(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setMounted(true);

    async function verifyAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (!data.authenticated) {
          window.location.href = '/admin/login';
          return;
        }
        if (isMounted) {
          setAuthenticating(false);
          loadData();
        }
      } catch (err) {
        console.error('Failed to verify admin authentication:', err);
        window.location.href = '/admin/login';
      }
    }

    verifyAuth();

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('jerseyhut_custom_teams');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setCustomTeams(parsed);
        }
      } catch (e) {}

      try {
        const storedCouriers = localStorage.getItem('matchday_saved_couriers');
        if (storedCouriers) {
          const parsedC = JSON.parse(storedCouriers);
          if (Array.isArray(parsedC) && parsedC.length > 0) setSavedCouriers(parsedC);
        }
      } catch (e) {}
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    window.location.href = '/admin/login';
  };

  // Compute all available unique teams from existing products + custom added teams
  const availableTeams = React.useMemo(() => {
    const fromProducts = products.map(p => p.team?.trim()).filter(Boolean);
    const combined = Array.from(new Set([...fromProducts, ...customTeams])).sort((a, b) => a.localeCompare(b));
    return combined;
  }, [products, customTeams]);

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

  const handleAddCustomSize = (e) => {
    if (e) e.preventDefault();
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (formData.active_sizes.includes(trimmed)) {
      showToast(`Size "${trimmed}" is already added.`, 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      active_sizes: [...prev.active_sizes, trimmed],
      stock_per_size: {
        ...prev.stock_per_size,
        [trimmed]: prev.stock_per_size[trimmed] ?? 5
      }
    }));
    setCustomSizeInput('');
    showToast(`Added size "${trimmed}"`);
  };

  const handleRemoveSize = (sizeToRemove) => {
    setFormData(prev => {
      const remaining = prev.active_sizes.filter(s => s !== sizeToRemove);
      const updatedStock = { ...prev.stock_per_size };
      delete updatedStock[sizeToRemove];
      return {
        ...prev,
        active_sizes: remaining,
        stock_per_size: updatedStock
      };
    });
  };

  const handleApplySizePreset = (presetName) => {
    let targetSizes = [];
    if (presetName === 'APPAREL') targetSizes = ['S', 'M', 'L', 'XL', '2XL'];
    if (presetName === 'BOOTS') targetSizes = ['5', '6', '7', '8', '9', '10', '11'];
    if (presetName === 'FREESIZE') targetSizes = ['FREE SIZE'];

    const newStock = {};
    targetSizes.forEach(s => {
      newStock[s] = formData.stock_per_size[s] ?? 5;
    });

    setFormData(prev => ({
      ...prev,
      active_sizes: targetSizes,
      stock_per_size: newStock
    }));
    showToast(`Applied ${presetName} sizes preset`);
  };

  const handleToggleCategory = (catName) => {
    setFormData(prev => {
      const current = Array.isArray(prev.categories) && prev.categories.length > 0
        ? prev.categories
        : [prev.category].filter(Boolean);
      
      let nextCats;
      if (current.includes(catName)) {
        if (current.length === 1) {
          showToast('Product must belong to at least 1 collection', 'error');
          return prev;
        }
        nextCats = current.filter(c => c !== catName);
      } else {
        nextCats = [...current, catName];
      }

      return {
        ...prev,
        categories: nextCats,
        category: nextCats[0] || 'HALF SLEEVES'
      };
    });
  };

  // Switch to edit product
  const handleEdit = (product) => {
    setEditingId(product.id);
    let productTeam = product.team || '';
    if (!productTeam) {
      const name = product.name || '';
      const knownClubs = [
        'Real Madrid', 'Barcelona', 'Barca', 'Manchester United', 'Man United',
        'Manchester City', 'Man City', 'Arsenal', 'Chelsea', 'Liverpool',
        'Bayern Munich', 'Bayern', 'PSG', 'Juventus', 'AC Milan', 'Inter Milan',
        'Borussia Dortmund', 'Dortmund', 'Atletico Madrid', 'Tottenham', 'Ajax',
        'Portugal', 'Argentina', 'Brazil', 'France', 'Germany', 'Spain', 'England'
      ];
      for (const club of knownClubs) {
        if (new RegExp(`\\b${club}\\b`, 'i').test(name)) {
          productTeam = club;
          break;
        }
      }
      if (!productTeam && product.country) productTeam = product.country;
    }

    const prodCats = Array.isArray(product.categories) && product.categories.length > 0
      ? product.categories
      : [product.category, product.secondaryCategory].filter(Boolean);

    const prodSizes = Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : (product.stock_per_size && Object.keys(product.stock_per_size).length > 0
          ? Object.keys(product.stock_per_size)
          : ['S', 'M', 'L', 'XL', '2XL']);

    setFormData({
      name: product.name,
      price: product.price,
      original_price: product.original_price || '',
      category: prodCats[0] || product.category || 'HALF SLEEVES',
      categories: prodCats.length > 0 ? prodCats : ['HALF SLEEVES'],
      badge: product.badge || '',
      primaryColor: product.primaryColor || (product.color ? product.color.split('/')[0]?.trim() : ''),
      secondaryColor: product.secondaryColor || (product.color && product.color.includes('/') ? product.color.split('/')[1]?.trim() : ''),
      stock_per_size: product.stock_per_size || {},
      active_sizes: prodSizes,
      images: product.images || [],
      player: product.player || '',
      team: productTeam,
      year: product.year || '',
      version: product.version || 'MASTER QUALITY',
      kit_type: product.kit_type || product.kitType || 'HOME',
      country: product.country || '',
      edition: product.edition || '',
      material: product.material || '',
      description: product.description || '',
      isBestSeller: Boolean(product.isBestSeller),
      featured: Boolean(product.featured),
      vendorId: product.vendorId || '',
      vendorPrice: product.vendorPrice !== undefined && product.vendorPrice !== null ? product.vendorPrice : ''
    });
    setIsNewTeamMode(false);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsNewTeamMode(false);
    setActiveTab('manage');
  };

  // Refresh Customer Orders (Only verified paid Razorpay orders)
  const handleRefreshOrders = async () => {
    setRefreshingOrders(true);
    try {
      const ordersData = await getOrders({ onlyPaid: true });
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      showToast(`Refreshed ${ordersData?.length || 0} paid orders from Supabase`, 'success');
    } catch (e) {
      showToast('Failed to refresh orders', 'error');
    } finally {
      setRefreshingOrders(false);
    }
  };

  // Helper to persist used courier names for quick 1-click select on future orders
  const saveCourierToHistory = (courierName) => {
    if (!courierName || !courierName.trim()) return;
    const clean = courierName.trim();
    setSavedCouriers(prev => {
      const updated = [clean, ...prev.filter(c => c.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('matchday_saved_couriers', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  // Open fulfillment text boxes for an order
  const handleOpenFulfill = (order) => {
    setActiveFulfillOrderId(order.id);
    const existingCourier = order.courier_name || order.shipping_address?.courier_name || '';
    const existingAwb = order.tracking_id || order.shipping_address?.tracking_id || '';
    const existingUrl = order.tracking_url || order.shipping_address?.tracking_url || '';

    setTrackingForms(prev => ({
      ...prev,
      [order.id]: {
        courierName: prev[order.id]?.courierName !== undefined ? prev[order.id].courierName : (existingCourier || savedCouriers[0] || ''),
        trackingId: prev[order.id]?.trackingId !== undefined ? prev[order.id].trackingId : existingAwb,
        trackingUrl: prev[order.id]?.trackingUrl !== undefined ? prev[order.id].trackingUrl : existingUrl
      }
    }));
  };

  // Close fulfillment text boxes
  const handleCloseFulfill = (orderId) => {
    setActiveFulfillOrderId(null);
  };

  // Cancel an order
  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel Order ${order.order_number}?`)) return;
    try {
      const ok = await updateOrderStatus(order.id, 'cancelled');
      if (ok) {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
        showToast(`Order ${order.order_number} marked as CANCELLED`, 'success');
      } else {
        showToast('Failed to cancel order in database', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error cancelling order', 'error');
    }
  };

  // Confirm Order & Send Customer Tracking Email
  const handleConfirmShipment = async (order) => {
    const existingTrackingId = order.tracking_id || order.shipping_address?.tracking_id || '';
    const existingCourier = order.courier_name || order.shipping_address?.courier_name || '';
    const existingUrl = order.tracking_url || order.shipping_address?.tracking_url || '';
    
    const form = trackingForms[order.id] || {};
    const courierName = (form.courierName !== undefined ? form.courierName : (existingCourier || savedCouriers[0] || '')).trim();
    const trackingId = (form.trackingId !== undefined ? form.trackingId : existingTrackingId).trim();
    const trackingUrl = (form.trackingUrl !== undefined ? form.trackingUrl : existingUrl).trim();

    if (!courierName) {
      showToast('Please enter a Courier Partner name before confirming', 'error');
      return;
    }

    if (!trackingId) {
      showToast('Please enter a Tracking ID / AWB number before confirming', 'error');
      return;
    }

    setShippingInProgress(prev => ({ ...prev, [order.id]: true }));
    try {
      const res = await fetch('/api/orders/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.order_number,
          courierName,
          trackingId,
          trackingUrl
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update order to shipped');
      }

      // Save courier into history so future orders have it as a 1-click option
      saveCourierToHistory(courierName);

      // Update orders in local state
      setOrders(prev => prev.map(o => {
        if (o.id === order.id || o.order_number === order.order_number) {
          return {
            ...o,
            status: 'shipped',
            courier_name: courierName,
            tracking_id: trackingId,
            tracking_url: trackingUrl,
            shipping_address: {
              ...(o.shipping_address || {}),
              courier_name: courierName,
              tracking_id: trackingId,
              tracking_url: trackingUrl,
              shipped_at: new Date().toISOString(),
              shipped_email_sent: data.emailSent
            }
          };
        }
        return o;
      }));

      // Close the fulfillment text boxes — once shipped, no edit option is shown
      setActiveFulfillOrderId(null);

      const emailNote = data.emailSent 
        ? ` Customer tracking email sent to ${order.customer_email || 'customer'}!`
        : ` (Store notification sent)`;
      showToast(`Order ${order.order_number} marked as SHIPPED!${emailNote}`, 'success');
    } catch (err) {
      console.error('Shipment error:', err);
      showToast(err.message || 'Error marking order as shipped', 'error');
    } finally {
      setShippingInProgress(prev => ({ ...prev, [order.id]: false }));
    }
  };

  // Update Customer Order Status (manual override)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const ok = await updateOrderStatus(orderId, newStatus);
      if (ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        showToast(`Order updated to "${newStatus.toUpperCase()}"`, 'success');
      } else {
        showToast('Failed to update order status in Supabase', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error updating order', 'error');
    }
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
    if (!formData.team || !formData.team.trim()) {
      showToast('Please specify a Team / Club name (Team is required)', 'error');
      return;
    }
    if (!formData.price) {
      showToast('Please enter a price', 'error');
      return;
    }

    setSubmitting(true);
    const finalCats = Array.isArray(formData.categories) && formData.categories.length > 0
      ? formData.categories
      : [formData.category || 'HALF SLEEVES'];

    const payload = {
      ...formData,
      price: Number(formData.price),
      original_price: formData.original_price ? Number(formData.original_price) : undefined,
      category: finalCats[0],
      categories: finalCats,
      sizes: formData.active_sizes,
      stock_per_size: formData.stock_per_size,
      images: formData.images.length > 0 ? formData.images : ['/images/placeholder-jersey.jpg'],
      vendorPrice: formData.vendorPrice !== '' ? Number(formData.vendorPrice) : undefined,
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

      if (formData.team?.trim()) {
        const trimmed = formData.team.trim();
        if (!customTeams.includes(trimmed)) {
          const next = [...customTeams, trimmed];
          setCustomTeams(next);
          if (typeof window !== 'undefined') {
            localStorage.setItem('jerseyhut_custom_teams', JSON.stringify(next));
          }
        }
      }

      setFormData(initialFormState);
      setEditingId(null);
      setIsNewTeamMode(false);
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
      
      // Immediately refresh category cover cards so the new category gets its cover card in banners tab
      const updatedCovers = await getCategoryCovers();
      if (updatedCovers) setCategoryCovers(updatedCovers);

      showToast(`Category "${created.name}" created! Automatically added to Storefront navigation & covers.`);
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

      const updatedCovers = await getCategoryCovers();
      if (updatedCovers) setCategoryCovers(updatedCovers);

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
        min_order_quantity: vendorToEdit.min_order_quantity !== undefined && vendorToEdit.min_order_quantity !== null ? vendorToEdit.min_order_quantity : 10,
        contact_person: vendorToEdit.contact_person || '',
        phone: vendorToEdit.phone || '',
        email: vendorToEdit.email || '',
        notes: vendorToEdit.notes || ''
      });
    } else {
      setEditingVendor(null);
      setVendorForm({ name: '', min_order_quantity: 10, contact_person: '', phone: '', email: '', notes: '' });
    }
    setShowVendorModal(true);
  };

  const handleSaveVendor = async (e) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) {
      showToast('Vendor name is required', 'error');
      return;
    }

    const payload = {
      ...vendorForm,
      min_order_quantity: Math.max(1, parseInt(vendorForm.min_order_quantity, 10) || 10)
    };

    setSubmittingVendor(true);
    try {
      if (editingVendor) {
        const updated = await updateVendor(editingVendor.id, payload);
        setVendors(prev => prev.map(v => v.id === editingVendor.id ? { ...v, ...updated } : v));
        showToast(`Vendor "${vendorForm.name}" updated!`);
      } else {
        const created = await createVendor(payload);
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
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
                          p.name?.toLowerCase().includes(q) ||
                          p.category?.toLowerCase().includes(q) ||
                          p.player?.toLowerCase().includes(q) ||
                          p.team?.toLowerCase().includes(q) ||
                          p.year?.toLowerCase().includes(q) ||
                          p.version?.toLowerCase().includes(q) ||
                          p.kit_type?.toLowerCase().includes(q);
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

  const filteredOrders = orders.filter(order => {
    // In admin panel orders: strictly only show paid Razorpay orders
    if (order.payment_status !== 'paid') return false;

    // Fulfillment status filter
    if (orderFilter !== 'all') {
      if (orderFilter === 'confirmed') {
        if (order.status !== 'confirmed' && order.status !== 'pending' && order.status) return false;
      } else if (order.status !== orderFilter) {
        return false;
      }
    }

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      const matchNum = order.order_number?.toLowerCase().includes(q);
      const matchName = order.customer_name?.toLowerCase().includes(q);
      const matchPhone = order.customer_phone?.toLowerCase().includes(q);
      const matchEmail = order.customer_email?.toLowerCase().includes(q);
      const matchCity = order.shipping_address?.city?.toLowerCase().includes(q);
      const matchPayId = order.razorpay_payment_id?.toLowerCase().includes(q);
      const matchAwb = (order.tracking_id || order.shipping_address?.tracking_id || '')?.toLowerCase().includes(q);
      const matchCourier = (order.courier_name || order.shipping_address?.courier_name || '')?.toLowerCase().includes(q);

      if (!matchNum && !matchName && !matchPhone && !matchEmail && !matchCity && !matchPayId && !matchAwb && !matchCourier) {
        return false;
      }
    }
    return true;
  });

  if (!mounted || authenticating) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ width: '28px', height: '28px', border: '2px solid #27272a', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '0.8125rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#71717a', fontWeight: 600 }}>
          {authenticating ? 'Verifying Admin Security Authorization...' : 'Loading Admin Dashboard...'}
        </span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: '2rem 1.5rem 6rem' }}>
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

            <button
              onClick={handleLogout}
              title="Log out and lock admin console"
              style={{
                background: '#18181b',
                border: '1px solid #3f3f46',
                color: '#f87171',
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              <Lock size={14} />
              <span>Lock Panel</span>
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
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '1rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.8125rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: activeTab === 'orders' ? '#4ade80' : '#a1a1aa',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'orders' ? '2px solid #22c55e' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Customer Orders</span>
            <span style={{
              backgroundColor: activeTab === 'orders' ? '#22c55e' : '#27272a',
              color: activeTab === 'orders' ? '#09090b' : '#4ade80',
              fontWeight: 900,
              fontSize: '0.6875rem',
              padding: '2px 7px',
              borderRadius: '999px',
              border: '1px solid rgba(74, 222, 128, 0.3)'
            }}>
              {orders.filter(o => o.payment_status === 'paid').length}
            </span>
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

          <button
            onClick={() => {
              setActiveTab('users');
              fetchUsers();
            }}
            style={{
              padding: '1rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.8125rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: activeTab === 'users' ? '#38bdf8' : '#71717a',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'users' ? '2px solid #38bdf8' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Users size={15} /> Users {usersList.length > 0 && `(${usersList.length})`}
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

                        {/* Team, Year, Kit Type, Version chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center', marginBottom: '0.6rem', fontSize: '0.6875rem' }}>
                          {product.team && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#fff', backgroundColor: '#27272a', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                              <Shield size={10} color="#38bdf8" />
                              {product.team}
                            </span>
                          )}

                          {product.year && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#d4d4d8', backgroundColor: '#1f2937', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              <Calendar size={10} />
                              {product.year}
                            </span>
                          )}

                          {product.kit_type && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#fef08a', backgroundColor: 'rgba(234, 179, 8, 0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              {product.kit_type === 'HOME' ? 'HOME' : product.kit_type === 'AWAY' ? 'AWAY' : product.kit_type}
                            </span>
                          )}

                          {product.version && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#67e8f9', backgroundColor: 'rgba(6, 182, 212, 0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              <Sparkles size={9} />
                              {product.version}
                            </span>
                          )}

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

              {/* Category / Collection Selection (Multi-Collection) */}
              <div style={{ marginBottom: '1.75rem', backgroundColor: '#09090b', padding: '1.25rem', borderRadius: '8px', border: '1px solid #27272a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', display: 'block' }}>
                      Assign to Collections / Categories *
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                      Select all collections where this product should appear (can belong to multiple).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('categories')}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    + Manage Collections
                  </button>
                </div>

                {/* Multi-Collection Selectable Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.6rem', marginTop: '0.5rem' }}>
                  {categories.map(cat => {
                    const isSelected = (formData.categories || [formData.category]).includes(cat.name);
                    return (
                      <button
                        key={cat.id || cat.name}
                        type="button"
                        onClick={() => handleToggleCategory(cat.name)}
                        style={{
                          padding: '0.75rem 0.85rem',
                          borderRadius: '6px',
                          border: isSelected ? '1px solid #10b981' : '1px solid #27272a',
                          backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : '#18181b',
                          color: isSelected ? '#10b981' : '#d4d4d8',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ textTransform: 'uppercase' }}>{cat.name}</span>
                        {isSelected ? <Check size={14} color="#10b981" /> : <Plus size={14} color="#71717a" />}
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: '#a1a1aa', fontWeight: 600 }}>Active in:</span>
                  {(formData.categories || [formData.category]).map(c => (
                    <span key={c} style={{ backgroundColor: '#27272a', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {c}
                      <button
                        type="button"
                        onClick={() => handleToggleCategory(c)}
                        style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 0, display: 'flex' }}
                        title="Remove from collection"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
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

              {/* JERSEY SPECIFICATIONS: TEAM, YEAR, KIT TYPE, QUALITY/VERSION */}
              <div style={{ marginBottom: '1.75rem', backgroundColor: '#09090b', padding: '1.25rem', borderRadius: '8px', border: '1px solid #27272a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #27272a', paddingBottom: '0.75rem' }}>
                  <Shield size={16} color="#38bdf8" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff' }}>
                    Jersey Specifications (Team, Year, Kit Type & Quality)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  {/* TEAM / CLUB SELECTION */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa' }}>
                        Team / Club Name * <span style={{ color: '#ef4444' }}>(Required)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewTeamMode(!isNewTeamMode);
                          if (!isNewTeamMode) {
                            setFormData(prev => ({ ...prev, team: '' }));
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {isNewTeamMode ? '← Choose from Existing Teams' : '+ Type New Team'}
                      </button>
                    </div>

                    {!isNewTeamMode ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                          value={formData.team}
                          onChange={(e) => {
                            if (e.target.value === '__NEW_TEAM__') {
                              setIsNewTeamMode(true);
                              setFormData({ ...formData, team: '' });
                            } else {
                              setFormData({ ...formData, team: e.target.value });
                            }
                          }}
                          style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.625rem 0.75rem', color: '#fff', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="">-- Select Team / Club --</option>
                          {formData.team && !availableTeams.includes(formData.team) && (
                            <option value={formData.team}>{formData.team}</option>
                          )}
                          {availableTeams.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                          <option value="__NEW_TEAM__">+ Type New Team (e.g. Barca, PSG)...</option>
                        </select>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="e.g. Barca, Real Madrid, Arsenal"
                          value={formData.team}
                          onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                          autoFocus
                          style={{ flex: 1, backgroundColor: '#18181b', border: '1px solid #38bdf8', borderRadius: '6px', padding: '0.625rem 0.75rem', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => setIsNewTeamMode(false)}
                          style={{ backgroundColor: '#27272a', color: '#fff', border: 'none', padding: '0 0.75rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <span style={{ fontSize: '0.6875rem', color: '#71717a', marginTop: '0.35rem', display: 'block' }}>
                      {isNewTeamMode 
                        ? 'Type new team (e.g. Barca). Once saved, it will appear in the dropdown for all future jerseys.'
                        : 'Select an existing team or click "+ Type New Team" to add a new one.'}
                    </span>
                  </div>

                  {/* JERSEY YEAR / SEASON */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '0.4rem' }}>
                      Jersey Year / Season *
                    </label>
                    <input
                      type="text"
                      list="common-seasons-list"
                      placeholder="e.g. 2025-26, 2024, or 2008"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', padding: '0.625rem 0.75rem', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                    />
                    <datalist id="common-seasons-list">
                      {COMMON_SEASONS.map(s => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>

                    {/* Quick year pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.45rem' }}>
                      {COMMON_SEASONS.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormData({ ...formData, year: s })}
                          style={{
                            fontSize: '0.65rem',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            border: formData.year === s ? '1px solid #fff' : '1px solid #27272a',
                            backgroundColor: formData.year === s ? '#27272a' : 'transparent',
                            color: formData.year === s ? '#fff' : '#71717a',
                            cursor: 'pointer'
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* KIT TYPE (HOME / AWAY / THIRD / SPECIAL) */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '0.4rem' }}>
                    Kit Type (Home / Away) *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                    {KIT_TYPES.map(k => {
                      const isSelected = formData.kit_type === k.id;
                      return (
                        <button
                          key={k.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, kit_type: k.id })}
                          style={{
                            padding: '0.625rem 0.75rem',
                            borderRadius: '6px',
                            border: isSelected ? '1px solid #ffffff' : '1px solid #27272a',
                            backgroundColor: isSelected ? '#ffffff' : '#18181b',
                            color: isSelected ? '#000000' : '#d4d4d8',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected && <Check size={12} />}
                          {k.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* JERSEY VERSION / QUALITY OPTION */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa' }}>
                      Jersey Quality / Version *
                    </label>
                    <span style={{ fontSize: '0.6875rem', color: '#38bdf8', fontWeight: 600 }}>
                      Selected: {formData.version || 'MASTER QUALITY'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                    {JERSEY_VERSIONS.map(ver => {
                      const isSelected = formData.version === ver;
                      return (
                        <button
                          key={ver}
                          type="button"
                          onClick={() => setFormData({ ...formData, version: ver })}
                          style={{
                            padding: '0.625rem 0.75rem',
                            borderRadius: '6px',
                            border: isSelected ? '1px solid #38bdf8' : '1px solid #27272a',
                            backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#18181b',
                            color: isSelected ? '#38bdf8' : '#d4d4d8',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected && <Sparkles size={12} />}
                          {ver}
                        </button>
                      );
                    })}
                  </div>
                </div>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
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
                        <option key={v.id} value={v.id}>
                          {v.name} (MOQ: {v.min_order_quantity || 10} units)
                        </option>
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

                  {/* Vendor MOQ Info Display */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', marginBottom: '0.35rem' }}>
                      Vendor Min Order Quantity (MOQ)
                    </label>
                    <div style={{ padding: '0.625rem 0.75rem', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', fontSize: '0.8125rem', color: '#d4d4d8' }}>
                      {formData.vendorId ? (
                        <span>
                          Target: <strong style={{ color: '#60a5fa' }}>{vendors.find(v => v.id === formData.vendorId)?.min_order_quantity || 10} units</strong> across all jerseys
                        </span>
                      ) : (
                        <span style={{ color: '#71717a' }}>Select a vendor above to view MOQ</span>
                      )}
                    </div>
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

              {/* Inventory Stock by Sizes (Dynamic / Custom Sizes) */}
              <div style={{ marginBottom: '1.75rem', backgroundColor: '#09090b', padding: '1.25rem', borderRadius: '8px', border: '1px solid #27272a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', marginBottom: '0.2rem' }}>
                      Available Sizes & Inventory per Size
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                      Supports standard apparel (S-2XL), boot/shoe sizes (5, 6, 7, 8, 9...), or custom measurements.
                    </span>
                  </div>

                  {/* Size Preset Buttons */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleApplySizePreset('APPAREL')}
                      style={{ padding: '4px 10px', fontSize: '0.7rem', backgroundColor: '#18181b', color: '#d4d4d8', border: '1px solid #3f3f46', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Preset: Apparel (S-2XL)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySizePreset('BOOTS')}
                      style={{ padding: '4px 10px', fontSize: '0.7rem', backgroundColor: '#18181b', color: '#60a5fa', border: '1px solid #3b82f655', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Preset: Boots (5-11)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySizePreset('FREESIZE')}
                      style={{ padding: '4px 10px', fontSize: '0.7rem', backgroundColor: '#18181b', color: '#d4d4d8', border: '1px solid #3f3f46', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Preset: Free Size
                    </button>
                  </div>
                </div>

                {/* Add Custom Size Inline Form */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', maxWidth: '360px' }}>
                  <input
                    type="text"
                    placeholder="Add custom size (e.g. 7.5, UK 9, 3XL)"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSize();
                      }
                    }}
                    style={{ flex: 1, backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '4px', padding: '0.45rem 0.75rem', color: '#fff', fontSize: '0.78rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    style={{ backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '4px', padding: '0.45rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>

                {/* Sizes List with Quantity and Delete */}
                {formData.active_sizes.length === 0 ? (
                  <p style={{ fontSize: '0.78rem', color: '#ef4444', fontStyle: 'italic', margin: 0 }}>
                    ⚠️ No sizes added yet. Use a preset above or add a custom size.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.65rem' }}>
                    {formData.active_sizes.map(size => {
                      const qty = formData.stock_per_size[size] ?? 0;

                      return (
                        <div
                          key={size}
                          style={{
                            backgroundColor: '#18181b',
                            border: '1px solid #3f3f46',
                            borderRadius: '6px',
                            padding: '0.65rem 0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.875rem', color: '#fff' }}>
                              {size}
                            </strong>
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(size)}
                              style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 0 }}
                              title={`Remove size ${size}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.6875rem', color: '#a1a1aa' }}>Stock Qty:</span>
                            <input
                              type="number"
                              min="0"
                              value={qty}
                              onChange={(e) => handleStockChange(size, e.target.value)}
                              style={{ width: '100%', padding: '3px 6px', backgroundColor: '#09090b', border: '1px solid #52525b', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', textAlign: 'center' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Country / Nation</label>
                    <input
                      type="text"
                      placeholder="e.g. SPAIN or FRANCE"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
                    const vProds = products.filter(p => p.vendorId === v.id);
                    const vTotalStock = vProds.reduce((sum, p) => sum + getProductTotalStock(p), 0);
                    const vMOQ = v.min_order_quantity !== undefined && v.min_order_quantity !== null ? Number(v.min_order_quantity) : 10;
                    const isBelowMOQ = vProds.length > 0 && vTotalStock <= vMOQ;

                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVendorId(v.id)}
                        style={{
                          backgroundColor: isSelected ? '#27272a' : '#18181b',
                          border: isSelected ? '1px solid #ffffff' : isBelowMOQ ? '1px solid #ef4444' : '1px solid #27272a',
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
                          {isBelowMOQ ? (
                            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.625rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                              🚨 BELOW MOQ ({vTotalStock}/{vMOQ})
                            </span>
                          ) : vTotalStock > 0 ? (
                            <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontSize: '0.625rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                              {vTotalStock} UNITS
                            </span>
                          ) : (
                            <span style={{ backgroundColor: '#27272a', color: '#a1a1aa', fontSize: '0.625rem', padding: '2px 6px', borderRadius: '4px' }}>
                              0 UNITS
                            </span>
                          )}
                        </div>

                        {v.contact_person && (
                          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                            Contact: {v.contact_person}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#71717a', borderTop: '1px solid #27272a', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                          <span>{vProds.length} Products</span>
                          <span>MOQ: {vMOQ} units</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Vendor Detail & Stock Analytics */}
                {currentVendor && (() => {
                  const vendorMOQ = currentVendor.min_order_quantity !== undefined && currentVendor.min_order_quantity !== null ? Number(currentVendor.min_order_quantity) : 10;
                  const isVendorBelowMOQ = vendorProducts.length > 0 && vendorTotalStock <= vendorMOQ;

                  return (
                    <div style={{ backgroundColor: '#18181b', borderRadius: '8px', border: isVendorBelowMOQ ? '1px solid #ef4444' : '1px solid #27272a', padding: '1.75rem' }}>
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

                      {/* MOQ REORDER ALERT BANNER */}
                      {isVendorBelowMOQ && (
                        <div style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid #ef4444',
                          borderRadius: '6px',
                          padding: '1rem 1.25rem',
                          marginBottom: '1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}>
                          <AlertTriangle size={22} color="#ef4444" style={{ flexShrink: 0 }} />
                          <div>
                            <strong style={{ color: '#ef4444', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.04em' }}>
                              🚨 REORDER REQUIRED — VENDOR MINIMUM ORDER QUANTITY (MOQ) REACHED
                            </strong>
                            <p style={{ color: '#fca5a5', fontSize: '0.8125rem', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                              Total available stock across all jerseys supplied by <strong>{currentVendor.name}</strong> is currently <strong>{vendorTotalStock} units</strong>, which has fallen to or below the vendor MOQ threshold (<strong>{vendorMOQ} units</strong>). Place a replenishment batch order with this supplier!
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Analytics Summary Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ backgroundColor: '#09090b', padding: '1rem', borderRadius: '6px', border: '1px solid #27272a' }}>
                          <span style={{ fontSize: '0.6875rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supplied Products</span>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>{vendorProducts.length}</div>
                        </div>

                        <div style={{ backgroundColor: '#09090b', padding: '1rem', borderRadius: '6px', border: isVendorBelowMOQ ? '1px solid #ef4444' : '1px solid #27272a' }}>
                          <span style={{ fontSize: '0.6875rem', color: isVendorBelowMOQ ? '#ef4444' : '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Units Stock</span>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isVendorBelowMOQ ? '#ef4444' : '#fff', marginTop: '0.25rem' }}>{vendorTotalStock}</div>
                        </div>

                        <div style={{ backgroundColor: '#09090b', padding: '1rem', borderRadius: '6px', border: '1px solid #27272a' }}>
                          <span style={{ fontSize: '0.6875rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendor MOQ</span>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.25rem' }}>{vendorMOQ} units</div>
                        </div>

                        <div style={{ backgroundColor: '#09090b', padding: '1rem', borderRadius: '6px', border: '1px solid #27272a' }}>
                          <span style={{ fontSize: '0.6875rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Value (Cost)</span>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ade80', marginTop: '0.25rem' }}>₹{vendorTotalCost}</div>
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
                                <th style={{ padding: '0.75rem 0.5rem' }}>Size Breakdown</th>
                                <th style={{ padding: '0.75rem 0.5rem' }}>Total Stock</th>
                                <th style={{ padding: '0.75rem 0.5rem' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {vendorProducts.map(p => {
                                const stock = getProductTotalStock(p);
                                const isLow = stock <= 3;

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
                                    <td style={{ padding: '0.75rem 0.5rem', color: '#a1a1aa', fontSize: '0.75rem' }}>
                                      {Object.entries(p.stock_per_size || {}).map(([sz, qty]) => `${sz}:${qty}`).join(' • ')}
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                      <span style={{ color: isLow ? '#facc15' : '#fff', fontWeight: isLow ? 800 : 400 }}>
                                        {stock} units
                                      </span>
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
                  );
                })()}
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
        {/* TAB 6: CUSTOMER ORDERS (RAZORPAY) */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div>
            {/* Orders Metric Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paid Orders</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#38bdf8' }}>
                    {orders.filter(o => o.payment_status === 'paid').length}
                  </div>
                </div>
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#4ade80' }}>
                    ₹{orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)}
                  </div>
                </div>
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ready to Dispatch</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#facc15' }}>
                    {orders.filter(o => o.payment_status === 'paid' && (o.status === 'confirmed' || o.status === 'pending' || !o.status)).length}
                  </div>
                </div>
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shipped / In Transit</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#22c55e' }}>
                    {orders.filter(o => o.payment_status === 'paid' && o.status === 'shipped').length}
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', backgroundColor: '#18181b', padding: '1rem', borderRadius: '8px', border: '1px solid #27272a' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: 'All Paid' },
                    { key: 'confirmed', label: 'Ready to Ship' },
                    { key: 'shipped', label: 'Shipped' },
                    { key: 'delivered', label: 'Delivered' },
                    { key: 'cancelled', label: 'Cancelled' }
                  ].map(({ key: fKey, label }) => {
                    const count = orders.filter(o => {
                      if (o.payment_status !== 'paid') return false;
                      if (fKey === 'all') return true;
                      if (fKey === 'confirmed') return o.status === 'confirmed' || o.status === 'pending' || !o.status;
                      return o.status === fKey;
                    }).length;

                    return (
                      <button
                        key={fKey}
                        type="button"
                        onClick={() => setOrderFilter(fKey)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: orderFilter === fKey ? '#ffffff' : '#09090b',
                          color: orderFilter === fKey ? '#09090b' : '#a1a1aa',
                          border: '1px solid #27272a'
                        }}
                      >
                        {label} ({count})
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: '1 1 260px', maxWidth: '420px' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                    <input
                      type="text"
                      placeholder="Search order #, customer, phone..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      style={{ width: '100%', padding: '0.45rem 0.75rem 0.45rem 2rem', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshOrders}
                    disabled={refreshingOrders}
                    style={{
                      padding: '0.45rem 0.85rem',
                      backgroundColor: '#27272a',
                      color: '#fff',
                      border: '1px solid #3f3f46',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      whiteSpace: 'nowrap'
                    }}
                    title="Fetch latest customer orders from Supabase"
                  >
                    <RefreshCw size={14} className={refreshingOrders ? 'animate-spin' : ''} />
                    <span>{refreshingOrders ? 'Syncing...' : 'Sync'}</span>
                  </button>
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '3rem 2rem', textAlign: 'center', color: '#71717a' }}>
                  <Package size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>
                    {orders.length === 0 ? 'No customer orders yet' : 'No orders matching filter'}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', maxWidth: '420px', margin: '0 auto', color: '#a1a1aa' }}>
                    {orders.length === 0 
                      ? 'When customers complete checkout via Razorpay (UPI, Google Pay, PhonePe, Cards), incoming orders with delivery addresses and kit sizes will appear here.'
                      : 'Try resetting the search or status filter to see all orders.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {filteredOrders.map((order) => {
                    const isPaid = order.payment_status === 'paid';
                    const customerPhone = order.customer_phone?.replace(/\D/g, '') || '';
                    const whatsappLink = customerPhone ? `https://wa.me/91${customerPhone}?text=${encodeURIComponent(`Hi ${order.customer_name}, thank you for ordering from Matchday! Inquiry regarding your order ${order.order_number}.`)}` : null;

                    return (
                      <div
                        key={order.id || order.order_number}
                        style={{
                          backgroundColor: '#18181b',
                          border: '1px solid #27272a',
                          borderRadius: '8px',
                          padding: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem'
                        }}
                      >
                        {/* Order Header */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #27272a', paddingBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace', color: '#fff' }}>
                              {order.order_number || 'ORDER'}
                            </span>
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: isPaid ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                                color: isPaid ? '#4ade80' : '#facc15',
                                border: `1px solid ${isPaid ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`
                              }}
                            >
                              {isPaid ? 'PAID VIA RAZORPAY' : 'PAYMENT PENDING'}
                            </span>

                            {/* Order Fulfillment Status Badge (No Dropdown) */}
                            {(() => {
                              if (order.status === 'shipped') {
                                return (
                                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#14532d', color: '#86efac', border: '1px solid #16a34a' }}>
                                    🚚 SHIPPED
                                  </span>
                                );
                              }
                              if (order.status === 'cancelled') {
                                return (
                                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                                    ❌ CANCELLED
                                  </span>
                                );
                              }
                              if (order.status === 'delivered') {
                                return (
                                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#1e3a5f', color: '#93c5fd', border: '1px solid #3b82f6' }}>
                                    📦 DELIVERED
                                  </span>
                                );
                              }
                              return (
                                <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(250, 204, 21, 0.15)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.3)' }}>
                                  ⏳ READY TO FULFILL
                                </span>
                              );
                            })()}
                          </div>

                          <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                            {order.created_at ? new Date(order.created_at).toLocaleString('en-IN') : ''}
                          </div>
                        </div>

                        {/* Customer & Address Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
                          <div>
                            <div style={{ color: '#71717a', fontSize: '0.6875rem', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700 }}>Customer Details</div>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{order.customer_name}</div>
                            <div style={{ color: '#d4d4d8' }}>{order.customer_phone}</div>
                            {order.customer_email && <div style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>{order.customer_email}</div>}
                            {whatsappLink && (
                              <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#22c55e', fontSize: '0.75rem', marginTop: '0.35rem', textDecoration: 'none', fontWeight: 600 }}
                              >
                                Message Customer on WhatsApp →
                              </a>
                            )}
                          </div>

                          <div>
                            <div style={{ color: '#71717a', fontSize: '0.6875rem', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700 }}>Delivery Address</div>
                            <div style={{ color: '#d4d4d8', lineHeight: 1.4 }}>
                              {order.shipping_address?.address || 'Address provided'},<br />
                              {order.shipping_address?.city}, {order.shipping_address?.state} - <strong>{order.shipping_address?.pincode}</strong>
                            </div>
                          </div>

                          <div>
                            <div style={{ color: '#71717a', fontSize: '0.6875rem', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700 }}>Payment Info</div>
                            <div style={{ color: '#d4d4d8' }}>Gateway: <strong>Razorpay</strong></div>
                            {order.razorpay_payment_id && (
                              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                                Pay ID: {order.razorpay_payment_id}
                              </div>
                            )}
                            <div style={{ marginTop: '0.35rem', fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                              Total: ₹{order.total_amount}
                            </div>
                          </div>
                        </div>

                        {/* Items Purchased List */}
                        {Array.isArray(order.items) && order.items.length > 0 && (
                          <div style={{ borderTop: '1px solid #27272a', paddingTop: '0.75rem' }}>
                            <div style={{ color: '#71717a', fontSize: '0.6875rem', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Kits In Order ({order.items.length})</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                              {order.items.map((item, iIdx) => (
                                <div
                                  key={iIdx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    backgroundColor: '#09090b',
                                    border: '1px solid #27272a',
                                    padding: '0.4rem 0.65rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {item.product?.images?.[0] && (
                                    <img
                                      src={item.product.images[0]}
                                      alt=""
                                      style={{ width: '28px', height: '32px', objectFit: 'cover', borderRadius: '3px' }}
                                    />
                                  )}
                                  <div>
                                    <div style={{ color: '#fff', fontWeight: 600 }}>{item.product?.name || 'Jersey'}</div>
                                    <div style={{ color: '#71717a', fontSize: '0.6875rem' }}>
                                      Size: <strong style={{ color: '#d4d4d8' }}>{item.size}</strong> | Qty: {item.quantity} | ₹{(item.product?.price || item.price || 0) * (item.quantity || 1)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ========================================================= */}
                        {/* FULFILLMENT & ACTION FLOW (TEXT BOXES + QUICK SELECT) */}
                        {/* ========================================================= */}
                        {(() => {
                          const isShipped = order.status === 'shipped';
                          const isCancelled = order.status === 'cancelled';
                          const isFormOpen = activeFulfillOrderId === order.id;

                          const existingCourier = order.courier_name || order.shipping_address?.courier_name || '';
                          const existingAwb = order.tracking_id || order.shipping_address?.tracking_id || '';
                          const existingUrl = order.tracking_url || order.shipping_address?.tracking_url || '';
                          const shippedAt = order.shipped_at || order.shipping_address?.shipped_at;
                          const emailSent = order.shipped_email_sent || order.shipping_address?.shipped_email_sent;

                          const form = trackingForms[order.id] || {};
                          const currentCourier = form.courierName !== undefined ? form.courierName : (existingCourier || savedCouriers[0] || '');
                          const currentAwb = form.trackingId !== undefined ? form.trackingId : existingAwb;
                          const currentUrl = form.trackingUrl !== undefined ? form.trackingUrl : existingUrl;
                          const isShippingThis = Boolean(shippingInProgress[order.id]);

                          // 1. Shipped State: Show tracking info with NO edit option
                          if (isShipped) {
                            return (
                              <div style={{
                                marginTop: '0.5rem',
                                padding: '1rem 1.25rem',
                                backgroundColor: '#052e16',
                                border: '1px solid #16a34a',
                                borderRadius: '8px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                                  <div style={{ backgroundColor: '#22c55e', color: '#09090b', padding: '0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Truck size={20} />
                                  </div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', letterSpacing: '0.04em' }}>
                                        Dispatched via {existingCourier || 'Express Courier'}
                                      </span>
                                      {emailSent && (
                                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                          ✉️ Customer Tracking Email Sent
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#bbf7d0', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                      <span>Tracking ID / AWB: <strong style={{ color: '#ffffff', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{existingAwb || 'N/A'}</strong></span>
                                      {shippedAt && (
                                        <span>&bull; {new Date(shippedAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  {existingUrl ? (
                                    <a
                                      href={existingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        backgroundColor: '#22c55e',
                                        color: '#09090b',
                                        fontWeight: 800,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em',
                                        padding: '0.5rem 0.9rem',
                                        borderRadius: '6px',
                                        textDecoration: 'none'
                                      }}
                                    >
                                      <span>Track Online</span>
                                      <ExternalLink size={13} />
                                    </a>
                                  ) : (
                                    existingAwb && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(existingAwb);
                                          showToast('AWB copied to clipboard');
                                        }}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.35rem',
                                          backgroundColor: '#27272a',
                                          color: '#ffffff',
                                          border: '1px solid #3f3f46',
                                          fontSize: '0.75rem',
                                          fontWeight: 700,
                                          padding: '0.45rem 0.75rem',
                                          borderRadius: '6px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <Copy size={13} />
                                        <span>Copy AWB</span>
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          }

                          // 2. Cancelled State
                          if (isCancelled) {
                            return (
                              <div style={{ marginTop: '0.5rem', padding: '0.85rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <X size={16} />
                                <span>This order has been cancelled.</span>
                              </div>
                            );
                          }

                          // 3. Normal Unfulfilled State: Show "Cancel Order" & "Confirm Order" buttons
                          if (!isFormOpen) {
                            return (
                              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid #27272a', paddingTop: '0.85rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleCancelOrder(order)}
                                  style={{
                                    padding: '0.5rem 0.9rem',
                                    backgroundColor: 'transparent',
                                    color: '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.35)',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                  }}
                                >
                                  <X size={14} />
                                  <span>Cancel Order</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenFulfill(order)}
                                  style={{
                                    padding: '0.55rem 1.25rem',
                                    backgroundColor: '#22c55e',
                                    color: '#09090b',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.8125rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.45rem',
                                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.25)'
                                  }}
                                >
                                  <Truck size={15} />
                                  <span>Confirm Order</span>
                                </button>
                              </div>
                            );
                          }

                          // 4. Form Open: Show Text Boxes & Previous Couriers Select
                          return (
                            <div style={{
                              marginTop: '0.75rem',
                              padding: '1.25rem',
                              backgroundColor: '#121214',
                              border: '1px solid #22c55e',
                              borderRadius: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1rem',
                              boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #27272a', paddingBottom: '0.65rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Truck size={18} style={{ color: '#22c55e' }} />
                                  <span style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', letterSpacing: '0.04em' }}>
                                    Dispatch & Tracking Details
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCloseFulfill(order.id)}
                                  style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                                  title="Close"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                                {/* Courier Partner Text Box with Quick Previous Selection */}
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '0.35rem' }}>
                                    Courier Partner *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Type courier name (e.g. DTDC, Delhivery, Speed Post)"
                                    value={currentCourier}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTrackingForms(prev => ({
                                        ...prev,
                                        [order.id]: {
                                          ...(prev[order.id] || {}),
                                          courierName: val
                                        }
                                      }));
                                    }}
                                    style={{
                                      width: '100%',
                                      backgroundColor: '#09090b',
                                      border: '1px solid #27272a',
                                      borderRadius: '6px',
                                      padding: '0.55rem 0.75rem',
                                      color: '#ffffff',
                                      fontSize: '0.8125rem',
                                      fontWeight: 600,
                                      outline: 'none',
                                      boxSizing: 'border-box'
                                    }}
                                  />

                                  {/* Quick Select Previous Courier Partners */}
                                  {savedCouriers.length > 0 && (
                                    <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '0.65rem', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Select previous:</span>
                                      {savedCouriers.map((c) => (
                                        <button
                                          key={c}
                                          type="button"
                                          onClick={() => {
                                            setTrackingForms(prev => ({
                                              ...prev,
                                              [order.id]: {
                                                ...(prev[order.id] || {}),
                                                courierName: c
                                              }
                                            }));
                                          }}
                                          style={{
                                            fontSize: '0.6875rem',
                                            padding: '2px 7px',
                                            backgroundColor: currentCourier.toLowerCase() === c.toLowerCase() ? '#22c55e' : '#27272a',
                                            color: currentCourier.toLowerCase() === c.toLowerCase() ? '#09090b' : '#d4d4d8',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '4px',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                          }}
                                        >
                                          {c}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Tracking ID / AWB Number */}
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '0.35rem' }}>
                                    Tracking ID / AWB Number *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. BD-883719201 or 123456789"
                                    value={currentAwb}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTrackingForms(prev => ({
                                        ...prev,
                                        [order.id]: {
                                          ...(prev[order.id] || {}),
                                          trackingId: val
                                        }
                                      }));
                                    }}
                                    style={{
                                      width: '100%',
                                      backgroundColor: '#09090b',
                                      border: '1px solid #27272a',
                                      borderRadius: '6px',
                                      padding: '0.55rem 0.75rem',
                                      color: '#ffffff',
                                      fontFamily: 'monospace',
                                      fontSize: '0.8125rem',
                                      fontWeight: 700,
                                      outline: 'none',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>

                                {/* Tracking Link / URL */}
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '0.35rem' }}>
                                    Tracking Link / URL
                                  </label>
                                  <input
                                    type="url"
                                    placeholder="https://track.courier.com/..."
                                    value={currentUrl}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTrackingForms(prev => ({
                                        ...prev,
                                        [order.id]: {
                                          ...(prev[order.id] || {}),
                                          trackingUrl: val
                                        }
                                      }));
                                    }}
                                    style={{
                                      width: '100%',
                                      backgroundColor: '#09090b',
                                      border: '1px solid #27272a',
                                      borderRadius: '6px',
                                      padding: '0.55rem 0.75rem',
                                      color: '#ffffff',
                                      fontSize: '0.8125rem',
                                      outline: 'none',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Form Bottom Actions */}
                              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleCloseFulfill(order.id)}
                                  disabled={isShippingThis}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#27272a',
                                    color: '#d4d4d8',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleConfirmShipment(order)}
                                  disabled={isShippingThis || !currentCourier.trim() || !currentAwb.trim()}
                                  style={{
                                    padding: '0.55rem 1.35rem',
                                    backgroundColor: (!currentCourier.trim() || !currentAwb.trim() || isShippingThis) ? '#27272a' : '#22c55e',
                                    color: (!currentCourier.trim() || !currentAwb.trim() || isShippingThis) ? '#71717a' : '#09090b',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                    cursor: (!currentCourier.trim() || !currentAwb.trim() || isShippingThis) ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.45rem'
                                  }}
                                >
                                  {isShippingThis ? (
                                    <>
                                      <RefreshCw size={14} className="animate-spin" />
                                      <span>Dispatching & Sending Email...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Send size={14} />
                                      <span>Confirm & Send Email</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: USERS MANAGEMENT (SUPABASE AUTH) */}
        {/* ========================================================= */}
        {activeTab === 'users' && (
          <div>
            {/* Users Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#ffffff' }}>
                  {usersList.length}
                </div>
              </div>

              <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Users</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#22c55e' }}>
                  {usersList.filter(u => u.is_verified).length}
                </div>
              </div>

              <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unverified (Pending Email)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#f59e0b' }}>
                  {usersList.filter(u => !u.is_verified).length}
                </div>
              </div>

              <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleDeleteUnverifiedUsers}
                  disabled={cleaningUnverified || usersList.filter(u => !u.is_verified).length === 0}
                  style={{
                    backgroundColor: usersList.filter(u => !u.is_verified).length > 0 ? '#ef444422' : '#27272a',
                    border: usersList.filter(u => !u.is_verified).length > 0 ? '1px solid #ef444466' : '1px solid #3f3f46',
                    color: usersList.filter(u => !u.is_verified).length > 0 ? '#f87171' : '#71717a',
                    padding: '0.65rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: usersList.filter(u => !u.is_verified).length > 0 && !cleaningUnverified ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Trash2 size={14} />
                  <span>{cleaningUnverified ? 'Cleaning...' : 'Delete All Unverified Users'}</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', backgroundColor: '#18181b', padding: '1rem', borderRadius: '8px', border: '1px solid #27272a' }}>
              <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '400px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem 0.5rem 2.25rem',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Status Filter Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setUserFilter('all')}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    backgroundColor: userFilter === 'all' ? '#ffffff' : '#27272a',
                    color: userFilter === 'all' ? '#09090b' : '#a1a1aa'
                  }}
                >
                  All Users ({usersList.length})
                </button>

                <button
                  type="button"
                  onClick={() => setUserFilter('verified')}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    backgroundColor: userFilter === 'verified' ? '#22c55e' : '#27272a',
                    color: userFilter === 'verified' ? '#09090b' : '#a1a1aa'
                  }}
                >
                  Verified Only ({usersList.filter(u => u.is_verified).length})
                </button>

                <button
                  type="button"
                  onClick={() => setUserFilter('unverified')}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    backgroundColor: userFilter === 'unverified' ? '#f59e0b' : '#27272a',
                    color: userFilter === 'unverified' ? '#09090b' : '#a1a1aa'
                  }}
                >
                  Unverified Only ({usersList.filter(u => !u.is_verified).length})
                </button>

                <button
                  type="button"
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  style={{
                    padding: '0.45rem 0.75rem',
                    backgroundColor: '#27272a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem'
                  }}
                  title="Refresh users"
                >
                  <RefreshCw size={13} className={loadingUsers ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Users List */}
            {loadingUsers ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#71717a' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
                <div>Loading registered users...</div>
              </div>
            ) : (() => {
              const filtered = usersList.filter(u => {
                if (userFilter === 'verified' && !u.is_verified) return false;
                if (userFilter === 'unverified' && u.is_verified) return false;
                if (userSearch.trim()) {
                  const q = userSearch.toLowerCase();
                  const email = (u.email || '').toLowerCase();
                  const name = (u.name || '').toLowerCase();
                  const phone = (u.phone || '').toLowerCase();
                  return email.includes(q) || name.includes(q) || phone.includes(q);
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div style={{ padding: '4rem', textAlign: 'center', color: '#71717a', backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a' }}>
                    <Users size={36} style={{ margin: '0 auto 1rem', color: '#3f3f46' }} />
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#a1a1aa' }}>No users found</div>
                    <div style={{ fontSize: '0.8125rem', color: '#71717a', marginTop: '0.25rem' }}>
                      Try adjusting your search query or verification filter.
                    </div>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filtered.map((u) => {
                    const isDeletingThis = deletingUserId === u.id;
                    const initials = (u.name || u.email || 'U').charAt(0).toUpperCase();

                    return (
                      <div
                        key={u.id}
                        style={{
                          backgroundColor: '#18181b',
                          border: u.is_verified ? '1px solid #27272a' : '1px dashed #f59e0b55',
                          borderRadius: '8px',
                          padding: '1.25rem',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem'
                        }}
                      >
                        {/* User Identity */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            backgroundColor: u.is_verified ? '#22c55e22' : '#f59e0b22',
                            color: u.is_verified ? '#4ade80' : '#fbbf24',
                            border: u.is_verified ? '1px solid #22c55e44' : '1px solid #f59e0b44',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1rem'
                          }}>
                            {initials}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9375rem' }}>
                                {u.name || 'Matchday Fan'}
                              </span>
                              {u.is_verified ? (
                                <span style={{
                                  fontSize: '0.65rem',
                                  backgroundColor: '#14532d',
                                  color: '#86efac',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em'
                                }}>
                                  ✓ VERIFIED
                                </span>
                              ) : (
                                <span style={{
                                  fontSize: '0.65rem',
                                  backgroundColor: '#451a03',
                                  color: '#fcd34d',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em'
                                }}>
                                  UNVERIFIED (PENDING)
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                              <span style={{ fontSize: '0.8125rem', color: '#a1a1aa' }}>
                                {u.email}
                              </span>
                              {u.phone && (
                                <span style={{ fontSize: '0.75rem', color: '#71717a' }}>
                                  • {u.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* User Timestamps */}
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#71717a' }}>
                          <div>
                            <span style={{ display: 'block', color: '#52525b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 700 }}>Joined</span>
                            <span style={{ color: '#d4d4d8' }}>
                              {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          {u.email_confirmed_at && (
                            <div>
                              <span style={{ display: 'block', color: '#52525b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 700 }}>Confirmed</span>
                              <span style={{ color: '#86efac' }}>
                                {new Date(u.email_confirmed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          )}

                          <div>
                            <span style={{ display: 'block', color: '#52525b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 700 }}>Last Active</span>
                            <span style={{ color: '#d4d4d8' }}>
                              {u.last_sign_in_at
                                ? new Date(u.last_sign_in_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                : 'Never'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={isDeletingThis}
                            style={{
                              backgroundColor: '#27272a',
                              color: '#f87171',
                              border: '1px solid #3f3f46',
                              borderRadius: '6px',
                              padding: '0.5rem 0.85rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: isDeletingThis ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#ef4444';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#27272a';
                              e.currentTarget.style.color = '#f87171';
                            }}
                          >
                            <Trash2 size={13} />
                            <span>{isDeletingThis ? 'Deleting...' : 'Delete User'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
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
                    placeholder="e.g. Skyline Apparels Ltd"
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
                      placeholder="e.g. Contact Name"
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

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.35rem' }}>Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. supplier@domain.com"
                      value={vendorForm.email}
                      onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.625rem', color: '#fff', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Min Order Qty (MOQ) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 10"
                      value={vendorForm.min_order_quantity}
                      onChange={(e) => setVendorForm({ ...vendorForm, min_order_quantity: parseInt(e.target.value, 10) || 0 })}
                      required
                      style={{ width: '100%', backgroundColor: '#09090b', border: '1px solid #f59e0b55', borderRadius: '4px', padding: '0.625rem', color: '#fff', fontSize: '0.8125rem' }}
                    />
                    <span style={{ fontSize: '0.65rem', color: '#71717a', marginTop: '0.2rem', display: 'block' }}>
                      Alerts when total stock ≤ this
                    </span>
                  </div>
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
