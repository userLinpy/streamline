import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook Resend — réception des événements email (delivered, bounced, etc.)
 * Route Handler : webhooks UNIQUEMENT — pas de logique métier ici.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret non configuré" },
      { status: 500 }
    );
  }

  // TODO Phase 2 : vérifier la signature du webhook
  // TODO Phase 2 : traiter les événements (delivered, bounced, complained)

  const body = await request.json();
  console.log("[webhook:resend]", body.type);

  return NextResponse.json({ received: true });
}
