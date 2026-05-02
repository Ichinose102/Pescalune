import React, { useEffect, useState } from 'react';
import { Plus, Minus, Search, UserPlus, CheckCircle2, ClipboardList } from 'lucide-react';
import { fetchPrestations, fetchClients, createAddition } from '../api';

const CarteAddition: React.FC = () => {
  const [prestations, setPrestations] = useState<any[]>([]);
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
        const [presData, clientsData] = await Promise.all([
          fetchPrestations(),
          fetchClients()
        ]);
        setPrestations(presData || []);
        setClients(clientsData || []);
      } catch (err) {
        console.error("Load error", err);
        setError("Erreur serveur.");
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

  const filteredPrestations = prestations.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'Tous' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Tous', ...new Set(prestations.map(p => p.category))];

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur</div>;

  return (
    <div className="flex flex-col xl:flex-row gap-8 pb-20 xl:pb-0">
      <div className="flex-1 overflow-hidden">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-vert-foret">Composer une Addition</h1>
        
        {/* Categories - Horizontal Scroll on Mobile */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilterCategory(cat)} 
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors shadow-sm text-sm font-medium ${
                filterCategory === cat 
                  ? 'bg-vert-olive text-white' 
                  : 'bg-white text-vert-foret border border-vert-sauge/20 hover:bg-rose-poudre'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Prestations Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredPrestations.map(p => (
            <button 
              key={p.id} 
              onClick={() => addToCart(p)} 
              className="p-3 md:p-4 bg-white rounded-xl border border-vert-sauge/20 hover:border-vert-olive transition-all text-left flex flex-col justify-between h-24 md:h-28 shadow-sm active:scale-95"
            >
              <span className="text-sm font-bold text-vert-foret line-clamp-2">{p.name}</span>
              <span className="text-vert-olive font-bold mt-auto">{p.unit_price.toFixed(2)}€</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Section - Floating or Side panel */}
      <div className="w-full xl:w-96 bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-vert-sauge/20 flex flex-col h-fit sticky top-0 xl:relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-vert-foret flex items-center gap-2">
            <ClipboardList size={20} className="text-vert-olive" />
            Panier
          </h2>
          <span className="bg-rose-poudre text-vert-foret px-2 py-1 rounded text-xs font-bold">
            {cart.reduce((acc, item) => acc + item.quantity, 0)} articles
          </span>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[300px] xl:max-h-[500px] mb-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-vert-sauge italic">Le panier est vide</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-rose-poudre last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-vert-foret">{item.name}</p>
                  <p className="text-xs text-vert-sauge">{(item.unit_price * item.quantity).toFixed(2)}€</p>
                </div>
                <div className="flex items-center gap-3 bg-rose-poudre/50 rounded-lg px-2 py-1">
                  <button onClick={() => removeFromCart(item.id)} className="text-vert-olive p-1 hover:bg-white rounded transition-colors"><Minus size={14} /></button>
                  <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                  <button onClick={() => addToCart(item)} className="text-vert-olive p-1 hover:bg-white rounded transition-colors"><Plus size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-rose-poudre">
          <div className="mb-4">
            <label className="text-xs font-bold text-vert-sauge uppercase tracking-wider mb-2 block">Client</label>
            <select 
              value={selectedClientId} 
              onChange={(e) => setSelectedClientId(Number(e.target.value))} 
              className="w-full p-2 bg-rose-poudre/30 border border-vert-sauge/20 rounded-lg text-sm text-vert-foret focus:outline-none focus:ring-2 focus:ring-vert-olive"
            >
              <option value="">Client anonyme</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.last_name} {c.first_name}</option>)}
            </select>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <span className="text-vert-sauge font-medium">Total</span>
            <span className="text-2xl font-bold text-vert-foret">{total.toFixed(2)}€</span>
          </div>
          
          <button 
            onClick={handleValidate} 
            disabled={cart.length === 0 || isSubmitting} 
            className="w-full bg-vert-olive text-white py-3 rounded-xl font-bold shadow-lg hover:bg-vert-foret transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Validation...' : (
              <>
                <CheckCircle2 size={20} />
                Valider l'Addition
              </>
            )}
          </button>
          
          {successMessage && (
            <div className="mt-3 p-2 bg-green-50 text-green-700 text-center rounded-lg text-sm animate-in fade-in slide-in-from-top-2">
              Addition enregistrée avec succès !
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarteAddition;
