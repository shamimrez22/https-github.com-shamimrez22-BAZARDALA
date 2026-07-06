import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, onSnapshot, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { GoogleGenAI } from '@google/genai';

import { useLocation } from 'react-router-dom';
import { optimizeProductImage } from '../../lib/image-utils';

const AdminProducts = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === '/admin/products/add') {
      setIsAddOpen(true);
    }
  }, [location.pathname]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    oldPrice: '',
    discountPercentage: '',
    category: '',
    stock: '',
    description: '',
    images: [] as string[],
    affiliateLink: '',
    deliveryChargeInsideDhaka: '60',
    deliveryChargeOutsideDhaka: '120',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const optimized = await optimizeProductImage(reader.result as string);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, optimized]
          }));
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    fetchProducts();
    fetchCategories();
  }, [authLoading, isAdmin]);

  // Automatic Discount Percentage Calculation
  useEffect(() => {
    const price = parseFloat(formData.price);
    const oldPrice = parseFloat(formData.oldPrice);
    
    if (price && oldPrice && oldPrice > price) {
      const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
      if (formData.discountPercentage !== discount.toString()) {
        setFormData(prev => ({
          ...prev,
          discountPercentage: discount.toString()
        }));
      }
    } else if (price && oldPrice && oldPrice <= price) {
      if (formData.discountPercentage !== '0') {
        setFormData(prev => ({
          ...prev,
          discountPercentage: '0'
        }));
      }
    }
  }, [formData.price, formData.oldPrice]);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      setCategoriesList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Categories fetch error:', error);
    }
  };

  const fetchProducts = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const productsRef = collection(db, 'products');
      let q = query(productsRef, orderBy('createdAt', 'desc'), limit(20));

      if (isLoadMore && lastDoc) {
        q = query(productsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(20));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Product));

      if (isLoadMore) {
        setProducts(prev => [...prev, ...data]);
      } else {
        setProducts(data);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 20);
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempId = Math.random().toString(36).substr(2, 9);
    const originalProducts = [...products];
    
    try {
      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : 0,
        discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : 0,
        category: formData.category,
        stock: parseInt(formData.stock),
        description: formData.description,
        images: formData.images,
        affiliateLink: formData.affiliateLink,
        deliveryChargeInsideDhaka: parseFloat(formData.deliveryChargeInsideDhaka || '0'),
        deliveryChargeOutsideDhaka: parseFloat(formData.deliveryChargeOutsideDhaka || '0'),
        ratings: 4.5,
        updatedAt: serverTimestamp(),
      };

      // Optimistic Update
      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
      } else {
        const optimisticProduct = { id: tempId, ...data, createdAt: new Date() } as any;
        setProducts(prev => [optimisticProduct, ...prev]);
      }

      setIsAddOpen(false);
      const isEditing = !!editingProduct;
      const editingId = editingProduct?.id;
      
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: '', stock: '', description: '', images: [], affiliateLink: '' });

      if (isEditing) {
        await updateDoc(doc(db, 'products', editingId!), data);
        toast.success('Product updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });
        // Update the temp ID with real ID
        setProducts(prev => prev.map(p => p.id === tempId ? { ...p, id: docRef.id } : p));
        toast.success('Product added successfully');
      }
    } catch (error) {
      console.error('Submit product error:', error);
      setProducts(originalProducts); // Revert on error
      toast.error('Failed to save product. Reverting changes.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    const originalProducts = [...products];
    try {
      // Optimistic Delete
      setProducts(prev => prev.filter(p => p.id !== id));
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      setProducts(originalProducts); // Revert on error
      toast.error('Failed to delete product. Reverting changes.');
    }
  };

  const handleAiGenerate = async () => {
    if (!formData.name) {
      toast.error('Please enter a product name first');
      return;
    }
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a premium, professional eCommerce product description for: ${formData.name}. Keep it concise and persuasive.`,
      });
      setFormData({ ...formData, description: response.text || '' });
      toast.success('AI Description generated!');
    } catch (error) {
      console.error('AI error:', error);
      toast.error('AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f4efe6]">
      <div className="bg-[#ead9c4] border-b-2 border-slate-900 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#8B1E1E] uppercase tracking-tight flex items-center gap-3">
            Product <span className="text-slate-900">Inventory</span>
          </h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
            Global Stock Ledger // Operation Protocol 42 // {products.length} Active Items
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setEditingProduct(null);
            setFormData({ name: '', price: '', category: '', stock: '', description: '', images: [], affiliateLink: '' });
          }
        }}>
          <DialogTrigger asChild>
            <button className="bg-[#8B1E1E] hover:bg-slate-950 text-white h-10 px-6 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all border-2 border-slate-900 shadow-sm cursor-pointer flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-none p-0 border-2 border-slate-900 shadow-2xl bg-[#faf6f0]">
            <div className="p-8">
              <DialogHeader className="mb-8 border-b-2 border-slate-900/10 pb-6">
                <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                  {editingProduct ? 'Edit' : 'Create'} <span className="text-[#8B1E1E]">Product</span>
                </DialogTitle>
                <p className="text-slate-500 font-bold text-[10px] uppercase mt-1">Update product registry information</p>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Product Name</Label>
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Premium T-Shirt"
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-bold text-xs focus-visible:ring-0 focus:border-brand-primary"
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category</Label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full h-10 bg-slate-50 border border-slate-200 text-slate-900 rounded-none font-bold text-xs focus:ring-1 focus:ring-brand-primary outline-none px-2 uppercase"
                      required
                    >
                      <option value="">SELECT CATEGORY</option>
                      {categoriesList.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Selling Price (৳)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-bold text-xs focus-visible:ring-0 focus:border-brand-primary"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Old Price (৳) - Strikethrough</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={formData.oldPrice} 
                      onChange={e => setFormData({...formData, oldPrice: e.target.value})}
                      placeholder="Optional"
                      className="h-10 bg-slate-50 border-slate-200 text-slate-400 rounded-none font-bold text-xs focus-visible:ring-0 focus:border-brand-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex justify-between">
                      Discount %
                      <span className="text-[8px] text-brand-primary opacity-70">AUTO-CALCULATED</span>
                    </Label>
                    <Input 
                      type="number" 
                      value={formData.discountPercentage} 
                      onChange={e => setFormData({...formData, discountPercentage: e.target.value})}
                      placeholder="e.g. 10"
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-bold text-xs focus-visible:ring-0 focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Available Stock</Label>
                    <Input 
                      type="number" 
                      value={formData.stock} 
                      onChange={e => setFormData({...formData, stock: e.target.value})}
                      placeholder="QUANTITY"
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-bold text-xs focus-visible:ring-0 focus:border-brand-primary"
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Delivery Inside Dhaka (৳)</Label>
                    <Input 
                      type="number" 
                      value={formData.deliveryChargeInsideDhaka} 
                      onChange={e => setFormData({...formData, deliveryChargeInsideDhaka: e.target.value})}
                      placeholder="60"
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-bold text-xs focus-visible:ring-0 focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Delivery Outside Dhaka (৳)</Label>
                    <Input 
                      type="number" 
                      value={formData.deliveryChargeOutsideDhaka} 
                      onChange={e => setFormData({...formData, deliveryChargeOutsideDhaka: e.target.value})}
                      placeholder="120"
                      className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-bold text-xs focus-visible:ring-0 focus:border-brand-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Affiliate / External Link (Optional)</Label>
                  <Input 
                    value={formData.affiliateLink} 
                    onChange={e => setFormData({...formData, affiliateLink: e.target.value})}
                    placeholder="https://example.com/product-page"
                    className="h-10 bg-slate-50 border-slate-200 text-slate-900 rounded-none font-bold text-xs focus-visible:ring-0 focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Product Description</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-3 bg-white border-slate-200 text-[9px] font-black uppercase rounded-none hover:bg-slate-50"
                        onClick={handleAiGenerate}
                        disabled={aiLoading}
                      >
                        <Sparkles className="h-3 w-3 mr-2" /> {aiLoading ? 'GENERATING...' : 'Generate Description with AI'}
                      </Button>
                  </div>
                  <textarea
                    className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 text-slate-900 focus:border-brand-primary outline-none text-xs font-bold leading-relaxed transition-colors"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your product..."
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Product Images</Label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative aspect-square border border-slate-200 group bg-slate-50">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (window.confirm('Remove this image?')) {
                                removeImage(i);
                              }
                            }}
                            className="absolute bottom-0 left-0 right-0 h-6 bg-rose-600/90 text-white flex items-center justify-center font-black text-[8px] z-10 hover:bg-rose-700"
                          >
                            Remove
                          </button>
                      </div>
                    ))}
                    <div className="relative aspect-square border border-dashed border-slate-200 hover:border-brand-primary hover:bg-slate-50 transition-all flex flex-col items-center justify-center cursor-pointer group">
                      <Plus className="h-5 w-5 text-slate-400 group-hover:text-brand-primary" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 bg-[#8B1E1E] hover:bg-slate-950 text-white rounded-none font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 border-2 border-slate-900 shadow-sm cursor-pointer">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-8">
        <div className="bg-[#faf6f0] border-2 border-slate-900 shadow-sm overflow-hidden">
          <div className="p-4 bg-[#ead9c4]/30 border-b-2 border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-10 bg-white border-2 border-slate-900 text-[10px] font-black uppercase tracking-widest focus:border-[#8B1E1E] outline-none text-slate-900 placeholder:text-slate-300 transition-colors shadow-sm"
              />
            </div>
            <div className="flex items-center gap-4">
               <div className="px-4 py-1.5 bg-[#faf6f0] border-2 border-slate-900 shadow-sm flex flex-col items-center min-w-[120px]">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Inventory Value</span>
                  <span className="text-xs font-black text-slate-900">৳{filteredProducts.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0).toLocaleString()}</span>
               </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#8B1E1E] text-white">
                <tr>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em] border-r border-white/10">
                    <div className="flex flex-col">
                      <span>IMAGE</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(ছবি)</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em] border-r border-white/10">
                    <div className="flex flex-col">
                      <span>PRODUCT NAME</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(পণ্যের নাম)</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em] border-r border-white/10">
                    <div className="flex flex-col">
                      <span>CATEGORY</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(ক্যাটাগরি)</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em] border-r border-white/10">
                    <div className="flex flex-col">
                      <span>PRICE</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(মূল্য)</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em] border-r border-white/10">
                    <div className="flex flex-col">
                      <span>STOCK</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(স্টক)</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em]">
                    <div className="flex flex-col">
                      <span>ACTIONS</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(পদক্ষেপ)</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/10 bg-[#faf6f0]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20 font-black text-[10px] uppercase text-slate-400">Loading Catalog...</td>
                  </tr>
                ) : filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#ebd9c4]/10 transition-all font-bold group">
                    <td className="px-6 py-4 border-r border-slate-900/10">
                      <div className="w-12 h-12 border-2 border-slate-900/10 bg-slate-50 overflow-hidden">
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-900/10">
                      <p className="font-black text-slate-900 text-[11px] uppercase tracking-tight leading-tight">{product.name || 'NULL_DATA'}</p>
                      <p className="text-[8px] text-slate-400 font-mono mt-1 opacity-60">REF_ID: {(product.id || '').slice(0, 10).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-900/10">
                      <span className="text-[8px] font-black uppercase py-1 px-3 bg-[#f4efe6] text-slate-500 border border-slate-900/10">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-900/10">
                      <span className="font-black text-slate-900 text-sm tracking-tighter">৳{(product.price || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-900/10">
                      <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[8px] font-black uppercase">
                        <span className={product.stock < 10 ? 'text-rose-600' : 'text-slate-400'}>
                          {product.stock < 10 ? 'Low Stock' : 'In Stock'}
                        </span>
                        <span className="text-slate-900">{product.stock} units</span>
                      </div>
                        <div className="w-full h-1 bg-slate-900/10 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 ${product.stock < 10 ? 'bg-rose-600' : 'bg-[#8B1E1E]'}`}
                            style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingProduct(product);
                            setFormData({
                              name: product.name,
                              price: product.price.toString(),
                              oldPrice: product.oldPrice?.toString() || '',
                              discountPercentage: product.discountPercentage?.toString() || '',
                              category: product.category,
                              stock: product.stock.toString(),
                              description: product.description,
                              images: product.images,
                              affiliateLink: product.affiliateLink || '',
                              deliveryChargeInsideDhaka: product.deliveryChargeInsideDhaka?.toString() || '0',
                              deliveryChargeOutsideDhaka: product.deliveryChargeOutsideDhaka?.toString() || '0',
                            });
                            setIsAddOpen(true);
                          }}
                          className="h-8 px-4 bg-[#faf6f0] border-2 border-slate-900 text-slate-900 text-[8px] font-black uppercase hover:bg-[#ebd9c4]/30 transition-all cursor-pointer shadow-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (deletingId === product.id) {
                              handleDelete(product.id);
                              setDeletingId(null);
                            } else {
                              setDeletingId(product.id);
                              setTimeout(() => setDeletingId(null), 3000);
                            }
                          }}
                          className={`h-8 flex items-center justify-center border-2 border-slate-900 transition-all cursor-pointer shadow-sm ${
                            deletingId === product.id 
                              ? "bg-rose-600 text-white border-rose-600 px-4 min-w-[80px]" 
                              : "px-4 bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white"
                          }`}
                        >
                          {deletingId === product.id ? "SURE?" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="p-10 flex justify-center border-t border-slate-900/10">
              <button 
                onClick={() => fetchProducts(true)} 
                disabled={loadingMore}
                className="bg-[#8B1E1E] hover:bg-slate-950 text-white font-black uppercase tracking-[0.2em] px-12 py-4 text-[10px] active:scale-95 transition-all border-2 border-slate-900 shadow-sm cursor-pointer"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
