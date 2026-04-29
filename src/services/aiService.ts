import { GoogleGenAI, Type } from "@google/genai";
import { Mission } from "../types";

let aiInstance: any = null;

function getAi() {
  if (!aiInstance) {
    const apiKey = (process.env as any).GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface ColumnMapping {
  sinistre: string;
  assure: string;
  type?: string;
  observations?: string;
  dateMission?: string;
  arEnvoye?: string;
  kycOk?: string;
  isAlert?: string;
  reasonNonSad?: string;
}

export async function mapExcelColumns(headers: string[], sampleRows: any[]): Promise<ColumnMapping | null> {
  const prompt = `
    En tant qu'expert en analyse de données, ta tâche est de mapper les colonnes d'un fichier Excel vers les champs d'une application de gestion de missions de sinistres.
    
    Voici les champs cibles attendus par l'application :
    - sinistre (obligatoire) : Le numéro de dossier ou de sinistre (ex: "2024-001", "SIN-123").
    - assure (obligatoire) : Le nom de la personne assurée ou du client (ex: "Jean Dupont", "Mme Martin").
    - type : Le type de mission. Cherche une colonne contenant des abréviations comme GP, CC, SAD, GAG ou des descriptions de type de sinistre. Valeurs finales attendues par le système : GP, CC, SAD, SAD auto, GAG.
    - observations : Notes, commentaires ou détails sur la mission.
    - dateMission : La date de la mission, du rendez-vous ou de l'expertise.
    - arEnvoye : Colonne indiquant si l'Accusé de Réception (AR) est envoyé.
    - kycOk : Colonne indiquant si le KYC est valide ou complet.
    - isAlert : Colonne indiquant une alerte ou un problème.
    - reasonNonSad : La raison pour laquelle ce n'est pas en SAD.

    Voici les en-têtes trouvés dans le fichier Excel : ${JSON.stringify(headers)}
    Voici un échantillon des premières lignes : ${JSON.stringify(sampleRows)}

    Instructions :
    1. Analyse les noms des colonnes ET le contenu des lignes pour trouver la meilleure correspondance.
    2. Pour le champ "type", regarde si une colonne contient des valeurs comme "SAD", "GAG", "GP" ou des mentions de "Simplifié" (SAD).
    3. Retourne uniquement l'objet JSON de mapping.
  `;

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sinistre: { type: Type.STRING },
            assure: { type: Type.STRING },
            type: { type: Type.STRING },
            observations: { type: Type.STRING },
            dateMission: { type: Type.STRING },
            arEnvoye: { type: Type.STRING },
            kycOk: { type: Type.STRING },
            isAlert: { type: Type.STRING },
            reasonNonSad: { type: Type.STRING },
          },
          required: ["sinistre", "assure"]
        }
      }
    });

    const result = response.text;
    if (result) {
      return JSON.parse(result) as ColumnMapping;
    }
    return null;
  } catch (error) {
    console.error("Erreur lors du mapping IA :", error);
    return null;
  }
}
