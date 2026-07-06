import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
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
  Layers,
  Tag,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { optimizeProductImage } from '../../lib/image-utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  createdAt: any;
}

const AdminCategories = () => {
  const { isAdmin, authLoading } = useAuth() as any;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const optimized = await optimizeProductImage(reader.result as string);
        setFormData(prev => ({ ...prev, image: optimized }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    fetchCategories();
  }, [authLoading, isAdmin]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(data);
    } catch (error) {
      console.error('Fetch categories error:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempId = Math.random().toString(36).substr(2, 9);
    const originalCategories = [...categories];
    
    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      const data = {
        name: formData.name,
        slug,
        image: formData.image || '',
        updatedAt: serverTimestamp(),
      };

      // Optimistic Update
      if (editingCategory) {
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...data } : c));
      } else {
        const optimisticCategory = { id: tempId, ...data, createdAt: new Date() } as any;
        setCategories(prev => [...prev, optimisticCategory].sort((a, b) => a.name.localeCompare(b.name)));
      }

      setIsAddOpen(false);
      const isEditing = !!editingCategory;
      const editingId = editingCategory?.id;
      
      setEditingCategory(null);
      setFormData({ name: '', image: '' });

      if (isEditing) {
        await updateDoc(doc(db, 'categories', editingId!), data);
        toast.success('Category updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'categories'), {
          ...data,
          createdAt: serverTimestamp()
        });
        // Update real ID
        setCategories(prev => prev.map(c => c.id === tempId ? { ...c, id: docRef.id } : c));
        toast.success('Category added successfully');
      }
    } catch (error) {
      console.error('Submit category error:', error);
      setCategories(originalCategories);
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category permanently?')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast.success('Category deleted');
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f4efe6]">
      <div className="bg-[#ead9c4] border-b-2 border-slate-900 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#8B1E1E] uppercase tracking-tight flex items-center gap-3">
            Registered <span className="text-slate-900">Categories</span>
          </h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
            Section Registry Mapping // Operation Protocol 12 // {categories.length} Categories
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setEditingCategory(null);
            setFormData({ name: '', image: '' });
          }
        }}>
          <DialogTrigger asChild>
            <button className="bg-[#8B1E1E] hover:bg-slate-950 text-white h-10 px-6 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all border-2 border-slate-900 shadow-sm cursor-pointer flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> Add Category
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-none p-0 border-2 border-slate-900 shadow-2xl bg-[#faf6f0]">
            <div className="p-8">
              <DialogHeader className="mb-8 border-b-2 border-slate-900/10 pb-6">
                <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                  {editingCategory ? 'Edit' : 'Add'} <span className="text-[#8B1E1E]">Category</span>
                </DialogTitle>
                <p className="text-slate-500 font-bold text-[10px] uppercase mt-1">Update category information</p>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. ELECTRONICS, CLOTHING"
                    className="h-10 bg-white border-2 border-slate-900 text-slate-900 rounded-none font-bold text-xs focus:border-[#8B1E1E] outline-none focus-visible:ring-0 uppercase shadow-sm"
                    required 
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category Image</Label>
                  <div className="relative aspect-square w-32 border-2 border-slate-900 flex flex-col items-center justify-center bg-white group cursor-pointer overflow-hidden transition-colors hover:border-[#8B1E1E] shadow-sm">
                    {formData.image ? (
                      <>
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (window.confirm('Remove this category image?')) {
                              setFormData(prev => ({ ...prev, image: '' }));
                            }
                          }}
                          className="absolute bottom-0 left-0 right-0 h-6 bg-rose-600/90 text-white flex items-center justify-center font-black text-[8px] z-10 hover:bg-rose-700"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-5 w-5 text-slate-300 group-hover:text-[#8B1E1E] transition-colors" />
                        <span className="text-[8px] font-black text-slate-400 mt-2 tracking-widest">Upload Image</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 bg-[#8B1E1E] hover:bg-slate-950 text-white rounded-none font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 border-2 border-slate-900 cursor-pointer shadow-sm"
                >
                  {loading ? 'Processing...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-8">
        <div className="bg-[#faf6f0] border-2 border-slate-900 shadow-sm overflow-hidden">
          <div className="p-4 bg-[#ead9c4]/30 border-b-2 border-slate-900">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search categories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-10 bg-white border-2 border-slate-900 text-[10px] font-black uppercase tracking-widest focus:border-[#8B1E1E] outline-none transition-colors shadow-sm"
                />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#8B1E1E] text-white">
                <tr>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em] border-r border-white/10">
                    <div className="flex flex-col">
                      <span>ICON</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(আইকন)</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em] border-r border-white/10">
                    <div className="flex flex-col">
                      <span>CATEGORY NAME</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(ক্যাটাগরি)</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.1em] border-r border-white/10">
                    <div className="flex flex-col">
                      <span>URL SLUG</span>
                      <span className="text-[8px] opacity-80 font-bold tracking-normal">(স্লাগ)</span>
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
                    <td colSpan={4} className="text-center py-20 font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">Loading Categories...</td>
                  </tr>
                ) : filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-[#ebd9c4]/10 transition-all font-bold group">
                    <td className="px-6 py-4 border-r border-slate-900/10">
                      <div className="w-12 h-12 border-2 border-slate-900/10 bg-slate-50 overflow-hidden">
                        {category.image ? (
                          <img src={category.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-900/10">
                      <span className="text-[11px] font-black uppercase text-slate-900 tracking-tight">{category.name}</span>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-900/10">
                      <code className="text-[9px] font-mono text-slate-600 bg-[#f4efe6] border border-slate-900/10 px-2 py-1 tracking-tight">/{category.slug}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingCategory(category);
                            setFormData({ 
                              name: category.name,
                              image: category.image || ''
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
                            if (deletingId === category.id) {
                              handleDelete(category.id);
                              setDeletingId(null);
                            } else {
                              setDeletingId(category.id);
                              setTimeout(() => setDeletingId(null), 3000);
                            }
                          }}
                          className={`h-8 flex items-center justify-center border-2 border-slate-900 transition-all cursor-pointer shadow-sm ${
                            deletingId === category.id 
                              ? "bg-rose-600 text-white border-rose-600 px-4 min-w-[80px]" 
                              : "px-4 bg-rose-50 text-rose-600 text-[8px] font-black uppercase hover:bg-rose-600 hover:text-white"
                          }`}
                        >
                          {deletingId === category.id ? "SURE?" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCategories.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center font-black text-[10px] uppercase text-slate-400 tracking-[0.2em]">No categories found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
