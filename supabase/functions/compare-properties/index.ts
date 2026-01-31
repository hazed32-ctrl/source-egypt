import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids");

    if (!idsParam) {
      return new Response(
        JSON.stringify({ error: "Missing 'ids' parameter", code: "MISSING_IDS" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ids = idsParam.split(",").filter(Boolean);

    if (ids.length !== 2) {
      return new Response(
        JSON.stringify({ 
          error: "Exactly 2 property IDs are required", 
          code: "INVALID_COUNT",
          provided: ids.length 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidIds = ids.filter(id => !uuidRegex.test(id));
    if (invalidIds.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid property ID format", 
          code: "INVALID_FORMAT",
          invalidIds 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch properties
    const { data: properties, error } = await supabase
      .from("properties")
      .select("id, title, location, price, beds, baths, area, image_url, status, progress_percent, description")
      .in("id", ids);

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch properties", code: "DB_ERROR" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if all properties were found
    const foundIds = properties?.map(p => p.id) || [];
    const missingIds = ids.filter(id => !foundIds.includes(id));

    if (missingIds.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: "One or more properties not found", 
          code: "NOT_FOUND",
          missingIds 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return properties in the order they were requested
    const orderedProperties = ids.map(id => properties!.find(p => p.id === id)!);

    return new Response(
      JSON.stringify({ 
        success: true, 
        properties: orderedProperties 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
