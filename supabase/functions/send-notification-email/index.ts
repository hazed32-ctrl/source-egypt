import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailPayload {
  type: "lead_created" | "property_progress_updated";
  record: Record<string, unknown>;
  old_record?: Record<string, unknown>;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.error("RESEND_API_KEY not configured");
    return new Response(JSON.stringify({ error: "Email service not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const resend = new Resend(resendKey);
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload: EmailPayload = await req.json();
    const { type, record, old_record } = payload;

    if (type === "lead_created") {
      // Send email to admin inbox
      const { error } = await resend.emails.send({
        from: "Source Egypt <no-reply@source-eg.com>",
        to: ["contact@source-eg.com"],
        subject: `New Lead: ${record.name}`,
        html: `
          <h2>New Lead Submitted</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #ddd;">${record.name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${record.email}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Phone</td><td style="padding:8px;border:1px solid #ddd;">${record.phone || "N/A"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Source</td><td style="padding:8px;border:1px solid #ddd;">${record.source || "website"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">City</td><td style="padding:8px;border:1px solid #ddd;">${record.city || "N/A"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Budget</td><td style="padding:8px;border:1px solid #ddd;">${record.budget_min || "?"} - ${record.budget_max || "?"}</td></tr>
          </table>
          <p style="margin-top:16px;color:#666;">Submitted at ${record.created_at}</p>
        `,
      });

      if (error) {
        console.error("Resend error (lead):", error);
        throw new Error(error.message);
      }

      console.log("Lead notification email sent for:", record.name);
    }

    if (type === "property_progress_updated") {
      // Get the client's email from profiles
      const userId = record.assigned_user_id as string;
      if (!userId) {
        console.log("No assigned user for property, skipping email");
        return new Response(JSON.stringify({ skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profile?.email) {
        console.log("No email found for user:", userId);
        return new Response(JSON.stringify({ skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const oldStatus = old_record?.progress_status || "unknown";
      const newStatus = record.progress_status || "unknown";

      const { error } = await resend.emails.send({
        from: "Source Egypt <no-reply@source-eg.com>",
        to: [profile.email],
        subject: `Property Update: ${record.title}`,
        html: `
          <h2>Your Property Status Has Been Updated</h2>
          <p>Dear ${profile.full_name || "Valued Client"},</p>
          <p>Your property <strong>"${record.title}"</strong> has been updated:</p>
          <table style="border-collapse:collapse;width:100%;max-width:400px;">
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Previous Status</td><td style="padding:8px;border:1px solid #ddd;">${oldStatus}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">New Status</td><td style="padding:8px;border:1px solid #ddd;">${newStatus}</td></tr>
          </table>
          <p style="margin-top:16px;">Log in to your portal for full details.</p>
          <p style="color:#666;">— Source Egypt Team</p>
        `,
      });

      if (error) {
        console.error("Resend error (progress):", error);
        throw new Error(error.message);
      }

      console.log("Progress notification email sent to:", profile.email);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("send-notification-email error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
