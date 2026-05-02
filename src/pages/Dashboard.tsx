import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Users, StickyNote, TrendingUp, Clock } from 'lucide-react';
import { fetchAdditions, fetchClients, fetchNotes } from '../api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAdditions: 0,
    totalRevenue: 0,
    clientCount: 0,
    noteCount: 0
  });
  const [recentAdditions, setRecentAdditions] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [additions, clients, notes] = await Promise.all([
          fetchAdditions(),
          fetchClients(),
          fetchNotes()
        ]);

        setStats({
          totalAdditions: additions.length,
          totalRevenue: additions.reduce((acc: number, curr: any) => acc + curr.total, 0),
          clientCount: clients.length,
          noteCount: notes.length
        });

        setRecentAdditions(additions.slice(0, 5));
      } catch (error) {
        console.error("Erreur lors du chargement des stats:", error);
      }
    };
    loadData();
  }, []);

  const cards = [
    { label: 'Chiffre d\'affaires', value: `${stats.totalRevenue.toFixed(2)}€`, icon: <TrendingUp className="text-vert-olive" />, color: 'bg-white' },
    { label: 'Additions validées', value: stats.totalAdditions, icon: <ClipboardList className="text-vert-olive" />, color: 'bg-white' },
    { label: 'Clients enregistrés', value: stats.clientCount, icon: <Users className="text-vert-olive" />, color: 'bg-white' },
    { label: 'Notes en attente', value: stats.noteCount, icon: <StickyNote className="text-vert-olive" />, color: 'bg-white' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-bold text-vert-foret">Le Pescalune</h1>
        <p className="text-vert-sauge text-lg">Tableau de bord de gestion</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className={`${card.color} p-6 rounded-2xl shadow-sm border border-vert-sauge/20 flex items-center space-x-4`}>
            <div className="p-3 bg-rose-poudre rounded-xl">
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-vert-sauge font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-vert-foret">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-vert-foret flex items-center">
            <Clock className="mr-2" size={20} /> Actions Rapides
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => navigate('/carte')}
              className="flex items-center justify-between p-4 bg-vert-foret text-rose-poudre rounded-xl hover:bg-vert-olive transition-colors group"
            >
              <span className="font-medium">Nouvelle Addition</span>
              <ClipboardList size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/clients')}
              className="flex items-center justify-between p-4 bg-white border border-vert-foret text-vert-foret rounded-xl hover:bg-rose-poudre transition-colors group"
            >
              <span className="font-medium">Voir les Clients</span>
              <Users size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/notes')}
              className="flex items-center justify-between p-4 bg-white border border-vert-foret text-vert-foret rounded-xl hover:bg-rose-poudre transition-colors group"
            >
              <span className="font-medium">Prendre une Note</span>
              <StickyNote size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Recent Additions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-vert-foret">Dernières Additions</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-vert-sauge/20 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-rose-poudre/50 border-b border-vert-sauge/10">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-vert-foret">Date</th>
                  <th className="px-6 py-4 text-sm font-bold text-vert-foret">Client</th>
                  <th className="px-6 py-4 text-sm font-bold text-vert-foret text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vert-sauge/10">
                {recentAdditions.map((add) => (
                  <tr key={add.id} className="hover:bg-rose-poudre/20 transition-colors">
                    <td className="px-6 py-4 text-sm">{new Date(add.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {add.client_last_name ? `${add.client_first_name || ''} ${add.client_last_name}`.trim() : 'Client anonyme'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-vert-olive">{add.total.toFixed(2)}€</td>
                  </tr>
                ))}
                {recentAdditions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-vert-sauge italic">Aucune addition enregistrée</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
