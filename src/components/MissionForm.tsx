import React, { useState, useEffect } from 'react';
import { Mission, MissionType } from '../types';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface MissionFormProps {
  mission: Mission | null;
  onSubmit: (data: Partial<Mission>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function MissionForm({ mission, onSubmit, onCancel, isOpen }: MissionFormProps) {
  const [formData, setFormData] = useState<Partial<Mission>>({
    sinistre: '',
    assure: '',
    type: 'GP',
    dateMission: '',
    arEnvoye: false,
    kycOk: false,
    isAlert: false,
    reasonNonSad: '',
    observations: '',
  });

  useEffect(() => {
    if (mission) {
      setFormData({
        sinistre: mission.sinistre,
        assure: mission.assure,
        type: mission.type,
        dateMission: mission.dateMission?.toDate ? format(mission.dateMission.toDate(), 'yyyy-MM-dd') : '',
        arEnvoye: mission.arEnvoye || false,
        kycOk: mission.kycOk || false,
        isAlert: mission.isAlert || false,
        reasonNonSad: mission.reasonNonSad || '',
        observations: mission.observations,
      });
    } else {
      setFormData({
        sinistre: '',
        assure: '',
        type: 'GP',
        dateMission: format(new Date(), 'yyyy-MM-dd'),
        arEnvoye: false,
        kycOk: false,
        isAlert: false,
        reasonNonSad: '',
        observations: '',
      });
    }
  }, [mission, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#111113] border border-white/5 rounded-[2rem] shadow-2xl w-full max-w-2xl my-auto overflow-hidden"
        >
          <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {mission ? 'Modifier Mission' : 'Démarrer Mission'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5 ml-1">
                  N° Dossier / Sinistre
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: 18096314673"
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-mono text-white focus:ring-1 focus:ring-indigo-500 focus:bg-white/10 outline-none transition-all"
                  value={formData.sinistre}
                  onChange={(e) => setFormData({ ...formData, sinistre: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                  Type de Mission
                </label>
                <select
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:bg-white/10 outline-none transition-all appearance-none"
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as MissionType;
                    setFormData({  ...formData, type: newType, reasonNonSad: newType === 'SAD' ? '' : formData.reasonNonSad });
                  }}
                >
                  <option value="GP" className="bg-[#111113]">GP (Garage Partenaire)</option>
                  <option value="CC" className="bg-[#111113]">CC (Garage Client)</option>
                  <option value="SAD" className="bg-[#111113]">SAD (Service à Domicile)</option>
                  <option value="SAD auto" className="bg-[#111113]">SAD auto</option>
                  <option value="GAG" className="bg-[#111113]">GAG</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                  Nom de l'Assuré
                </label>
                <input
                  required
                  type="text"
                  placeholder="M. MICHEL SOURBE"
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:bg-white/10 outline-none transition-all"
                  value={formData.assure}
                  onChange={(e) => setFormData({ ...formData, assure: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                  Date de Mission
                </label>
                <input
                  required
                  type="date"
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:bg-white/10 outline-none transition-all [color-scheme:dark]"
                  value={formData.dateMission as string}
                  onChange={(e) => setFormData({ ...formData, dateMission: e.target.value })}
                />
              </div>
            </div>

            <AnimatePresence>
              {formData.type !== 'SAD' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-bold uppercase tracking-widest text-red-400/80 ml-1">
                    Pourquoi pas SAD ?
                  </label>
                  <select
                    required
                    className="w-full px-5 py-3 bg-red-400/5 border border-red-400/20 rounded-2xl text-sm text-white focus:ring-1 focus:ring-red-500 outline-none transition-all appearance-none"
                    value={formData.reasonNonSad}
                    onChange={(e) => setFormData({ ...formData, reasonNonSad: e.target.value })}
                  >
                    <option value="" disabled className="bg-[#111113]">Sélectionnez une raison</option>
                    <option value="Pas de disponibilité" className="bg-[#111113]">Pas de disponibilité</option>
                    <option value="Véhicule non roulant" className="bg-[#111113]">Véhicule non roulant</option>
                    <option value="Refus assuré" className="bg-[#111113]">Refus assuré</option>
                    <option value="autres" className="bg-[#111113]">Autres</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-wrap gap-8 items-center">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.isAlert}
                    onChange={(e) => setFormData({ ...formData, isAlert: e.target.checked })}
                  />
                  <div className={`w-5 h-5 border-2 rounded-md transition-all ${formData.isAlert ? 'bg-red-500 border-red-500' : 'border-white/10 group-hover:border-white/20'}`}>
                    {formData.isAlert && <Save className="w-3 h-3 text-white m-auto mt-0.5" />}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest">EN ALERTE</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.arEnvoye}
                    onChange={(e) => setFormData({ ...formData, arEnvoye: e.target.checked })}
                  />
                  <div className={`w-5 h-5 border-2 rounded-md transition-all ${formData.arEnvoye ? 'bg-indigo-500 border-indigo-500' : 'border-white/10 group-hover:border-white/20'}`}>
                    {formData.arEnvoye && <Save className="w-3 h-3 text-white m-auto mt-0.5" />}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">AR ENVOYÉ</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.kycOk}
                    onChange={(e) => setFormData({ ...formData, kycOk: e.target.checked })}
                  />
                  <div className={`w-5 h-5 border-2 rounded-md transition-all ${formData.kycOk ? 'bg-emerald-500 border-emerald-500' : 'border-white/10 group-hover:border-white/20'}`}>
                    {formData.kycOk && <Save className="w-3 h-3 text-white m-auto mt-0.5" />}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">KYC OK</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                Observations libres
              </label>
              <textarea
                rows={3}
                placeholder="Précisions sur le dossier..."
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              />
            </div>

            <div className="pt-6 flex flex-col-reverse md:flex-row gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-4 border border-white/5 text-gray-400 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                {mission ? 'Mettre à jour' : 'Enregistrer Dossier'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
