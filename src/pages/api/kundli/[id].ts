import type { APIRoute } from 'astro';
import { getUserIdFromRequest } from '../../../lib/auth-server';
import { claimKundliChart, deleteKundliChart } from '../../../lib/db/kundli-charts';

export const PATCH: APIRoute = async ({ request, params }) => {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Sign in to save this chart' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const id = params?.id;
  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Chart ID required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: { claim?: boolean };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (body.claim === true) {
    const ok = await claimKundliChart(id, userId);
    if (!ok) {
      return new Response(
        JSON.stringify({ error: 'Chart already saved or not found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    return new Response(
      JSON.stringify({ ok: true, message: 'Chart saved to your account' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({ error: 'Unknown action' }),
    { status: 400, headers: { 'Content-Type': 'application/json' } },
  );
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Sign in required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const id = params?.id;
  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Chart ID required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const ok = await deleteKundliChart(id, userId);
  if (!ok) {
    return new Response(
      JSON.stringify({ error: 'Chart not found or not yours' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
