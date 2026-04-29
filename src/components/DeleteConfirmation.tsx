import { Trash2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  itemTitle?: string;
}

export function DeleteConfirmation({ isOpen, onConfirm, onCancel, itemTitle }: DeleteConfirmationProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#111113] border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden"
        >
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl mx-auto flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Supprimer le dossier ?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Cette action est irréversible. Le dossier <span className="text-gray-300 font-mono font-bold">{itemTitle}</span> sera définitivement effacé.
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={onConfirm}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer Définitivement
              </button>
              <button
                onClick={onCancel}
                className="w-full py-4 border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
