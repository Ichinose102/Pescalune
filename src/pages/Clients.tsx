import React, { useEffect, useState } from 'react';
import { Plus, Search, User, Phone, Mail, Edit2, Trash2, X, Check } from 'lucide-react';
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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-vert-foret">Gestion des Clients</h1>
          <p className="text-vert-sauge">Gérez votre base de données clients</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-vert-foret text-rose-poudre px-6 py-3 rounded-xl hover:bg-vert-olive transition-colors shadow-lg font-bold"
        >
          <Plus size={20} />
          Ajouter un Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vert-sauge" size={20} />
        <input
          type="text"
          placeholder="Rechercher un client par nom, téléphone ou email..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-vert-sauge/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-vert-olive shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Clients List */}
      {isLoading ? (
        <div className="text-center py-12 text-vert-sauge">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <div key={client.id} className="bg-white p-6 rounded-2xl shadow-sm border border-vert-sauge/20 hover:shadow-md transition-shadow relative group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-rose-poudre rounded-xl text-vert-foret">
                  <User size={24} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(client)}
                    className="p-2 text-vert-sauge hover:text-vert-olive hover:bg-rose-poudre rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-vert-sauge hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-vert-foret mb-4">
                {client.first_name} {client.last_name}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-vert-sauge">
                  <Phone size={16} />
                  <span>{client.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-vert-sauge">
                  <Mail size={16} />
                  <span className="truncate">{client.email || 'Non renseigné'}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredClients.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-vert-sauge/30 text-vert-sauge">
              Aucun client trouvé.
            </div>
          )}
        </div>
      )}

      {/* Modal - Add/Edit Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vert-foret/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-rose-poudre flex justify-between items-center bg-vert-foret text-rose-poudre">
              <h2 className="text-xl font-bold">
                {editingClient ? 'Modifier le Client' : 'Nouveau Client'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-vert-olive p-1 rounded transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-vert-sauge uppercase tracking-wider">Nom</label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 bg-rose-poudre/20 border border-vert-sauge/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-vert-olive"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-vert-sauge uppercase tracking-wider">Prénom</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-rose-poudre/20 border border-vert-sauge/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-vert-olive"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-vert-sauge uppercase tracking-wider">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-vert-sauge" size={18} />
                  <input
                    type="tel"
                    className="w-full pl-10 p-3 bg-rose-poudre/20 border border-vert-sauge/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-vert-olive"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-vert-sauge uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-vert-sauge" size={18} />
                  <input
                    type="email"
                    className="w-full pl-10 p-3 bg-rose-poudre/20 border border-vert-sauge/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-vert-olive"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-vert-sauge/20 text-vert-foret rounded-xl hover:bg-rose-poudre transition-colors font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-vert-olive text-white px-6 py-3 rounded-xl hover:bg-vert-foret transition-all shadow-lg font-bold flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  {editingClient ? 'Mettre à jour' : 'Enregistrer'}
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
