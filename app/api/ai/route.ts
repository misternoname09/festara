import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Securite : L'utilisateur doit etre connecte pour utiliser l'IA
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { ok } = rateLimit(`ai:${user.id}`, 10, 10 * 60 * 1000);
    if (!ok) {
      return NextResponse.json({ error: 'Trop de demandes. Réessayez dans quelques minutes.' }, { status: 429 });
    }

    const { title } = await req.json();

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ 
        error: "Clé API Groq manquante. Veuillez l'ajouter dans .env.local." 
      }, { status: 500 });
    }

    // Le Prompt secret pour formater le texte selon les standards de Festara
    const prompt = `Tu es un prestigieux organisateur de mariage au Sénégal. 
Rédige un magnifique texte d'invitation (un faire-part) pour l'événement intitulé "${title || 'notre mariage'}".
Le ton doit être solennel, poétique, romantique, très chaleureux, et respectueux des valeurs traditionnelles sénégalaises.
Le texte doit faire environ 2 à 3 petits paragraphes. 
Ne mets PAS de variables entre crochets, sois direct. Ne mets pas de titre au texte. Écris en français parfait. Ne rajoute aucun commentaire.`;

    // Appel direct a l'API Groq (compatible avec le format OpenAI)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Le modele surpuissant de Meta, ultra rapide
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Erreur Groq API:", err);
      // On retourne l'erreur reelle pour comprendre ce qui bloque
      let parsedErr = err;
      try { parsedErr = JSON.parse(err).error.message; } catch {}
      return NextResponse.json({ error: `Erreur Groq : ${parsedErr}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
