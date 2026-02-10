import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client scoped to the caller's JWT – for role verification
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } =
      await callerClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub as string;

    // Use service role to check the caller's role (bypasses RLS)
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .single();

    if (!callerRole || callerRole.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden – admin role required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Parse & validate input
    const body = await req.json();
    const { email, password, full_name, role, phone } = body as {
      email?: string;
      password?: string;
      full_name?: string;
      role?: string;
      phone?: string;
    };

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const validRoles = [
      "admin",
      "client",
      "sales_agent",
      "sales_manager",
      "marketer",
      "broker",
    ];
    const assignRole = validRoles.includes(role || "") ? role! : "client";

    // Generate a secure random password if none provided
    const userPassword =
      password && password.length >= 8
        ? password
        : crypto.randomUUID().slice(0, 16) + "A1!";

    // 3. Create auth user via Admin API (service role)
    const { data: newUser, error: createErr } =
      await adminClient.auth.admin.createUser({
        email,
        password: userPassword,
        email_confirm: true, // auto-confirm so user can log in immediately
        user_metadata: { full_name: full_name || email.split("@")[0] },
      });

    if (createErr) {
      return new Response(
        JSON.stringify({ error: createErr.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = newUser.user.id;

    // 4. Upsert profile
    await adminClient.from("profiles").upsert(
      {
        user_id: userId,
        email,
        full_name: full_name || email.split("@")[0],
        phone: phone || null,
      },
      { onConflict: "user_id" }
    );

    // 5. Insert user role
    await adminClient.from("user_roles").upsert(
      { user_id: userId, role: assignRole },
      { onConflict: "user_id" }
    );

    return new Response(
      JSON.stringify({
        user_id: userId,
        email,
        role: assignRole,
        temporary_password: password ? undefined : userPassword,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("admin-create-user error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
