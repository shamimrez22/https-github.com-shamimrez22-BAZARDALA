import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Plus, 
  Zap, 
  X, 
  Search, 
  Save,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '../../types';

const AdminLimitedOffers = () => {
  const { isAdmin, authLoading } = useAuth() as any;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [config, setConfig] = useState({
    limit: 6,
    productIds: [] as string[]
  });

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    fetchData();
  }, [authLoading, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Config
      const configDoc = await getDoc(doc(db, 'settings', 'limited_offers'));
      if (configDoc.exists()) {
        setConfig(prev => ({ ...prev, ...configDoc.data() }));
      }

      // Fetch all products for selection
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setAllProducts(productsData);
    } catch (error) {
      console.error('Fetch limited offers error:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'limited_offers'), config);
      toast.success('Limited Offers updated! Protocol Secured.');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const toggleProduct = (id: string) => {
    setConfig(prev => {
      const isSelected = prev.productIds.includes(id);
      if (isSelected) {
        return { ...prev, productIds: prev.productIds.filter(pid => pid !== id) };
      } else {
        return { ...prev, productIds: [...prev.productIds, id] };
      }
    });
  };

  const selectedProducts = allProducts.filter(p => config.productIds.includes(p.id));
  const availableProducts = allProducts.filter(p => 
    !config.productIds.includes(p.id) && 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#9B2B2C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-[#ead9c4] border border-[#777] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight flex items-center gap-3">
            Limited <span className="text-slate-900">Offers</span>
          </h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
            Flash Sale Configuration // Operation Protocol 77
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#9B2B2C] hover:bg-slate-900 text-white rounded-none h-12 px-8 font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-3"
        >
          <Save className="h-4 w-4" /> {saving ? 'SYNCING...' : 'Save Configuration'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Module */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#ead9c4] border border-[#777] p-6">
            <h2 className="text-xs font-black text-[#9B2B2C] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap className="h-4 w-4" /> Global Settings
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-500">Max display limit</Label>
                <Input 
                  type="number" 
                  value={config.limit} 
                  onChange={e => setConfig({...config, limit: parseInt(e.target.value) || 0})}
                  className="bg-white border-[#777] rounded-none h-12 text-xs font-black focus:ring-1 focus:ring-[#9B2B2C]"
                />
                <p className="text-[8px] text-slate-400 font-bold uppercase italic mt-1">* Recommended: 6-12 products</p>
              </div>
            </div>
          </div>

          <div className="bg-[#9B2B2C] border border-[#777] p-6 text-white prose dark:prose-invert">
            <h3 className="text-xs font-black uppercase tracking-widest mb-3">Protocol Info</h3>
            <p className="text-[10px] leading-relaxed font-bold opacity-80 uppercase">
              Selected products will appear in the "FLASH SALE" section on the homepage. 
              The system will respect the display limit even if more products are selected.
            </p>
          </div>
        </div>

        {/* Product Selection Module */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected List */}
          <div className="bg-white border border-[#777] shadow-lg">
            <div className="bg-[#ead9c4]/50 p-4 border-b border-[#777]/30 flex justify-between items-center">
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Selections ({config.productIds.length})</h3>
               {config.productIds.length > config.limit && (
                 <span className="text-[8px] bg-rose-600 text-white px-2 py-0.5 font-black uppercase tracking-tighter">Limit Exceeded</span>
               )}
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[100px]">
              {selectedProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between border border-[#777]/20 p-2 bg-[#f4e4d4]/10 group">
                  <div className="flex items-center gap-3">
                    <img src={product.images[0]} alt="" className="w-10 h-10 object-cover border border-[#777]/30" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-900 truncate max-w-[120px]">{product.name}</p>
                      <p className="text-[8px] font-bold text-[#9B2B2C]">৳{product.price}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => toggleProduct(product.id)}
                    className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {selectedProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-slate-400 py-10 opacity-50">
                  <ShoppingBag className="h-8 w-8 mb-2" />
                  <p className="text-[10px] font-black uppercase">No Products Selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Search & Add */}
          <div className="bg-[#ead9c4] border border-[#777]">
             <div className="p-4 border-b border-[#777]/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    placeholder="SEARCH PRODUCTS TO ADD..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-[#777] pl-10 h-12 text-[10px] font-black focus:outline-none focus:border-[#9B2B2C] placeholder:text-slate-300"
                  />
                </div>
             </div>
             <div className="max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-1 divide-y divide-[#777]/20">
                  {availableProducts.slice(0, 10).map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-white/50 hover:bg-white transition-all group">
                       <div className="flex items-center gap-4">
                          <img src={product.images[0]} alt="" className="w-12 h-12 object-cover grayscale group-hover:grayscale-0 transition-all border border-[#777]/20" />
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-900">{product.name}</p>
                            <p className="text-[9px] font-bold text-slate-500">{product.category}</p>
                          </div>
                       </div>
                       <Button 
                        onClick={() => toggleProduct(product.id)}
                        className="bg-slate-900 hover:bg-[#9B2B2C] text-white rounded-none h-8 px-4 font-black text-[9px] uppercase tracking-widest"
                       >
                         <Plus className="h-3 w-3 mr-2" /> Add
                       </Button>
                    </div>
                  ))}
                  {availableProducts.length === 0 && (
                    <div className="p-10 text-center text-slate-400 font-black text-[10px] uppercase">
                      No matching products
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLimitedOffers;
