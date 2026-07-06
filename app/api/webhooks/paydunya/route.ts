import { NextResponse } from 'next/server';

export async function POST() {
  // Cette route a été supprimée pour des raisons de sécurité.
  // Utilisez l'IPN de confirmation : /api/pay/paydunya/callback
  return NextResponse.json({ error: "Deprecated endpoint. Use /api/pay/paydunya/callback instead." }, { status: 410 });
}
