import React, { useEffect, useState } from 'react';
import { Plus, Minus, Search, CheckCircle2, ClipboardList, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { fetchClients, createAddition } from '../api';
import { PRESTATIONS } from '../data/menu';

const CarteAddition: React.FC = () => {
  const [prestations] = useState(PRESTATIONS);
  const [clients, setClients] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const clientsData = await fetchClients();
        setClients(clientsData || []);
      } catch (err: any) {
        console.error("Load error", err);
        setError(err.message || "Erreur lors du chargement des clients.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const addToCart = (prestation: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === prestation.id);
      if (existing) {
        return prev.map(item => 
          item.id === prestation.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...prestation, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const total = cart.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);

  const handleValidate = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await createAddition({
        client_id: selectedClientId || null,
        total: total,
        items: cart.map(item => ({
          prestation_id: item.id,
          quantity: item.quantity,
          price_at_time: item.unit_price
        }))
      });
      setCart([]);
      setSelectedClientId('');
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Validation error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // PDF export/share functions
  const generatePdfBlob = async () => {
    const el = document.getElementById('addition-to-print');
    if (!el) throw new Error('Element addition not found');
    const canvas = await html2canvas(el as HTMLElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = (pdf as any).getImageProperties ? (pdf as any).getImageProperties(imgData) : { width: canvas.width, height: canvas.height };
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf.output('blob');
  };

  const handleExportPdf = async () => {
    try {
      const blob = await generatePdfBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `addition-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export error', err);
    }
  };

  const handleSharePdf = async () => {
    try {
      const blob = await generatePdfBlob();
      const file = new File([blob], `addition-${Date.now()}.pdf`, { type: 'application/pdf' });
      
      // Correction de l'erreur TS2774
      if (typeof navigator.canShare === 'function' && (navigator as any).canShare({ files: [file] })) {
        await (navigator as any).share({ files: [file], title: 'Addition', text: 'Voici l\'addition' });
      } else {
        // fallback to download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Share error', err);
    }
  };

  const filteredPrestations = prestations.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'Tous' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Tous', ...new Set(prestations.map(p => p.category))];

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="p-4 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full mb-4">
        <X size={48} />
      </div>
      <h2 className="text-2xl font-bold text-vert-foret dark:text-slate-100">{error}</h2>
      <p className="text-vert-sauge dark:text-slate-400 mb-6">Vérifiez que le serveur est bien lancé.</p>
      <button onClick={() => window.location.reload()} className="btn-primary">Réessayer</button>
    </div>
  );

  return (
    <div className="flex flex-col xl:flex-row gap-8 pb-20 xl:pb-0 animate-fade-in">
      <div className="flex-1 overflow-hidden space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-vert-foret dark:text-slate-100">Composer une Addition</h1>
          <p className="text-vert-sauge dark:text-slate-400">Sélectionnez les articles à facturer</p>
        </header>
        
        {/* Search and Categories */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vert-sauge dark:text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher un article..."
              className="input-field pl-12 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="w-24 h-10 skeleton rounded-full flex-shrink-0"></div>
              ))
            ) : (
              categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setFilterCategory(cat)} 
                  className={`px-5 py-2 rounded-full whitespace-nowrap transition-all shadow-sm text-sm font-bold ${
                    filterCategory === cat 
                      ? 'bg-vert-olive text-white scale-105 shadow-vert-olive/20' 
                      : 'bg-white dark:bg-slate-900 text-vert-foret dark:text-slate-300 border border-vert-sauge/20 dark:border-slate-800 hover:bg-rose-poudre dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Prestations Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-24 md:h-28 card p-4 flex flex-col justify-between">
                <div className="w-full h-4 skeleton"></div>
                <div className="w-16 h-4 skeleton"></div>
              </div>
            ))
          ) : filteredPrestations.length === 0 ? (
            <div className="col-span-full py-20 text-center card bg-transparent border-dashed">
              <p className="text-vert-sauge dark:text-slate-500 italic">Aucun article ne correspond à votre recherche.</p>
            </div>
          ) : (
            filteredPrestations.map(p => (
              <button 
                key={p.id} 
                onClick={() => addToCart(p)} 
                className="card p-3 md:p-4 hover:border-vert-olive dark:hover:border-slate-600 transition-all text-left flex flex-col justify-between h-24 md:h-28 active:scale-95 group"
              >
                <span className="text-sm font-bold text-vert-foret dark:text-slate-200 line-clamp-2 group-hover:text-vert-olive transition-colors">{p.name}</span>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-vert-olive dark:text-vert-sauge font-black">{p.unit_price.toFixed(2)}€</span>
                  <div className="p-1 bg-rose-poudre dark:bg-slate-800 rounded text-vert-foret dark:text-slate-400 group-hover:bg-vert-olive group-hover:text-white transition-colors">
                    <Plus size={14} />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div id="addition-to-print" className="w-full xl:w-96 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl shadow-2xl border border-vert-sauge/20 dark:border-slate-800 flex flex-col h-fit sticky top-0 xl:relative animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-vert-foret dark:text-slate-100 flex items-center gap-2">
            <ClipboardList size={22} className="text-vert-olive" />
            Panier
          </h2>
          <span className="bg-rose-poudre dark:bg-slate-800 text-vert-foret dark:text-slate-300 px-3 py-1 rounded-full text-xs font-black">
            {cart.reduce((acc, item) => acc + item.quantity, 0)} ARTICLES
          </span>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[300px] xl:max-h-[500px] mb-6 custom-scrollbar pr-1">
          {cart.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-rose-poudre dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-vert-sauge">
                <Plus size={32} />
              </div>
              <p className="text-vert-sauge dark:text-slate-500 italic">Le panier est vide</p>
            </div>
          ) : (
            <div className="space-y-1">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-rose-poudre dark:border-slate-800 last:border-0 group">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-bold text-vert-foret dark:text-slate-200">{item.name}</p>
                    <p className="text-xs text-vert-sauge dark:text-slate-500">{(item.unit_price * item.quantity).toFixed(2)}€</p>
                  </div>
                  <div className="flex items-center gap-1 bg-rose-poudre/50 dark:bg-slate-800/50 rounded-xl p-1">
                    <button onClick={() => removeFromCart(item.id)} className="text-vert-olive dark:text-vert-sauge p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"><Minus size={14} /></button>
                    <span className="font-black text-sm min-w-[24px] text-center dark:text-slate-200">{item.quantity}</span>
                    <button onClick={() => addToCart(item)} className="text-vert-olive dark:text-vert-sauge p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"><Plus size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-rose-poudre dark:border-slate-800 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-vert-sauge dark:text-slate-500 uppercase tracking-[0.2em] block">Assigner à un Client</label>
            <select 
              value={selectedClientId} 
              onChange={(e) => setSelectedClientId(Number(e.target.value))} 
              className="w-full p-3 bg-rose-poudre/30 dark:bg-slate-800/50 border border-vert-sauge/20 dark:border-slate-700 rounded-xl text-sm text-vert-foret dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-vert-olive dark:focus:ring-slate-600"
            >
              <option value="">Client de passage (anonyme)</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.last_name} {c.first_name}</option>)}
            </select>
          </div>
          
          <div className="flex justify-between items-center bg-vert-foret/5 dark:bg-slate-800/30 p-4 rounded-2xl">
            <span className="text-vert-sauge dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Total à payer</span>
            <span className="text-3xl font-black text-vert-foret dark:text-slate-100">{total.toFixed(2)}€</span>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handleValidate} 
              disabled={cart.length === 0 || isSubmitting} 
              className="btn-primary w-full py-4 text-lg shadow-xl shadow-vert-olive/20 disabled:opacity-50 disabled:active:scale-100"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  Valider l'Addition
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button onClick={handleExportPdf} disabled={cart.length === 0} className="w-1/2 py-3 bg-vert-olive text-white rounded-xl font-bold">Exporter en PDF</button>
              <button onClick={handleSharePdf} disabled={cart.length === 0} className="w-1/2 py-3 bg-rose-poudre dark:bg-slate-800 rounded-xl font-bold">Partager</button>
            </div>
          </div>
          
          {successMessage && (
            <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 text-center rounded-xl text-sm font-bold animate-fade-in flex items-center justify-center gap-2">
              <CheckCircle2 size={18} />
              Addition enregistrée !
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarteAddition;