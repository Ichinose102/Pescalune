import React, { useEffect, useState } from 'react';
import { Plus, Search, User, Users, Phone, Mail, Edit2, Trash2, X, Check } from 'lucide-react';
import { fetchClients, createClient, updateClient, deleteClient } from '../api';

interface Client {
  id: number;
  last_name: string;
  first_name: string;
  phone: string;
  email: string;
  created_at: string;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    phone: '',
    email: ''
  });

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await fetchClients();
      setClients(data || []);
    } catch (error) {
      console.error("Error loading clients", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleOpenModal = (client: Client | null = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        last_name: client.last_name,
        first_name: client.first_name || '',
        phone: client.phone || '',
        email: client.email || ''
      });
    } else {
      setEditingClient(null);
      setFormData({ last_name: '', first_name: '', phone: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
      } else {
        await createClient(formData);
      }
      setIsModalOpen(false);
      loadClients();
    } catch (error) {
      console.error("Error saving client", error);
    }
  };

  const handleDelete = async (id: number) => {
    const isMobile = window.innerWidth < 768;
    if (isMobile || window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        await deleteClient(id);
        loadClients();
      } catch (error) {
        console.error("Error deleting client", error);
      }
    }
  };

  const filteredClients = clients.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery)) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-vert-foret dark:text-slate-100">Gestion des Clients</h1>
          <p className="text-vert-sauge dark:text-slate-400">Gérez votre base de données clients</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary py-3"
        >
          <Plus size={20} />
          Ajouter un Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vert-sauge group-focus-within:text-vert-olive transition-colors" size={20} />
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone ou email..."
          className="input-field pl-12 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Clients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="card p-6 h-40 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 skeleton rounded-xl"></div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 skeleton rounded-lg"></div>
                  <div className="w-8 h-8 skeleton rounded-lg"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-5 skeleton"></div>
                <div className="w-1/2 h-3 skeleton"></div>
              </div>
            </div>
          ))
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-20 card bg-transparent border-dashed border-2">
            <div className="w-20 h-20 bg-rose-poudre dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-vert-sauge">
              <Users size={40} />
            </div>
            <h3 className="text-xl font-bold text-vert-foret dark:text-slate-200 mb-2">Aucun client trouvé</h3>
            <p className="text-vert-sauge dark:text-slate-500">Essayez une autre recherche ou ajoutez un nouveau client.</p>
          </div>
        ) : (
          filteredClients.map(client => (
            <div key={client.id} className="card p-6 flex flex-col group relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-rose-poudre dark:bg-slate-800 rounded-2xl text-vert-foret dark:text-vert-sauge group-hover:bg-vert-olive group-hover:text-white transition-all duration-300">
                  <User size={24} />
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleOpenModal(client)}
                    className="p-2 text-vert-sauge hover:text-vert-olive hover:bg-rose-poudre dark:hover:bg-slate-800 rounded-xl transition-all"
                    title="Modifier"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-vert-sauge hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-vert-foret dark:text-slate-100 mb-4 group-hover:text-vert-olive transition-colors">
                {client.first_name} {client.last_name}
              </h3>
              
              <div className="space-y-3 mt-auto">
                <div className="flex items-center gap-3 text-sm font-medium text-vert-sauge dark:text-slate-400">
                  <div className="p-1.5 bg-rose-poudre/50 dark:bg-slate-800/50 rounded-lg"><Phone size={14} /></div>
                  <span>{client.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-vert-sauge dark:text-slate-400">
                  <div className="p-1.5 bg-rose-poudre/50 dark:bg-slate-800/50 rounded-lg"><Mail size={14} /></div>
                  <span className="truncate">{client.email || 'Non renseigné'}</span>
                </div>
              </div>

              {/* Decorative background element */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Users size={120} />
              </div>
            </div>
          )))}
      </div>

      {/* Modal - Add/Edit Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vert-foret/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-rose-poudre dark:border-slate-800 flex justify-between items-center bg-vert-foret dark:bg-slate-800 text-rose-poudre">
              <div>
                <h2 className="text-xl font-black">
                  {editingClient ? 'Modifier le Profil' : 'Nouveau Client'}
                </h2>
                <p className="text-[10px] uppercase tracking-widest opacity-60">Fiche client - Le Pescalune</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-vert-sauge dark:text-slate-500 uppercase tracking-widest ml-1">Nom</label>
                  <input
                    required
                    type="text"
                    className="input-field"
                    placeholder="DUBOIS"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-vert-sauge dark:text-slate-500 uppercase tracking-widest ml-1">Prénom</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Jean"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-vert-sauge dark:text-slate-500 uppercase tracking-widest ml-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-vert-sauge" size={18} />
                  <input
                    type="tel"
                    className="input-field pl-10"
                    placeholder="06 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-vert-sauge dark:text-slate-500 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-vert-sauge" size={18} />
                  <input
                    type="email"
                    className="input-field pl-10"
                    placeholder="client@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 border border-vert-sauge/20 dark:border-slate-700 text-vert-foret dark:text-slate-400 rounded-2xl hover:bg-rose-poudre dark:hover:bg-slate-800 transition-colors font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-4"
                >
                  <Check size={22} />
                  {editingClient ? 'Mettre à jour' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
