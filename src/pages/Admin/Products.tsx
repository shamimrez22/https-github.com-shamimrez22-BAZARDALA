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

import { optimizeProductImage } from '../../lib/image-utils';

const AdminProducts = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    images: [] as string[],
    affiliateLink: '',
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
    try {
      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        description: formData.description,
        images: formData.images,
        affiliateLink: formData.affiliateLink,
        ratings: 4.5,
        createdAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), data);
        toast.success('Product updated successfully');
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
      } else {
        const docRef = await addDoc(collection(db, 'products'), data);
        toast.success('Product added successfully');
        setProducts(prev => [{ id: docRef.id, ...data } as Product, ...prev]);
      }

      setIsAddOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: '', stock: '', description: '', images: [], affiliateLink: '' });
    } catch (error) {
      console.error('Submit product error:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    toast('Delete this product?', {
      action: {
        label: 'Confirm Delete',
        onClick: async () => {
          try {
            await deleteDoc(doc(db, 'products', id));
            toast.success('Product deleted');
            setProducts(prev => prev.filter(p => p.id !== id));
          } catch (error) {
            toast.error('Failed to delete product');
          }
        }
      },
    });
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
    <div className="space-y-6">
      <div className="bg-[#ead9c4] border border-[#777] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight flex items-center gap-3">
            Product <span className="text-slate-900">Inventory</span>
          </h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
            Manage your store items // All Products
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
            <Button className="bg-[#9B2B2C] hover:bg-[#7a1f1f] text-white rounded-none h-10 px-6 font-black text-[10px] uppercase tracking-widest border border-white/20 shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-none p-0 border border-[#777] shadow-2xl bg-[#f4e4d4]">
            <div className="p-8">
              <DialogHeader className="mb-8 border-b border-[#777]/30 pb-6">
                <DialogTitle className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight">
                  {editingProduct ? 'Edit' : 'Add'} <span className="text-slate-900">Product</span>
                </DialogTitle>
                <p className="text-slate-500 font-bold text-[10px] uppercase mt-1">Update your shop inventory // {new Date().getFullYear()}</p>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">Product Name</Label>
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. PREMIUM T-SHIRT"
                      className="h-10 bg-white border-[#777] text-slate-900 rounded-none font-bold text-xs focus:ring-0 focus:border-[#9B2B2C] uppercase"
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">Category</Label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full h-10 bg-white border border-[#777] text-slate-900 rounded-none font-bold text-xs focus:ring-1 focus:ring-[#9B2B2C] outline-none px-2 uppercase"
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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">Price (৳)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      className="h-10 bg-white border-[#777] text-slate-900 rounded-none font-bold text-xs focus:ring-0 focus:border-[#9B2B2C]"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">Available Stock</Label>
                    <Input 
                      type="number" 
                      value={formData.stock} 
                      onChange={e => setFormData({...formData, stock: e.target.value})}
                      placeholder="QUANTITY"
                      className="h-10 bg-white border-[#777] text-slate-900 rounded-none font-bold text-xs focus:ring-0 focus:border-[#9B2B2C]"
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">Affiliate / External Link (Optional)</Label>
                  <Input 
                    value={formData.affiliateLink} 
                    onChange={e => setFormData({...formData, affiliateLink: e.target.value})}
                    placeholder="https://example.com/product-page"
                    className="h-10 bg-white border-[#777] text-slate-900 rounded-none font-bold text-xs focus:ring-0 focus:border-[#9B2B2C]"
                  />
                  <p className="text-[8px] text-slate-500 font-bold uppercase italic mt-1">* If provided, "Order Now" will redirect to this external link.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">Product Description</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-3 bg-white border-[#777] text-[9px] font-black uppercase rounded-none hover:bg-[#ead9c4]"
                      onClick={handleAiGenerate}
                      disabled={aiLoading}
                    >
                      <Sparkles className="h-3 w-3 mr-2" /> {aiLoading ? 'GENERATING...' : 'AI WRITE'}
                    </Button>
                  </div>
                  <textarea
                    className="w-full min-h-[120px] p-4 bg-white border border-[#777] text-slate-900 focus:ring-0 focus:border-[#9B2B2C] outline-none text-xs font-bold leading-relaxed"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your product..."
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">Product Images</Label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative aspect-square border border-[#777] group bg-white">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeImage(i);
                          }}
                          className="absolute inset-0 bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all font-black text-[9px] z-10"
                        >
                          REMOVE
                        </button>
                      </div>
                    ))}
                    <div className="relative aspect-square border-2 border-dashed border-[#777]/30 hover:border-[#9B2B2C] hover:bg-white transition-all flex flex-col items-center justify-center cursor-pointer group">
                      <Plus className="h-6 w-6 text-slate-400 group-hover:text-[#9B2B2C]" />
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
                <Button type="submit" className="w-full h-12 bg-[#9B2B2C] hover:bg-[#7a1f1f] text-white rounded-none font-black text-[11px] uppercase tracking-widest shadow-xl">
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-[#ead9c4] border border-[#777] overflow-hidden">
        <div className="p-6 border-b border-[#777]/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              placeholder="Search Products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-white border border-[#777] text-xs font-bold focus:ring-0 focus:border-[#9B2B2C] outline-none text-slate-900 placeholder:text-slate-400 placeholder:uppercase"
            />
          </div>
          <div className="bg-white px-4 py-2 border border-[#777] flex flex-col items-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Inventory Value</span>
            <span className="text-xs font-black text-[#9B2B2C]">৳{filteredProducts.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0).toLocaleString()}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#9B2B2C] text-white">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Image</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Product NAME</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Price</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Stock Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#777]/30 bg-white/20">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 font-black text-[10px] uppercase text-slate-500">Loading product list...</td>
                </tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#ead9c4]/30 transition-all font-bold group">
                  <td className="px-6 py-6 border-r border-[#777]/20">
                    <div className="w-16 h-16 border border-[#777] bg-white overflow-hidden">
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                    </div>
                  </td>
                  <td className="px-6 py-6 border-r border-[#777]/20">
                    <p className="font-black text-slate-900 text-xs uppercase">{product.name || 'Untitled'}</p>
                    <p className="text-[8px] text-slate-500 font-mono mt-1">UID://{(product.id || '').slice(0, 10).toUpperCase()}</p>
                  </td>
                  <td className="px-6 py-6 border-r border-[#777]/20">
                    <span className="text-[9px] font-black uppercase py-1 px-3 border border-[#777]/30 bg-[#ead9c4] text-slate-700">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-6 border-r border-[#777]/20">
                    <span className="font-black text-slate-900">৳{(product.price || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-6 border-r border-[#777]/20">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase">
                        <span className={product.stock < 10 ? 'text-rose-600' : 'text-slate-500'}>
                          {product.stock < 10 ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                        <span>{product.stock} items</span>
                      </div>
                      <div className="w-24 h-1 bg-white border border-[#777]/20 overflow-hidden">
                        <div 
                          className={`h-full ${product.stock < 10 ? 'bg-rose-600' : 'bg-[#9B2B2C]'}`}
                          style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-4 rounded-none bg-white border-[#777] text-[8px] font-black uppercase hover:bg-[#ead9c4]"
                        onClick={() => {
                          setEditingProduct(product);
                          setFormData({
                            name: product.name,
                            price: product.price.toString(),
                            category: product.category,
                            stock: product.stock.toString(),
                            description: product.description,
                            images: product.images,
                            affiliateLink: product.affiliateLink || '',
                          });
                          setIsAddOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-8 px-4 rounded-none bg-[#9B2B2C] text-white text-[8px] font-black uppercase"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div className="p-8 flex justify-center border-t border-[#777]/30 bg-[#f4e4d4]/20">
            <Button 
              onClick={() => fetchProducts(true)} 
              disabled={loadingMore}
              className="bg-[#9B2B2C] hover:bg-slate-900 text-white font-black uppercase tracking-widest px-10 h-12 rounded-none shadow-[4px_4px_0px_#000] transition-all"
            >
              {loadingMore ? 'Syncing...' : 'Load More Products'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
