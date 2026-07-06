'use client';

import { useState, useMemo } from 'react';
import type { BudgetItem } from '@/lib/types';
import { addBudgetItemAction, updateBudgetItemAction, deleteBudgetItemAction } from '@/app/dashboard/[id]/budget-actions';
import CircularGauge from './CircularGauge';

type Props = {
  eventId: string;
  initialItems: BudgetItem[];
};

const SUGGESTED_CATEGORIES = [
  "Dot",
  "Tenue traditionnelle (Boubou/Wax)",
  "Traiteur",
  "Location salle",
  "DJ / Sonorisation",
  "Décoration",
  "Photographe/Vidéaste",
  "Taille-basse",
  "Transport",
  "Autre"
];

export default function BudgetTracker({ eventId, initialItems }: Props) {
  const [items, setItems] = useState<BudgetItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [category, setCategory] = useState('');
  const [planned, setPlanned] = useState('');
  const [actual, setActual] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlanned, setEditPlanned] = useState('');
  const [editActual, setEditActual] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const totalPlanned = useMemo(() => items.reduce((sum, item) => sum + item.planned_amount, 0), [items]);
  const totalActual = useMemo(() => items.reduce((sum, item) => sum + item.actual_amount, 0), [items]);
  const remaining = totalPlanned - totalActual;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !planned) return;
    
    setLoading(true);
    try {
      const plannedAmt = parseInt(planned, 10) || 0;
      const actualAmt = parseInt(actual, 10) || 0;
      const newItem = await addBudgetItemAction(eventId, category, plannedAmt, actualAmt);
      
      // Update with the real item
      setItems(prev => [newItem, ...prev]);
      
      setCategory('');
      setPlanned('');
      setActual('');
    } catch (err) {
      alert("Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditPlanned(item.planned_amount.toString());
    setEditActual(item.actual_amount.toString());
    setEditNotes(item.notes || '');
  };

  const handleSaveEdit = async (id: string) => {
    setLoading(true);
    try {
      const p = parseInt(editPlanned, 10) || 0;
      const a = parseInt(editActual, 10) || 0;
      await updateBudgetItemAction(eventId, id, p, a, editNotes);
      
      setItems(prev => prev.map(item => 
        item.id === id 
          ? { ...item, planned_amount: p, actual_amount: a, notes: editNotes } 
          : item
      ));
      setEditingId(null);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce poste budgétaire ?')) return;
    setLoading(true);
    try {
      await deleteBudgetItemAction(eventId, id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-festara-navy uppercase tracking-wider mb-1">Budget Prévu</p>
            <p className="text-2xl font-serif text-festara-gold">{totalPlanned.toLocaleString()} FCFA</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-festara-navy uppercase tracking-wider mb-1">Dépensé</p>
            <p className="text-2xl font-serif text-festara-navy">{totalActual.toLocaleString()} FCFA</p>
          </div>
          <CircularGauge
            value={totalActual}
            max={totalPlanned}
            label="Consommé"
            colorClass="text-festara-navy"
            strokeColor="#1A2A4A"
          />
        </div>
        <div className={`p-6 rounded-2xl shadow-sm border border-black/5 flex items-center justify-between ${remaining < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${remaining < 0 ? 'text-red-700' : 'text-green-700'}`}>Restant</p>
            <p className={`text-2xl font-serif ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {Math.abs(remaining).toLocaleString()} FCFA {remaining < 0 && '(Dépassement)'}
            </p>
          </div>
        </div>
      </div>

      {/* Add form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
        <h3 className="text-lg font-bold text-festara-navy mb-4">Ajouter un poste</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              list="budget-categories"
              placeholder="Catégorie (ex: Traiteur)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
            <datalist id="budget-categories">
              {SUGGESTED_CATEGORIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div>
            <input
              type="number"
              placeholder="Prévu (FCFA)"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              value={planned}
              onChange={(e) => setPlanned(e.target.value)}
              required
              min="0"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Dépensé"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              min="0"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-festara-navy text-white rounded-lg hover:bg-festara-ink transition-colors font-bold text-sm whitespace-nowrap"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>

      {/* Items list */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-festara-sand text-festara-navy text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold">Catégorie</th>
              <th className="px-6 py-4 font-bold">Prévu</th>
              <th className="px-6 py-4 font-bold">Dépensé</th>
              <th className="px-6 py-4 font-bold">Écart</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {items.map(item => {
              const diff = item.planned_amount - item.actual_amount;
              const isEditing = editingId === item.id;

              return (
                <tr key={item.id} className="hover:bg-black/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-festara-navy">
                    {item.category}
                    {isEditing && (
                      <input
                        type="text"
                        placeholder="Notes..."
                        className="mt-2 w-full px-2 py-1 text-xs border rounded"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                      />
                    )}
                    {!isEditing && item.notes && (
                      <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-24 px-2 py-1 text-sm border rounded"
                        value={editPlanned}
                        onChange={(e) => setEditPlanned(e.target.value)}
                      />
                    ) : (
                      <span className="text-festara-gold font-bold">{item.planned_amount.toLocaleString()} FCFA</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-24 px-2 py-1 text-sm border rounded"
                        value={editActual}
                        onChange={(e) => setEditActual(e.target.value)}
                      />
                    ) : (
                      <span className="text-festara-navy">{item.actual_amount.toLocaleString()} FCFA</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${diff < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {diff > 0 ? '+' : ''}{diff.toLocaleString()} FCFA
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSaveEdit(item.id)} disabled={loading} className="text-sm font-bold text-festara-navy hover:underline">Enregistrer</button>
                        <button onClick={() => setEditingId(null)} className="text-sm text-gray-400 hover:text-black">Annuler</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleStartEdit(item)} className="text-sm font-bold text-festara-gold hover:underline">Modifier</button>
                        <button onClick={() => handleDelete(item.id)} disabled={loading} className="text-sm text-red-500 hover:text-red-700">Supprimer</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                  Aucun poste budgétaire pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
