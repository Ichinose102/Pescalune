import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, ClipboardList, Tag, Euro, FolderMinus } from 'lucide-react';
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
    } catch (error) {
      console.error("Error loading prestations", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrestations();
  }, []);

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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article de la carte ?")) {
      try {
        await deletePrestation(id);
        loadPrestations();
      } catch (error: any) {
        console.error("Error deleting prestation", error);
        alert(error.message || "Erreur lors de la suppression de l'article.");
      }
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer TOUTE la catégorie "${category}" et tous les articles qu'elle contient ?`)) {
      try {
        await deleteCategory(category);
        loadPrestations();
      } catch (error: any) {
        console.error("Error deleting category", error);
        alert(error.message || "Erreur lors de la suppression de la catégorie.");
      }
    }
  };

  const filteredPrestations = prestations.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(prestations.map(p => p.category)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-vert-foret dark:text-slate-100">Paramètres & Carte</h1>
          <p className="text-vert-sauge dark:text-slate-400">Gérez les services et tarifs de l'établissement</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-vert-foret dark:bg-slate-800 text-rose-poudre px-6 py-3 rounded-xl hover:bg-vert-olive dark:hover:bg-slate-700 transition-colors shadow-lg font-bold"
        >
          <Plus size={20} />
          Ajouter un Article
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-vert-sauge/20 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 md:p-6 border-b border-rose-poudre dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vert-sauge dark:text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom ou catégorie..."
              className="w-full pl-12 pr-4 py-3 bg-rose-poudre/10 dark:bg-slate-800/50 border border-vert-sauge/20 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-vert-olive dark:focus:ring-slate-600 shadow-sm text-vert-foret dark:text-slate-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-rose-poudre/50 dark:bg-slate-800/80">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-vert-sauge dark:text-slate-400 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-xs font-bold text-vert-sauge dark:text-slate-400 uppercase tracking-wider">Nom de la prestation</th>
                <th className="px-6 py-4 text-xs font-bold text-vert-sauge dark:text-slate-400 uppercase tracking-wider text-right">Prix Unitaire</th>
                <th className="px-6 py-4 text-xs font-bold text-vert-sauge dark:text-slate-400 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-poudre dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-vert-sauge dark:text-slate-500 italic">Chargement des données...</td>
                </tr>
              ) : filteredPrestations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-vert-sauge dark:text-slate-500 italic">Aucun article trouvé</td>
                </tr>
              ) : (
                categories.map(cat => {
                  const catPrestations = filteredPrestations.filter(p => p.category === cat);
                  if (catPrestations.length === 0) return null;
                  return (
                    <React.Fragment key={cat}>
                      <tr className="bg-rose-poudre/20 dark:bg-slate-800/40">
                        <td colSpan={3} className="px-6 py-2 text-xs font-bold text-vert-foret dark:text-slate-300 uppercase tracking-widest">
                          {cat} ({catPrestations.length})
                        </td>
                        <td className="px-6 py-2 text-center">
                          <button 
                            onClick={() => handleDeleteCategory(cat)}
                            className="flex items-center gap-1 mx-auto text-[10px] font-bold text-rose-600 hover:text-rose-700 transition-colors"
                            title={`Supprimer toute la catégorie ${cat}`}
                          >
                            <FolderMinus size={14} /> Supprimer la catégorie
                          </button>
                        </td>
                      </tr>
                      {catPrestations.map(p => (
                        <tr key={p.id} className="hover:bg-rose-poudre/10 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="px-6 py-4"></td>
                          <td className="px-6 py-4 text-sm font-bold text-vert-foret dark:text-slate-200">{p.name}</td>
                          <td className="px-6 py-4 text-sm font-bold text-vert-olive dark:text-vert-sauge text-right">{p.unit_price.toFixed(2)}€</td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleOpenModal(p)}
                                className="p-2 text-vert-sauge dark:text-slate-500 hover:text-vert-olive dark:hover:text-slate-300 hover:bg-rose-poudre dark:hover:bg-slate-700 rounded-lg transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(p.id)}
                                className="p-2 text-vert-sauge dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Add/Edit Prestation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vert-foret/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-rose-poudre dark:border-slate-800 flex justify-between items-center bg-vert-foret dark:bg-slate-800 text-rose-poudre">
              <h2 className="text-xl font-bold">
                {editingPrestation ? 'Modifier l\'Article' : 'Nouvel Article'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-vert-olive dark:hover:bg-slate-700 p-1 rounded transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-vert-sauge dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Tag size={14} /> Catégorie
                </label>
                <input
                  required
                  type="text"
                  list="categories"
                  placeholder="ex: Hébergement, Boisson, Repas..."
                  className="w-full p-3 bg-rose-poudre/20 dark:bg-slate-800 border border-vert-sauge/20 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-vert-olive dark:focus:ring-slate-600 text-vert-foret dark:text-slate-100"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
                <datalist id="categories">
                  {categories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-vert-sauge dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList size={14} /> Nom de la prestation
                </label>
                <input
                  required
                  type="text"
                  placeholder="ex: Petit-déjeuner continental"
                  className="w-full p-3 bg-rose-poudre/20 dark:bg-slate-800 border border-vert-sauge/20 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-vert-olive dark:focus:ring-slate-600 text-vert-foret dark:text-slate-100"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-vert-sauge dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Euro size={14} /> Prix Unitaire (€)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full p-3 bg-rose-poudre/20 dark:bg-slate-800 border border-vert-sauge/20 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-vert-olive dark:focus:ring-slate-600 font-bold text-vert-foret dark:text-slate-100"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-vert-sauge/20 dark:border-slate-700 text-vert-foret dark:text-slate-300 rounded-xl hover:bg-rose-poudre dark:hover:bg-slate-800 transition-colors font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-vert-olive dark:bg-slate-700 text-white px-6 py-3 rounded-xl hover:bg-vert-foret dark:hover:bg-slate-600 transition-all shadow-lg font-bold flex items-center justify-center gap-2"
                >
                  <Check size={20} />
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
