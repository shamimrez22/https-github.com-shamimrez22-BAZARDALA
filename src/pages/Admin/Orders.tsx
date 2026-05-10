import React, { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  getDocs,
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  deleteDoc,
  where,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  getCountFromServer,
  Timestamp
} from 'firebase/firestore';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Search, 
  Eye, 
  MoreVertical, 
  Download,
  Filter,
  CheckCircle2,
  Timer,
  Package,
  Truck,
  FileText,
  Trash2,
  Check,
  XCircle,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSettings } from '../../context/SettingsContext';

const AdminOrders = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusFilter = searchParams.get('status');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    if (searchQuery) {
      setSearch(searchQuery);
    }
  }, [searchQuery]);

  const ORDERS_PER_PAGE = 15;

  const fetchOrders = useCallback(async (isNextPage = false) => {
    if (authLoading || !isAdmin) return;
    
    // Check if truly authenticated to prevent rules error
    if (!auth.currentUser) {
      console.warn("ADMIN_DATA_FETCH: No active Firebase session. Permissions may fail.");
    }

    if (isNextPage) setLoadingMore(true);
    else setLoading(true);

    try {
      const ordersCol = collection(db, 'orders');
      
      let q;
      if (statusFilter) {
        // When filtering by status, we must ensure the query is simple
        // to avoid index requirement during first load.
        q = query(
          ordersCol,
          where('status', '==', statusFilter),
          limit(ORDERS_PER_PAGE)
        );
      } else {
        // Unfiltered: Try ordering by createdAt
        // If this fails (e.g. index error), fallback to simple query
        q = query(
          ordersCol,
          orderBy('createdAt', 'desc'),
          limit(ORDERS_PER_PAGE)
        );
      }

      if (isNextPage && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (innerErr: any) {
        if (!statusFilter && innerErr.message?.includes('index')) {
          console.warn('FALLBACK: Index missing for sorted orders, using non-sorted query');
          snapshot = await getDocs(query(ordersCol, limit(ORDERS_PER_PAGE)));
        } else {
          throw innerErr;
        }
      }
      
      const newOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));

      if (isNextPage) {
        setOrders(prev => [...(prev || []), ...newOrders]);
      } else {
        setOrders(newOrders);
      }

      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      } else if (!isNextPage) {
        setLastDoc(null);
      }
      
      setHasMore(snapshot.docs.length === ORDERS_PER_PAGE);
    } catch (error: any) {
      console.error('Fetch orders error final:', error);
      const msg = error.code === 'permission-denied' 
        ? 'Data Access Denied: Database Security Protocol Restriction' 
        : 'Sync Failure: ' + (error.message || 'Network issue');
      toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [authLoading, isAdmin, statusFilter, lastDoc]);

  useEffect(() => {
    setOrders([]);
    setLastDoc(null);
    setHasMore(true);
    fetchOrders(false);
  }, [statusFilter, isAdmin, authLoading]);

  const updateStatus = async (id: string, status: string) => {
    const originalOrders = [...orders];
    try {
      // Optimistic Update
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, { status: status });
      toast.success(`Order Updated: ${id.slice(0, 5)} -> ${status.toUpperCase()}`);
    } catch (error: any) {
      console.error('Status update failed:', error);
      setOrders(originalOrders);
      toast.error(`Update Failed`);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const originalOrders = [...orders];
    try {
      // Optimistic Delete
      setOrders(prev => prev.filter(o => o.id !== id));
      await deleteDoc(doc(db, 'orders', id));
      toast.success('Order deleted from system');
    } catch (error) {
      console.error('Delete error:', error);
      setOrders(originalOrders);
      toast.error('Failed to delete order');
    }
  };

  const generateInvoice = (order: Order) => {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [155, 43, 44]; // #9B2B2C
    const darkColor: [number, number, number] = [15, 23, 42]; // Slate-900
    
    // Background Shape
    doc.setFillColor(244, 228, 212); // #f4e4d4 backdrop
    doc.rect(0, 0, 210, 297, 'F');
    
    // Header Banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    const companyName = settings?.siteName?.toUpperCase() || 'BAZAR DALA';

    // Logo / Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(companyName, 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PREMIUM_MANIFEST // BZD-V1.0 // PROTOCOL_SECURED', 20, 32);
    
    // Right Side Header Info
    doc.setFontSize(8);
    doc.text('ISSUED_BY: ADMIN_SYSTEM', 150, 15);
    doc.text(`TIMESTAMP: ${format(new Date(), 'HH:mm:ss')}`, 150, 20);
    doc.text('LOCATION: DHAKA_CENTRAL', 150, 25);
    
    // Invoice Body Section
    doc.setFillColor(255, 255, 255);
    doc.rect(15, 50, 180, 230, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, 50, 180, 230, 'S');

    // Order Meta Header
    doc.setTextColor(...darkColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER INVOICE', 25, 65);
    
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(25, 68, 50, 68);
    
    // Meta Grid
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('ORDER ID:', 25, 80);
    doc.setTextColor(...darkColor);
    doc.text(`#${(order.orderId || order.id).toUpperCase()}`, 55, 80);
    
    doc.setTextColor(100, 116, 139);
    doc.text('ORDER DATE:', 25, 87);
    doc.setTextColor(...darkColor);
    const orderDate = order.createdAt?.toDate ? format(order.createdAt.toDate(), 'PPP p') : format(new Date(), 'PPP p');
    doc.text(orderDate, 55, 87);

    // Bill To
    doc.setFillColor(248, 250, 252);
    doc.rect(120, 70, 65, 30, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 125, 78);
    
    doc.setTextColor(...darkColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text((order.customerInfo?.name || (order as any).name || 'N/A').toUpperCase(), 125, 85);
    doc.setFont('helvetica', 'normal');
    doc.text((order.customerInfo?.phone || (order as any).phone || 'N/A'), 125, 90);
    doc.text((order.customerInfo?.address || (order as any).address || 'N/A'), 125, 95);

    // Table
    const items = order.items || [];
    const tableData = items.map(item => [
      item.name.toUpperCase(),
      `x${item.quantity}`,
      `BTD ${(item.price || 0).toLocaleString()}`,
      `BTD ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 110,
      margin: { left: 25, right: 25 },
      head: [['PRODUCT NAME', 'QTY', 'UNIT PRICE', 'SUBTOTAL']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59], // Slate-800
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left',
        lineWidth: 0.5,
        lineColor: [255, 255, 255]
      },
      styles: {
        fontSize: 8,
        font: 'helvetica',
        cellPadding: 4,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    // Summary Section
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(120, finalY - 5, 185, finalY - 5);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('SUBTOTAL:', 120, finalY + 5);
    doc.setTextColor(...darkColor);
    doc.text(`BTD ${(order.total || 0).toLocaleString()}`, 185, finalY + 5, { align: 'right' });
    
    doc.setTextColor(100, 116, 139);
    doc.text('SHIPPING:', 120, finalY + 12);
    doc.setTextColor(...darkColor);
    doc.text('BTD 0', 185, finalY + 12, { align: 'right' });
    
    doc.setFillColor(...primaryColor);
    doc.rect(120, finalY + 18, 65, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT:', 125, finalY + 26);
    doc.text(`BTD ${(order.total || 0).toLocaleString()}`, 180, finalY + 26, { align: 'right' });

    // Footer Stamp
    doc.setTextColor(...primaryColor);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.setGState(new (doc as any).GState({ opacity: 0.03 }));
    doc.text(`${companyName}_APPROVED`, 105, 200, { align: 'center', angle: 30 });
    doc.setGState(new (doc as any).GState({ opacity: 1.0 }));

    // Bottom decorative line
    doc.setFillColor(...primaryColor);
    doc.rect(15, 275, 180, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`${settings?.siteName || 'BAZAR DALA'} Operations // Terminal Invoice // This receipt is electronically generated.`, 105, 285, { align: 'center' });

    doc.save(`${companyName}_MANIFEST_${(order.orderId || order.id).toUpperCase().slice(0, 8)}.pdf`);
  };

  const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const filteredOrders = (orders || []).filter(o => {
    if (!o) return false;
    const matchesSearch = (String(o.orderId || o.id)).toLowerCase().includes(search.toLowerCase()) ||
      (o.customerInfo?.name || (o as any).name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customerInfo?.phone || (o as any).phone || '').toLowerCase().includes(search.toLowerCase());
    
    // Server already filters status if statusFilter is present, but we keep this for local search
    const matchesStatus = !statusFilter || String(o.status || '').toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getOrderStatusColor = (status: string = 'pending') => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'delivered') return 'bg-emerald-500';
    if (s === 'cancelled' || s === 'failed') return 'bg-rose-600';
    if (s === 'processing' || s === 'shipped') return 'bg-indigo-500';
    if (s === 'confirmed') return 'bg-blue-600';
    return 'bg-amber-500';
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-slate-50 border-b border-slate-200 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-6 bg-brand-primary" />
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              Order Management
            </h1>
          </div>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em]">
            Manage store orders // {orders.length} Total // {statusFilter ? `Status: ${statusFilter.toUpperCase()}` : 'All Orders'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 md:pb-0">
             <button 
               onClick={() => navigate('/admin/orders')}
               className={`h-8 px-4 text-[9px] font-black uppercase transition-all tracking-widest ${
                 !statusFilter ? 'bg-brand-primary text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
               }`}
             >
               All Orders
             </button>
             <button 
               onClick={() => navigate('/admin/orders?status=pending')}
               className={`h-8 px-4 text-[9px] font-black uppercase transition-all tracking-widest ${
                 statusFilter === 'pending' ? 'bg-brand-primary text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
               }`}
             >
               Pending
             </button>
             <button 
               onClick={() => navigate('/admin/orders?status=confirmed')}
               className={`h-8 px-4 text-[9px] font-black uppercase transition-all tracking-widest ${
                 statusFilter === 'confirmed' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
               }`}
             >
               Confirmed
             </button>
             <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden md:block" />
             <button 
               onClick={() => window.location.reload()}
               className="h-8 px-3 text-[9px] font-black uppercase border border-slate-200 text-slate-400 hover:bg-slate-50"
             >
               Refresh
             </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              placeholder="Search Order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest focus:border-brand-primary outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="bg-white border border-slate-200 overflow-hidden min-h-[500px]">
          <Table className="w-full text-left border-collapse table-fixed">
            <TableHeader className="bg-brand-primary text-white uppercase sticky top-0 z-10 border-none">
              <TableRow className="border-none hover:bg-brand-primary">
                <TableHead className="w-32 px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-white border-r border-white/10">Order ID</TableHead>
                <TableHead className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-white border-r border-white/10">Customer</TableHead>
                <TableHead className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-white border-r border-white/10">Items</TableHead>
                <TableHead className="w-40 px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-white border-r border-white/10">Amount</TableHead>
                <TableHead className="w-32 px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-white border-r border-white/10">Status</TableHead>
                <TableHead className="w-64 px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {loading && (orders || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-40">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-primary animate-spin" />
                      <p className="text-slate-300 font-black uppercase text-[9px] tracking-[0.2em]">Syncing_Global_Registry_Delta...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length > 0 ? (
                <>
                  {filteredOrders.map((order) => {
                    if (!order) return null;
                    return (
                      <TableRow key={order.id || Math.random().toString()} className="hover:bg-slate-50 transition-all font-bold group">
                        <TableCell className="px-6 py-4 text-[10px] border-r border-slate-100 whitespace-nowrap align-top">
                          <span className="font-black text-slate-900 tracking-tighter">#{order?.orderId || 'NULL_ID'}</span>
                          <div className="text-[8px] text-slate-400 mt-1 uppercase font-mono tracking-tight">
                            {order?.createdAt?.toDate ? format(order.createdAt.toDate(), 'dd/MM/yy.HHmm') : 'WAIT_SYNC'}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 border-r border-slate-100 overflow-hidden align-top">
                          <div className="text-[11px] font-black text-slate-900 uppercase truncate leading-none">{order?.customerInfo?.name || 'GUEST'}</div>
                          <div className="text-[9px] text-slate-400 font-mono mt-1 opacity-60">{order?.customerInfo?.phone || 'NO_PHONE'}</div>
                          <div className="text-[8px] text-slate-300 truncate mt-2 uppercase tracking-tight">
                            {order?.customerInfo?.address || 'NO_ADDRESS_NODE'}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 border-r border-slate-100 overflow-hidden align-top">
                          <div className="flex flex-col gap-1">
                            {order?.items?.slice(0, 2).map((item: any, i: number) => (
                              <div key={i} className="text-[9px] text-slate-500 uppercase truncate leading-none">
                                <span className="text-slate-400">[{item?.quantity || 1}x]</span> {item?.name}
                              </div>
                            ))}
                            {order?.items && order.items.length > 2 && (
                              <div className="text-[8px] text-slate-300 font-black">+{order.items.length - 2} ADDTL_ITEMS</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 border-r border-slate-100 align-top">
                          <div className="text-[13px] font-black text-slate-900 tracking-tighter">৳{(order?.total || 0).toLocaleString()}</div>
                          <div className="text-[8px] text-slate-400 uppercase tracking-widest font-black mt-1">{order?.paymentMethod || 'COD_PROTOCOL'}</div>
                        </TableCell>
                        <TableCell className="px-6 py-4 border-r border-slate-100 align-top">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 animate-pulse ${getOrderStatusColor(order?.status)}`} />
                            <span className="text-[9px] font-black uppercase text-slate-800 tracking-widest">{order?.status || 'Active'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 align-top">
                          <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-2">
                               <select 
                                 value={order.status || 'pending'}
                                 onChange={(e) => updateStatus(order.id, e.target.value)}
                                 className="h-8 px-2 bg-slate-50 border border-slate-200 text-slate-900 text-[8px] font-black uppercase focus:outline-none transition-all flex-1"
                               >
                                 {['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'].map((status) => (
                                   <option key={status} value={status}>{status}</option>
                                 ))}
                               </select>
                               
                               <button 
                                 onClick={() => generateInvoice(order)}
                                 className="h-8 w-8 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-900 hover:bg-white transition-all flex-shrink-0"
                                 title="Invoice"
                               >
                                 <FileText className="h-3.5 w-3.5" />
                               </button>

                               <button 
                                 onClick={() => {
                                   if (window.confirm('Delete this order?')) {
                                     handleDelete(order.id);
                                   }
                                 }}
                                 className="h-8 w-8 flex items-center justify-center bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-all flex-shrink-0"
                                 title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                             </div>
                             
                             {String(order.status || '').toLowerCase() === 'pending' && (
                               <button 
                                 onClick={() => updateStatus(order.id, 'confirmed')}
                                 className="w-full h-8 px-4 bg-brand-primary text-white text-[8px] font-black uppercase hover:bg-slate-900 transition-all active:scale-95"
                               >
                                 CONFIRM ORDER
                               </button>
                             )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {hasMore && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-10 text-center">
                        <button
                          onClick={() => fetchOrders(true)}
                          disabled={loadingMore}
                          className="bg-brand-primary hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-12 py-4 active:scale-95 transition-all"
                        >
                          {loadingMore ? 'Loading...' : 'Load More'}
                        </button>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-40 text-center">
                    <Package className="h-12 w-12 text-slate-100 mx-auto mb-6" />
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Orders Found</h3>
                    <p className="text-[9px] text-slate-300 font-black uppercase mt-2 tracking-[0.2em]">Zero transactions detected in store</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
