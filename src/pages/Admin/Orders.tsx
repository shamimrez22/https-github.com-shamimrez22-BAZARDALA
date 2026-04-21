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
    toast.info(`Updating manifest status...`, { duration: 800 });
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, { status: status });
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success(`MANIFEST_UPDATED: ${id.slice(0, 5)} -> ${status.toUpperCase()}`);
    } catch (error: any) {
      console.error('Status update failed:', error);
      toast.error(`Sync Failure`);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'orders', id));
      toast.success('Order deleted from system');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete order');
    } finally {
      setDeletingId(null);
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
    doc.text('ORDER_MANIFEST', 25, 65);
    
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(25, 68, 50, 68);
    
    // Meta Grid
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('MANIFEST_ID:', 25, 80);
    doc.setTextColor(...darkColor);
    doc.text(`#${(order.orderId || order.id).toUpperCase()}`, 55, 80);
    
    doc.setTextColor(100, 116, 139);
    doc.text('ISSUED_DATE:', 25, 87);
    doc.setTextColor(...darkColor);
    const orderDate = order.createdAt?.toDate ? format(order.createdAt.toDate(), 'PPP p') : format(new Date(), 'PPP p');
    doc.text(orderDate, 55, 87);

    // Bill To
    doc.setFillColor(248, 250, 252);
    doc.rect(120, 70, 65, 30, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL_TO:', 125, 78);
    
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
      head: [['PRODUCT_SPECIFICATION', 'QTY', 'UNIT_PRICE', 'SUBTOTAL']],
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
    doc.text('FEE_ADJUST:', 120, finalY + 12);
    doc.setTextColor(...darkColor);
    doc.text('BTD 0', 185, finalY + 12, { align: 'right' });
    
    doc.setFillColor(...primaryColor);
    doc.rect(120, finalY + 18, 65, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL_MANIFEST:', 125, finalY + 26);
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
    <div className="space-y-6 min-h-screen">
      <Card className="bg-[#ead9c4] border border-[#777] rounded-none shadow-none">
        <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#9B2B2C] uppercase tracking-tight flex items-center gap-3">
              Customer <span className="text-slate-900">Orders</span>
            </h1>
            <p className="text-slate-600 font-bold text-[10px] uppercase mt-1">
              Order Records // {statusFilter ? `Filtered: ${statusFilter.toUpperCase()}` : 'All Orders'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
             <Button 
               onClick={() => navigate('/admin/orders')}
               className={`h-8 px-4 rounded-none text-[9px] font-black uppercase transition-all ${
                 !statusFilter ? 'bg-[#9B2B2C] text-white shadow-[2px_2px_0px_#000]' : 'bg-white border border-[#777] text-[#9B2B2C] hover:bg-[#ead9c4]'
               }`}
             >
               All Logs
             </Button>
             <Button 
               onClick={() => navigate('/admin/orders?status=pending')}
               className={`h-8 px-4 rounded-none text-[9px] font-black uppercase transition-all relative ${
                 statusFilter === 'pending' ? 'bg-[#9B2B2C] text-white shadow-[2px_2px_0px_#000]' : 'bg-white border border-[#777] text-[#9B2B2C] hover:bg-[#ead9c4]'
               }`}
             >
               Pending
               {(orders || []).filter(o => o?.status === 'pending').length > 0 && (
                 <span className="ml-2 bg-white text-[#9B2B2C] px-1 rounded-sm text-[8px]">
                    {(orders || []).filter(o => o?.status === 'pending').length}
                 </span>
               )}
             </Button>
             <Button 
               onClick={() => navigate('/admin/orders?status=confirmed')}
               className={`h-8 px-4 rounded-none text-[9px] font-black uppercase transition-all relative ${
                 statusFilter === 'confirmed' ? 'bg-[#9B2B2C] text-white shadow-[2px_2px_0px_#000]' : 'bg-white border border-[#777] text-[#9B2B2C] hover:bg-[#ead9c4]'
               }`}
             >
               Confirmed
               {(orders || []).filter(o => o?.status === 'confirmed').length > 0 && (
                 <span className="ml-2 bg-white text-[#9B2B2C] px-1 rounded-sm text-[8px]">
                    {(orders || []).filter(o => o?.status === 'confirmed').length}
                 </span>
               )}
             </Button>
             <div className="h-6 w-[1px] bg-[#777]/30 mx-2" />
             <Button 
               onClick={() => window.location.reload()}
               variant="outline"
               className="h-8 px-3 rounded-none text-[9px] font-black uppercase border-[#777] text-slate-600"
             >
               Force Refresh
             </Button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9B2B2C]" />
              <Input
                placeholder="Search Orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white border-[#777] text-xs h-9 rounded-none ring-offset-0 focus:ring-0 focus:border-[#9B2B2C]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#ead9c4] border border-[#777] rounded-none shadow-none overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <Table className="w-full text-left border-collapse table-fixed">
            <TableHeader className="bg-[#9B2B2C] text-white uppercase sticky top-0 z-10 border-none">
              <TableRow className="border-none hover:bg-[#9B2B2C]">
                <TableHead className="w-32 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white border-r border-white/20">Order ID</TableHead>
                <TableHead className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white border-r border-white/20">Customer Details</TableHead>
                <TableHead className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white border-r border-white/20">Products</TableHead>
                <TableHead className="w-40 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white border-r border-white/20">Pricing</TableHead>
                <TableHead className="w-32 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white border-r border-white/20">Order Status</TableHead>
                <TableHead className="w-48 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white">Controls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#777]/30 bg-white/20">
              {loading && (orders || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-32">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-[#9B2B2C] border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] animate-pulse">Synchronizing Delta Logs...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length > 0 ? (
                <>
                  {filteredOrders.map((order) => {
                    if (!order) return null;
                    return (
                      <TableRow key={order.id || Math.random().toString()} className="hover:bg-[#ead9c4]/30 transition-all font-bold group border-b border-[#777]/20">
                        <TableCell className="px-4 py-4 text-[10px] border-r border-[#777]/20 whitespace-nowrap align-top">
                          <span className="font-black text-[#9B2B2C]">#{order?.orderId || (order?.id ? order.id.slice(0, 8).toUpperCase() : 'UNKNOWN')}</span>
                          <div className="text-[8px] text-slate-500 mt-0.5">
                            {order?.createdAt?.toDate ? format(order.createdAt.toDate(), 'dd/MM/yy HH:mm') : 'PENDING SYNC'}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 border-r border-[#777]/20 overflow-hidden align-top">
                          <div className="text-[10px] text-slate-900 uppercase truncate">{order?.customerInfo?.name || (order as any)?.name || 'N/A'}</div>
                          <div className="text-[9px] text-slate-500 font-mono">{order?.customerInfo?.phone || (order as any)?.phone || 'N/A'}</div>
                          <div className="text-[8px] text-slate-400 truncate opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                            {order?.customerInfo?.address || (order as any)?.address || ''}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 border-r border-[#777]/20 overflow-hidden align-top">
                          <div className="space-y-1">
                            {order?.items?.slice(0, 2).map((item: any, i: number) => (
                              <div key={i} className="text-[9px] text-slate-700 uppercase truncate">
                                {item?.quantity || 1}x {item?.name || 'Unknown Product'}
                              </div>
                            ))}
                            {order?.items && order.items.length > 2 && (
                              <div className="text-[8px] text-slate-400 font-black">+{order.items.length - 2} more items</div>
                            )}
                            {(!order?.items || order.items.length === 0) && <div className="text-[9px] text-slate-700 uppercase truncate">{(order as any)?.productName || 'No Items'}</div>}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 border-r border-[#777]/20 align-top">
                          <div className="text-sm font-black text-slate-900">৳{(order?.total || 0).toLocaleString()}</div>
                          <div className="text-[8px] text-slate-500 uppercase tracking-widest font-black">{order?.paymentMethod || 'COD'}</div>
                        </TableCell>
                        <TableCell className="px-4 py-4 border-r border-[#777]/20 align-top">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${getOrderStatusColor(order?.status)}`} />
                            <span className="text-[9px] font-black uppercase text-slate-700">{order?.status || 'UNKNOWN'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-top">
                          <div className="flex items-center gap-2 opacity-100 transition-opacity">
                             {String(order.status || '').toLowerCase() === 'pending' && (
                               <Button 
                                 size="sm" 
                                 onClick={() => updateStatus(order.id, 'confirmed')}
                                 className="h-7 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase rounded-none shadow-md animate-pulse hover:animate-none"
                               >
                                 Confirm Order
                               </Button>
                             )}
                             <Button 
                               size="sm" 
                               variant="outline"
                               onClick={() => generateInvoice(order)}
                               className="h-7 px-3 bg-white border-[#777] text-[#9B2B2C] text-[8px] font-black uppercase rounded-none hover:bg-[#ead9c4]"
                             >
                               <FileText className="h-3 w-3 mr-1" />
                               Report
                             </Button>
                             
                             <Button 
                               size="sm" 
                               variant="outline"
                               disabled={deletingId === order.id}
                               onClick={() => {
                                 toast('PROTOCOL_WIPE: Permanent delete?', {
                                   action: {
                                     label: 'Delete',
                                     onClick: () => handleDelete(order.id)
                                   },
                                   cancel: { label: 'Cancel', onClick: () => {} }
                                 });
                               }}
                               className="h-7 px-3 bg-white border-rose-200 text-rose-600 text-[8px] font-black uppercase rounded-none hover:bg-rose-50 transition-all font-black"
                             >
                               <Trash2 className="h-3 w-3 mr-1" />
                               Delete
                             </Button>

                             <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 px-3 bg-white border-[#777] text-[8px] font-black uppercase rounded-none hover:bg-[#ead9c4]">
                                  <ChevronDown className="h-3 w-3 mr-1" /> Update
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white border-[#777] p-1 rounded-none shadow-xl">
                                {['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'].map((status) => (
                                  <DropdownMenuItem 
                                    key={status}
                                    onSelect={() => updateStatus(order.id, status)}
                                    className="text-[9px] font-bold uppercase p-2 cursor-pointer focus:bg-[#ead9c4] focus:text-slate-900"
                                  >
                                    {order.status === status ? 'CURRENT: ' : 'Move to: '} {status}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {hasMore && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-4 text-center border-t border-[#777]/20">
                        <Button
                          onClick={() => fetchOrders(true)}
                          disabled={loadingMore}
                          className="bg-[#9B2B2C] hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-8 rounded-none h-10"
                        >
                          {loadingMore ? 'SYNCING...' : 'LOAD MORE RECORDS'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-40 text-center">
                    <div className="w-20 h-20 bg-[#ead9c4] rounded-none border border-[#777] flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Package className="h-10 w-10 text-[#9B2B2C]" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">No Orders Found</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase mt-2 tracking-[0.2em]">There are no orders to display in this list.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default AdminOrders;
