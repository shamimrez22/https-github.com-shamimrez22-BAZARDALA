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
    setLoading(true);
    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      const data = {
        name: formData.name,
        slug,
        image: formData.image || '',
        updatedAt: serverTimestamp(),
      };

      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), data);
        toast.success('Category updated successfully');
      } else {
        await addDoc(collection(db, 'categories'), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast.success('Category added successfully');
      }

      setIsAddOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', image: '' });
      await fetchCategories();
    } catch (error) {
      console.error('Submit category error:', error);
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    toast('PROTOCOL_WIPE: Delete Category?', {
      action: {
        label: 'Confirm',
        onClick: async () => {
          try {
            await deleteDoc(doc(db, 'categories', id));
            toast.success('Category deleted');
            setCategories(prev => prev.filter(c => c.id !== id));
          } catch (error) {
            toast.error('Failed to delete category');
          }
        }
      }
    });
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-[#ead9c4] border border-[#777] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight flex items-center gap-3">
            Product <span className="text-slate-900">Categories</span>
          </h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
            Manage your store hierarchy // Categories
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
            <Button className="bg-[#9B2B2C] hover:bg-[#7a1f1f] text-white rounded-none h-10 px-6 font-black text-[10px] uppercase tracking-widest border border-white/20 shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Add New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-none p-0 border border-[#777] shadow-2xl bg-[#f4e4d4]">
            <div className="p-8">
              <DialogHeader className="mb-6 border-b border-[#777]/30 pb-4">
                <DialogTitle className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight">
                  {editingCategory ? 'Edit' : 'Add'} <span className="text-slate-900">Category</span>
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">Category Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. ELECTRONICS, CLOTHING"
                    className="h-10 bg-white border-[#777] text-slate-900 rounded-none font-bold text-xs focus:ring-0 focus:border-[#9B2B2C] uppercase"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#9B2B2C]">Category Image</Label>
                  <div className="relative aspect-square w-32 border-2 border-dashed border-[#777]/30 flex flex-col items-center justify-center bg-white group cursor-pointer overflow-hidden">
                    {formData.image ? (
                      <>
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                        <span className="text-[8px] font-black text-slate-400 mt-1">UPLOAD</span>
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
                  className="w-full h-12 bg-[#9B2B2C] hover:bg-[#7a1f1f] text-white rounded-none font-black text-[11px] uppercase tracking-widest shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Processing...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-[#ead9c4] border border-[#777] overflow-hidden">
        <div className="p-6 border-b border-[#777]/30">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              placeholder="Search Categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-white border border-[#777] text-xs font-bold focus:ring-0 focus:border-[#9B2B2C] outline-none text-slate-900 placeholder:text-slate-400 placeholder:uppercase"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table className="w-full text-left border-collapse">
            <TableHeader className="bg-[#9B2B2C] text-white">
              <TableRow className="hover:bg-[#9B2B2C] border-none">
                <TableHead className="w-20 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white border-r border-white/20">Image</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white border-r border-white/20">Name</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white border-r border-white/20">Slug</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#777]/30 bg-white/20">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-20 font-black text-[10px] uppercase text-slate-500">Loading Categories...</TableCell>
                </TableRow>
              ) : filteredCategories.map((category) => (
                <TableRow key={category.id} className="hover:bg-[#ead9c4]/30 transition-all font-bold group">
                  <TableCell className="px-6 py-6 border-r border-[#777]/20">
                    <div className="w-12 h-12 border border-[#777] bg-white overflow-hidden">
                      {category.image ? (
                        <img src={category.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6 border-r border-[#777]/20">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase text-slate-900">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6 border-r border-[#777]/20">
                    <code className="text-[10px] font-mono text-slate-500 bg-white/50 px-2 py-1">/{category.slug}</code>
                  </TableCell>
                  <TableCell className="px-6 py-6">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-4 rounded-none bg-white border-[#777] text-[8px] font-black uppercase hover:bg-[#ead9c4]"
                        onClick={() => {
                          setEditingCategory(category);
                          setFormData({ 
                            name: category.name,
                            image: category.image || ''
                          });
                          setIsAddOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-8 px-4 rounded-none bg-[#9B2B2C] text-white text-[8px] font-black uppercase"
                        onClick={() => handleDelete(category.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCategories.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-20 font-black text-[10px] uppercase text-slate-500">No Categories Found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
