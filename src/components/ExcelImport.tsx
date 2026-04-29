import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, X, FileSpreadsheet, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Mission, MissionType } from '../types';
import { mapExcelColumns, ColumnMapping } from '../services/aiService';

interface ExcelImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (missions: Partial<Mission>[]) => Promise<void>;
}

export function ExcelImport({ isOpen, onClose, onImport }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Partial<Mission>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const processFile = async (selectedFile: File) => {
    setIsProcessing(true);
    setIsAnalyzing(true);
    setError(null);
    setFile(selectedFile);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            setError("Le fichier est vide.");
            return;
          }

          // Extract headers
          const headers = Object.keys(jsonData[0] as object);
          const sampleRows = jsonData.slice(0, 3);

          // Get AI mapping
          const mapping = await mapExcelColumns(headers, sampleRows);

          if (!mapping) {
            setError("Impossible de mapper les colonnes automatiquement. Vérifiez que votre fichier contient au moins les colonnes 'Sinistre' et 'Assuré'.");
            return;
          }

          // Map data using AI results
          const mappedData: Partial<Mission>[] = (jsonData.map((row: any) => {
            const valSinistre = String(mapping.sinistre ? row[mapping.sinistre] : (row['Sinistre'] || row['sinistre'] || '')).trim();
            const valAssure = String(mapping.assure ? row[mapping.assure] : (row['Assuré'] || row['assure'] || row['Assure'] || '')).trim();
            
            if (!valSinistre || !valAssure) return null;

            const rowDate = mapping.dateMission ? row[mapping.dateMission] : (row['Date Mission'] || row['date'] || null);
            let valObs = String(mapping.observations ? row[mapping.observations] : (row['Observations'] || row['observations'] || '')).trim();
            let valIsAlert = Boolean(mapping.isAlert ? row[mapping.isAlert] : (row['En Alerte'] || row['isAlert']));

            // Logic for missing date: mark as alert and add info to observations
            if (!rowDate) {
              valIsAlert = true;
              const alertMsg = "ALERTE: Ajouter la date";
              if (!valObs.includes(alertMsg)) {
                valObs = valObs ? `${valObs} (${alertMsg})` : alertMsg;
              }
            }

            const rawTypeValue = String(mapping.type ? row[mapping.type] : (row['Type'] || row['type'] || 'GP')).trim().toUpperCase();
            let finalType: MissionType = 'GP';
            
            if (rawTypeValue.includes('SAD AUTO')) finalType = 'SAD auto';
            else if (rawTypeValue.includes('SAD')) finalType = 'SAD';
            else if (rawTypeValue.includes('GAG')) finalType = 'GAG';
            else if (rawTypeValue.includes('CC')) finalType = 'CC';
            else if (rawTypeValue.includes('GP') || rawTypeValue.includes('GRANDE PERTE')) finalType = 'GP';
            else finalType = 'GP'; // Par défaut

            return {
              sinistre: valSinistre,
              assure: valAssure,
              type: finalType,
              observations: valObs,
              dateMission: rowDate || null,
              arEnvoye: Boolean(mapping.arEnvoye ? row[mapping.arEnvoye] : (row['AR Envoyé'] || row['arEnvoye'] || false)),
              kycOk: Boolean(mapping.kycOk ? row[mapping.kycOk] : (row['KYC OK'] || row['kycOk'] || false)),
              isAlert: valIsAlert,
              reasonNonSad: String(mapping.reasonNonSad ? row[mapping.reasonNonSad] : (row['Raison Non SAD'] || row['reasonNonSad'] || '')).trim(),
            } as Partial<Mission>;
          }).filter(m => m !== null) as Partial<Mission>[]);

          if (mappedData.length === 0) {
            setError("Aucune donnée valide trouvée après analyse par l'IA. Assurez-vous que les colonnes indispensables sont présentes.");
          } else {
            setPreviewData(mappedData);
          }
        } catch (err) {
          setError("Erreur lors de la lecture du fichier Excel.");
          console.error(err);
        } finally {
          setIsProcessing(false);
          setIsAnalyzing(false);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (err) {
      setError("Erreur lors de l'accès au fichier.");
      setIsProcessing(false);
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      processFile(droppedFile);
    } else {
      setError("Format de fichier non supporté. Utilisez .xlsx ou .xls");
    }
  };

  const handleConfirm = async () => {
    if (previewData.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      await onImport(previewData);
      onClose();
      reset();
    } catch (err: any) {
      console.error("Import error detail:", err);
      let msg = "Erreur lors de l'importation vers la base de données.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error) msg = `Erreur: ${parsed.error}`;
      } catch (e) {
        msg = err.message || msg;
      }
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewData([]);
    setError(null);
    setIsProcessing(false);
    setIsAnalyzing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0c0c0d] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight italic">Importation Excel</h2>
              <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-1.5 shadow-lg shadow-indigo-500/5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Assisted</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-mono font-bold uppercase tracking-widest mt-1">
              Synchronisation Massive de Données
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/5 rounded-2xl transition-all text-gray-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {!file ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/5 rounded-[2rem] p-16 flex flex-col items-center justify-center gap-4 hover:border-indigo-500/30 hover:bg-indigo-500/[0.02] transition-all cursor-pointer group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx, .xls" 
                className="hidden" 
              />
              <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-200">Glissez-déposez votre fichier</p>
                <p className="text-sm text-gray-500 font-mono uppercase tracking-[0.2em] mt-1">L'IA s'occupera du mapping des colonnes</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white tracking-tight">{file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {isAnalyzing ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                          <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-widest animate-pulse">L'IA analyse le fichier...</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest">
                          {previewData.length} Dossiers Identifiés
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={reset}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {previewData.length > 0 && !isAnalyzing && (
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-4 py-3 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Sinistre</th>
                        <th className="px-4 py-3 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Assuré</th>
                        <th className="px-4 py-3 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {previewData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.01]">
                          <td className="px-4 py-3 text-xs font-mono font-bold text-gray-400">{row.sinistre}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-gray-300">{row.assure}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-bold text-gray-500 tracking-widest uppercase border border-white/5">
                              {row.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 5 && (
                    <div className="p-3 text-center border-t border-white/5">
                      <p className="text-[10px] text-gray-600 font-mono font-bold uppercase tracking-widest">
                        + {previewData.length - 5} autres dossiers...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold tracking-tight">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 flex items-center justify-end gap-4 bg-white/[0.01]">
          <button
            onClick={onClose}
            className="px-8 py-3.5 text-[11px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={previewData.length === 0 || isProcessing || isAnalyzing}
            className="px-10 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Synchroniser {previewData.length > 0 ? `(${previewData.length} Dossiers)` : ''}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
