import React, { useEffect, useState } from 'react';
import { User, CreditCard, ChevronRight, X, Trash2, Receipt, Clock, Search, Calendar } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { fetchAdditions, fetchAdditionItems, deleteAddition } from '../api';

interface Addition {
  id: number;
  client_id: number | null;
  total: number;
  date: string;
  status: string;
  client_last_name?: string;
  client_first_name?: string;
}

interface AdditionItem {
  id: number;
  prestation_name: string;
  prestation_category: string;
  quantity: number;
  price_at_time: number;
}

const History: React.FC = () => {
  const [additions, setAdditions] = useState<Addition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddition, setSelectedAddition] = useState<Addition | null>(null);
  const [additionItems, setAdditionItems] = useState<AdditionItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const loadAdditions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdditions();
      setAdditions(data || []);
    } catch (error) {
      console.error("Error loading additions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdditions();
  }, []);

  const handleShowDetails = async (addition: Addition) => {
    setSelectedAddition(addition);
    setIsLoadingItems(true);
    try {
      const items = await fetchAdditionItems(addition.id);
      setAdditionItems(items || []);
    } catch (error) {
      console.error("Error loading items", error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm("Supprimer définitivement cette addition de l'historique ?")) {
      try {
        await deleteAddition(id);
        loadAdditions();
        if (selectedAddition?.id === id) setSelectedAddition(null);
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  // PDF export/share helpers for History modal (captures the detail view)
  const generatePdfBlob = async (additionId: number) => {
    const el = document.getElementById(`addition-${additionId}`);
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
    if (!selectedAddition) return;
    try {
      const blob = await generatePdfBlob(selectedAddition.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `addition-${selectedAddition.id}-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export error', err);
      alert('Impossible d\'exporter la PDF.');
    }
  };

  const handleSharePdf = async () => {
    if (!selectedAddition) return;
    try {
      const blob = await generatePdfBlob(selectedAddition.id);
      const file = new File([blob], `addition-${selectedAddition.id}-${Date.now()}.pdf`, { type: 'application/pdf' });
      
      // Correction de l'erreur TS2774
      if (typeof navigator.canShare === 'function' && (navigator as any).canShare({ files: [file] })) {
        await (navigator as any).share({ files: [file], title: 'Addition', text: 'Voici l\'addition' });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Share error', err);
      alert('Impossible de partager la PDF.');
    }
  };

  const filteredAdditions = additions.filter(a => {
    const clientName = `${a.client_first_name || ''} ${a.client_last_name || ''}`.toLowerCase();
    const date = new Date(a.date).toLocaleDateString().toLowerCase();
    const total = a.total.toString();
    return clientName.includes(searchQuery.toLowerCase()) || 
           date.includes(searchQuery.toLowerCase()) ||
           total.includes(searchQuery);
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-24 md:pb-8">
      {/* Header & Total */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-vert-foret dark:text-slate-100 uppercase tracking-tight">Historique</h1>
            <p className="text-xs md:text-base text-vert-sauge dark:text-slate-400 font-medium">Gérez vos transactions passées</p>
          </div>
          <div className="md:hidden p-3 bg-vert-olive text-white rounded-2xl shadow-lg shadow-vert-olive/20">
             <Receipt size={24} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[2rem] border border-vert-sauge/20 dark:border-slate-800 shadow-sm flex items-center justify-between md:justify-start gap-4">
            <div className="p-3 bg-vert-olive/10 rounded-2xl text-vert-olive">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-vert-sauge uppercase tracking-[0.2em]">Total cumulé</p>
              <p className="text-2xl font-black text-vert-foret dark:text-slate-100">
                {additions.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}€
              </p>
            </div>
          </div>
          
          {/* Search bar integrated into the header row for tablets/PC */}
          <div className="md:col-span-2 relative group flex items-center">
            <Search className="absolute left-4 text-vert-sauge group-focus-within:text-vert-olive transition-colors" size={20} />
            <input
              type="text"
              placeholder="Rechercher (client, date, montant)..."
              className="input-field pl-12 bg-white dark:bg-slate-900 shadow-sm h-full py-4 md:py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* List of additions */}
      <div className="space-y-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="card p-6 h-20 skeleton rounded-[1.5rem]"></div>
          ))
        ) : filteredAdditions.length === 0 ? (
          <div className="card p-20 text-center border-dashed border-2 rounded-[2rem]">
            <Receipt size={48} className="mx-auto text-vert-sauge mb-4 opacity-20" />
            <p className="text-vert-sauge font-bold">Aucune addition trouvée</p>
          </div>
        ) : (
          filteredAdditions.map(addition => (
            <div 
              key={addition.id} 
              onClick={() => handleShowDetails(addition)}
              className="card p-4 md:p-5 flex items-center justify-between group cursor-pointer hover:border-vert-olive dark:hover:border-slate-600 transition-all active:scale-[0.98] rounded-[1.5rem] md:rounded-[2rem]"
            >
              <div className="flex items-center gap-4">
                {/* Date display - Responsive */}
                <div className="flex flex-col items-center justify-center p-2.5 md:p-3 bg-rose-poudre/40 dark:bg-slate-800 rounded-2xl min-w-[60px] md:min-w-[70px]">
                   <span className="text-[9px] md:text-[10px] font-black text-vert-sauge uppercase">{new Date(addition.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                   <span className="text-lg md:text-xl font-black text-vert-foret dark:text-slate-200">{new Date(addition.date).getDate()}</span>
                </div>
                
                <div className="space-y-0.5">
                  <h3 className="font-bold text-vert-foret dark:text-slate-200 text-sm md:text-base line-clamp-1">
                    {addition.client_last_name ? `${addition.client_first_name || ''} ${addition.client_last_name}` : 'Client de passage'}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] md:text-xs text-vert-sauge font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(addition.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="hidden sm:inline opacity-30">•</span>
                    <span className="hidden sm:inline flex items-center gap-1"><Calendar size={12} /> {new Date(addition.date).getFullYear()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-8">
                <div className="text-right">
                  <p className="text-lg md:text-2xl font-black text-vert-olive dark:text-vert-sauge leading-tight">{addition.total.toFixed(2)}€</p>
                  <p className="text-[9px] md:text-[10px] font-black text-vert-sauge uppercase tracking-[0.2em] opacity-60">Validé</p>
                </div>
                <div className="flex items-center">
                   <button 
                    onClick={(e) => handleDelete(e, addition.id)}
                    className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all md:opacity-0 group-hover:opacity-100"
                   >
                     <Trash2 size={18} />
                   </button>
                  <ChevronRight size={20} className="text-vert-sauge group-hover:translate-x-1 transition-transform hidden md:block" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal - Mobile Optimized */}
      {selectedAddition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-vert-foret/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
          <div id={`addition-${selectedAddition.id}`} className="bg-white dark:bg-slate-900 w-full h-full md:h-auto md:max-w-2xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up">
            <div className="p-5 md:p-7 border-b border-rose-poudre dark:border-slate-800 flex justify-between items-center bg-vert-foret dark:bg-slate-800 text-rose-poudre">
              <div className="flex items-center gap-3 md:gap-5">
                <div className="p-3 bg-white/10 rounded-2xl hidden sm:block"><Receipt size={24} /></div>
                <div>
                  <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">Détail Addition #{selectedAddition.id}</h2>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest opacity-60 font-bold">
                    Enregistrée le {new Date(selectedAddition.date).toLocaleString()}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedAddition(null)} className="hover:bg-white/10 p-2.5 md:p-3 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 md:p-10 flex-1 overflow-y-auto space-y-8">
              {/* Info Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-rose-poudre/20 dark:bg-slate-800/40 rounded-3xl border border-rose-poudre dark:border-slate-800/50">
                   <div className="p-2.5 bg-vert-olive text-white rounded-2xl"><User size={20} /></div>
                   <div className="overflow-hidden">
                      <p className="text-[9px] font-black text-vert-sauge uppercase tracking-widest mb-0.5">Client associé</p>
                      <p className="font-bold text-sm md:text-base text-vert-foret dark:text-slate-200 truncate">
                        {selectedAddition.client_last_name ? `${selectedAddition.client_first_name || ''} ${selectedAddition.client_last_name}` : 'Client de passage'}
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-rose-poudre/20 dark:bg-slate-800/40 rounded-3xl border border-rose-poudre dark:border-slate-800/50">
                   <div className="p-2.5 bg-vert-foret dark:bg-slate-700 text-white rounded-2xl"><CreditCard size={20} /></div>
                   <div>
                      <p className="text-[9px] font-black text-vert-sauge uppercase tracking-widest mb-0.5">Paiement</p>
                      <p className="font-bold text-sm md:text-base text-vert-foret dark:text-slate-200">
                        Comptant / Immédiat
                      </p>
                   </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-vert-sauge dark:text-slate-500 uppercase tracking-[0.3em] ml-2">Résumé des prestations</h3>
                <div className="space-y-1">
                  {isLoadingItems ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="h-16 skeleton w-full rounded-2xl"></div>)
                  ) : (
                    additionItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 hover:bg-rose-poudre/10 dark:hover:bg-slate-800/30 rounded-2xl transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-9 h-9 flex items-center justify-center bg-rose-poudre dark:bg-slate-800 rounded-xl text-xs font-black text-vert-olive">
                             x{item.quantity}
                           </div>
                           <div>
                              <p className="text-sm md:text-base font-bold text-vert-foret dark:text-slate-200">{item.prestation_name}</p>
                              <p className="text-[9px] font-bold text-vert-sauge uppercase tracking-widest">{item.prestation_category}</p>
                           </div>
                        </div>
                        <p className="font-black text-sm md:text-lg text-vert-foret dark:text-slate-200">{(item.price_at_time * item.quantity).toFixed(2)}€</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Final Total - Premium Look */}
              <div className="pt-4">
                 <div className="flex justify-between items-center bg-vert-olive dark:bg-vert-olive/90 text-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-vert-olive/30 relative overflow-hidden group">
                    <div className="relative z-10">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1">Montant Total</p>
                       <p className="text-xs opacity-90 font-medium">Toutes taxes comprises</p>
                    </div>
                    <p className="text-4xl md:text-5xl font-black relative z-10">{selectedAddition.total.toFixed(2)}€</p>
                    {/* Decorative circles */}
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
                    <div className="absolute -left-4 -top-4 w-16 h-16 bg-black/5 rounded-full"></div>
                 </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-rose-poudre/10 dark:bg-slate-900 border-t border-rose-poudre dark:border-slate-800">
               <div className="flex gap-3 mb-3">
                 <button onClick={handleExportPdf} className="flex-1 py-3 bg-vert-olive text-white rounded-[1.5rem] font-bold">Exporter en PDF</button>
                 <button onClick={handleSharePdf} className="flex-1 py-3 bg-rose-poudre dark:bg-slate-800 rounded-[1.5rem] font-bold">Partager</button>
               </div>
               <button 
                onClick={() => setSelectedAddition(null)}
                className="btn-primary w-full py-4 md:py-5 text-base rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-[0.2em]"
               >
                 Fermer l'Aperçu
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;