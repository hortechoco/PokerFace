import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const path = body.path;

    if (path === "state") {
      if (!body.game) {
        return Response.json({ error: "GAME_REQUIRED" }, { status: 400 });
      }

      const { data: game, error } = await supabase
        .from("games")
        .select(`
          id,
          status,
          current_turn,
          pot,
          community_cards,
          table_players (
            seat_number,
            chips,
            players (
              username,
              telegram_id
            )
          )
        `)
        .eq("id", body.game)
        .single();

      if (error) throw error;

      return Response.json(game);
    }

    if (path === "action") {
      return Response.json({
        ok: true,
        message: "ACTION_ENDPOINT_READY",
        action: body.action
      });
    }

    return Response.json({ error: "UNKNOWN_PATH" }, { status: 404 });
  } catch (e) {
    return Response.json(
      { error: e.message ?? "SERVER_ERROR" },
      { status: 500 }
    );
  }
});
