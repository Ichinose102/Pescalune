import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, ClipboardList, Tag, Euro, FolderMinus, ChevronDown, ChevronRight } from 'lucide-react';
import { fetchPrestations, createPrestation, updatePrestation, deletePrestation, deleteCategory } from '../api';

interface Prestation {
  id: number;
  category: string;
  name: string;
  unit_price: number;
}

const Settings: React.FC = () => {
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrestation, setEditingPrestation] = useState<Prestation | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    unit_price: ''
  });

  const loadPrestations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPrestations();
      setPrestations(data || []);
      
      // Expand all categories by default on first load
      const initialExpanded: Record<string, boolean> = {};
      const uniqueCats = Array.from(new Set((data || []).map((p: Prestation) => p.category))) as string[];
      uniqueCats.forEach((cat: string) => {
        initialExpanded[cat] = true;
      });
      setExpandedCategories(initialExpanded);
      
    } catch (error) {
      console.error("Error loading prestations", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrestations();
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleOpenModal = (prestation: Prestation | null = null) => {
    if (prestation) {
      setEditingPrestation(prestation);
      setFormData({
        category: prestation.category,
        name: prestation.name,
        unit_price: prestation.unit_price.toString()
      });
    } else {
      setEditingPrestation(null);
      setFormData({ category: '', name: '', unit_price: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        unit_price: parseFloat(formData.unit_price)
      };
      if (editingPrestation) {
        await updatePrestation(editingPrestation.id, data);
      } else {
        await createPrestation(data);
      }
      setIsModalOpen(false);
      loadPrestations();
    } catch (error) {
      console.error("Error saving prestation", error);
    }
  };

  const handleDelete = async (id: number) => {
    const isMobile = window.innerWidth < 768;
    if (isMobile || window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      try {
        await deletePrestation(id);
        loadPrestations();
      } catch (error: any) {
        alert(error.message || "Erreur lors de la suppression.");
      }
    }
  };

  const handleDeleteCategory = async (category: string) => {
    const isMobile = window.innerWidth < 768;
    if (isMobile || window.confirm(`Supprimer TOUTE la catégorie "${category}" ?`)) {
      try {
        await deleteCategory(category);
        loadPrestations();
      } catch (error: any) {
        alert(error.message || "Erreur lors de la suppression.");
      }
    }
  };

  const filteredPrestations = prestations.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(prestations.map(p => p.category)));

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-vert-foret dark:text-slate-100 uppercase tracking-tight">Paramètres</h1>
          <p className="text-sm md:text-base text-vert-sauge dark:text-slate-400 font-medium">Gestion du catalogue et des tarifs</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary w-full md:w-auto py-3 md:py-2.5 shadow-xl shadow-vert-olive/20"
        >
          <Plus size={20} />
          <span>Nouvel Article</span>
        </button>
      </div>

      {/* Search Bar - Optimized for mobile */}
      <div className="relative group sticky top-0 md:relative z-10 pt-2 bg-rose-poudre/80 dark:bg-slate-950/80 backdrop-blur-md">
        <Search className="absolute left-4 top-[calc(50%+4px)] -translate-y-1/2 text-vert-sauge group-focus-within:text-vert-olive transition-colors" size={20} />
        <input
          type="text"
          placeholder="Rechercher un service..."
          className="input-field pl-12 bg-white dark:bg-slate-900 shadow-lg md:shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content Area - Responsive Table/Cards */}
      <div className="space-y-4 md:space-y-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="card p-6 h-32 flex flex-col gap-4">
               <div className="w-1/3 h-4 skeleton"></div>
               <div className="w-full h-8 skeleton"></div>
            </div>
          ))
        ) : filteredPrestations.length === 0 ? (
          <div className="card p-12 text-center border-dashed border-2">
            <Tag size={48} className="mx-auto text-vert-sauge mb-4 opacity-20" />
            <p className="text-vert-sauge font-bold">Aucun article trouvé</p>
          </div>
        ) : (
          categories.map(cat => {
            const catPrestations = filteredPrestations.filter(p => p.category === cat);
            if (catPrestations.length === 0) return null;
            const isExpanded = expandedCategories[cat];
            
            return (
              <div key={cat} className="space-y-3">
                {/* Category Header - Clickable for mobile accordion */}
                <div 
                  onClick={() => toggleCategory(cat)}
                  className="flex items-center justify-between bg-vert-foret/5 dark:bg-slate-900/50 p-3 md:p-4 rounded-2xl cursor-pointer hover:bg-vert-foret/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="md:hidden">
                       {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                    <Tag size={16} className="text-vert-olive hidden md:block" />
                    <span className="text-sm font-black text-vert-foret dark:text-slate-200 uppercase tracking-widest">
                      {cat} <span className="ml-1 opacity-40 font-bold">({catPrestations.length})</span>
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat);
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                    title="Supprimer la catégorie"
                  >
                    <FolderMinus size={18} />
                  </button>
                </div>

                {/* Items List - Table on Desktop, Cards on Mobile */}
                {isExpanded && (
                  <div className="grid grid-cols-1 md:block gap-3">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-hidden card">
                      <table className="w-full text-left">
                        <tbody className="divide-y divide-rose-poudre dark:divide-slate-800">
                          {catPrestations.map(p => (
                            <tr key={p.id} className="hover:bg-rose-poudre/20 dark:hover:bg-slate-800/60 transition-colors group">
                              <td className="px-6 py-4 w-full">
                                <p className="text-sm font-bold text-vert-foret dark:text-slate-200">{p.name}</p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-black text-vert-olive dark:text-vert-sauge">{p.unit_price.toFixed(2)}€</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleOpenModal(p)} className="p-2 text-vert-sauge hover:text-vert-olive hover:bg-rose-poudre dark:hover:bg-slate-700 rounded-xl transition-all"><Edit2 size={16} /></button>
                                  <button onClick={() => handleDelete(p.id)} className="p-2 text-vert-sauge hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><Trash2 size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      {catPrestations.map(p => (
                        <div key={p.id} className="card p-4 flex items-center justify-between animate-fade-in active:bg-rose-poudre/30 dark:active:bg-slate-800/30 transition-colors">
                          <div className="flex-1" onClick={() => handleOpenModal(p)}>
                            <p className="text-sm font-bold text-vert-foret dark:text-slate-200">{p.name}</p>
                            <p className="text-lg font-black text-vert-olive dark:text-vert-sauge">{p.unit_price.toFixed(2)}€</p>
                          </div>
                          <div className="flex gap-2">
                             <button 
                              onClick={() => handleOpenModal(p)}
                              className="p-3 bg-vert-foret/5 dark:bg-slate-800 rounded-xl text-vert-foret dark:text-vert-sauge"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(p.id)}
                              className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl text-rose-500"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal - Optimized for mobile (full screen or large bottom sheet style) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-vert-foret/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full h-full md:h-auto md:max-w-md md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up">
            <div className="p-6 border-b border-rose-poudre dark:border-slate-800 flex justify-between items-center bg-vert-foret dark:bg-slate-800 text-rose-poudre">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {editingPrestation ? 'Modifier l\'Article' : 'Nouvel Article'}
                </h2>
                <p className="text-[10px] uppercase tracking-widest opacity-60">Édition du catalogue</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-3 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-vert-sauge dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Tag size={12} /> Catégorie
                </label>
                <input
                  required
                  type="text"
                  list="categories"
                  placeholder="ex: Hébergement, Boisson..."
                  className="input-field text-lg"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
                <datalist id="categories">
                  {categories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-vert-sauge dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ClipboardList size={12} /> Nom de la prestation
                </label>
                <input
                  required
                  type="text"
                  placeholder="ex: Chambre Double Deluxe"
                  className="input-field text-lg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-vert-sauge dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Euro size={12} /> Prix Unitaire (€)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input-field font-black text-3xl h-20 text-center md:text-left"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                />
              </div>

              <div className="pt-6 flex flex-col md:flex-row gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="order-2 md:order-1 px-6 py-4 md:py-3 border border-vert-sauge/20 dark:border-slate-700 text-vert-foret dark:text-slate-400 rounded-2xl hover:bg-rose-poudre dark:hover:bg-slate-800 transition-colors font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="order-1 md:order-2 btn-primary py-4 md:py-3 flex-1"
                >
                  <Check size={22} />
                  {editingPrestation ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
