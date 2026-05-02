import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Users, StickyNote, TrendingUp, Clock, Plus } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const cards = [
    { label: 'Chiffre d\'affaires', value: `${stats.totalRevenue.toFixed(2)}€`, icon: <TrendingUp className="text-vert-olive dark:text-vert-sauge" />, color: 'text-vert-olive' },
    { label: 'Additions validées', value: stats.totalAdditions, icon: <ClipboardList className="text-vert-olive dark:text-vert-sauge" />, color: 'text-vert-foret' },
    { label: 'Clients enregistrés', value: stats.clientCount, icon: <Users className="text-vert-olive dark:text-vert-sauge" />, color: 'text-vert-foret' },
    { label: 'Notes en attente', value: stats.noteCount, icon: <StickyNote className="text-vert-olive dark:text-vert-sauge" />, color: 'text-vert-foret' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-vert-foret dark:text-slate-100">Le Pescalune</h1>
          <p className="text-vert-sauge dark:text-slate-400 text-lg">Tableau de bord de gestion</p>
        </div>
        <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-vert-sauge/20 dark:border-slate-800 shadow-sm flex items-center gap-2 text-sm font-medium text-vert-foret dark:text-slate-300">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Système opérationnel
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="card p-6 h-24 flex items-center gap-4">
              <div className="w-12 h-12 skeleton rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="w-20 h-3 skeleton"></div>
                <div className="w-16 h-6 skeleton"></div>
              </div>
            </div>
          ))
        ) : (
          cards.map((card, i) => (
            <div key={i} className="card p-6 flex items-center space-x-4 group hover:scale-[1.02] cursor-default">
              <div className="p-3 bg-rose-poudre dark:bg-slate-800 rounded-xl group-hover:bg-vert-sauge/20 transition-colors">
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-vert-sauge dark:text-slate-400 font-medium">{card.label}</p>
                <p className={`text-2xl font-bold dark:text-slate-100`}>{card.value}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-vert-foret dark:text-slate-200 flex items-center">
            <Clock className="mr-2" size={20} /> Actions Rapides
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => navigate('/carte')}
              className="flex items-center justify-between p-5 bg-vert-foret dark:bg-slate-800 text-rose-poudre rounded-2xl hover:bg-vert-olive dark:hover:bg-slate-700 transition-all shadow-lg group active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg"><Plus size={24} /></div>
                <span className="font-bold text-lg">Nouvelle Addition</span>
              </div>
              <ClipboardList size={20} className="group-hover:translate-x-1 transition-transform opacity-60" />
            </button>
            <button 
              onClick={() => navigate('/clients')}
              className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-vert-foret dark:border-slate-800 text-vert-foret dark:text-slate-200 rounded-2xl hover:bg-rose-poudre dark:hover:bg-slate-800 transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-rose-poudre dark:bg-slate-800 rounded-lg"><Users size={24} /></div>
                <span className="font-bold text-lg">Voir les Clients</span>
              </div>
              <Users size={20} className="group-hover:translate-x-1 transition-transform opacity-60" />
            </button>
            <button 
              onClick={() => navigate('/notes')}
              className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-vert-foret dark:border-slate-800 text-vert-foret dark:text-slate-200 rounded-2xl hover:bg-rose-poudre dark:hover:bg-slate-800 transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-rose-poudre dark:bg-slate-800 rounded-lg"><StickyNote size={24} /></div>
                <span className="font-bold text-lg">Prendre une Note</span>
              </div>
              <StickyNote size={20} className="group-hover:translate-x-1 transition-transform opacity-60" />
            </button>
          </div>
        </div>

        {/* Recent Additions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-vert-foret dark:text-slate-200">Dernières Additions</h2>
            <button className="text-sm font-bold text-vert-olive dark:text-vert-sauge hover:underline">Voir tout</button>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-rose-poudre/30 dark:bg-slate-800/50 border-b border-vert-sauge/10 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-vert-foret dark:text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-vert-foret dark:text-slate-400 uppercase tracking-widest">Client</th>
                    <th className="px-6 py-4 text-xs font-bold text-vert-foret dark:text-slate-400 uppercase tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vert-sauge/10 dark:divide-slate-800">
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><div className="w-20 h-4 skeleton"></div></td>
                        <td className="px-6 py-4"><div className="w-32 h-4 skeleton"></div></td>
                        <td className="px-6 py-4 text-right"><div className="w-16 h-4 skeleton ml-auto"></div></td>
                      </tr>
                    ))
                  ) : recentAdditions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-vert-sauge dark:text-slate-500 italic">Aucune addition enregistrée</td>
                    </tr>
                  ) : (
                    recentAdditions.map((add) => (
                      <tr key={add.id} className="hover:bg-rose-poudre/20 dark:hover:bg-slate-800/40 transition-colors group cursor-default">
                        <td className="px-6 py-4 text-sm dark:text-slate-300">
                          {new Date(add.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-vert-foret dark:text-slate-200">
                          {add.client_last_name ? `${add.client_first_name || ''} ${add.client_last_name}`.trim() : 'Client anonyme'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-black text-vert-olive dark:text-vert-sauge">{add.total.toFixed(2)}€</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
