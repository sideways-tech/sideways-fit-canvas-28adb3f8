import { createClient } from 'npm:@supabase/supabase-js@2'
import { v4 as uuidv4 } from 'npm:uuid@9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const verdictLabels: Record<string, { label: string; color: string; desc: string }> = {
  'strong-no': { label: 'Strong No', color: '#e74c3c', desc: 'Not a fit for Sideways' },
  'lean-no': { label: 'Lean No', color: '#e67e22', desc: 'Below the bar — revisit if they grow' },
  'lean-yes': { label: 'Lean Yes', color: '#27ae60', desc: 'Above the bar — worth a second look' },
  'strong-yes': { label: 'Strong Yes', color: '#2ecc71', desc: 'Trusted Advisor Material' },
}

function scoreBar(score: number, label: string): string {
  const color = score >= 60 ? '#27ae60' : score >= 40 ? '#f39c12' : '#e74c3c'
  return `
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:13px;color:#555;">${label}</span>
        <span style="font-size:13px;font-weight:700;color:${color};">${score}</span>
      </div>
      <div style="background:#eee;border-radius:8px;height:8px;overflow:hidden;">
        <div style="width:${score}%;height:100%;background:${color};border-radius:8px;"></div>
      </div>
    </div>`
}

function dimensionRow(label: string, value: string | number | null): string {
  if (value === null || value === undefined || value === '') return ''
  return `<tr>
    <td style="padding:6px 12px;font-size:13px;color:#555;border-bottom:1px solid #f0f0f0;">${label}</td>
    <td style="padding:6px 12px;font-size:13px;font-weight:600;color:#333;border-bottom:1px solid #f0f0f0;">${value}</td>
  </tr>`
}

function formatCategorical(value: string | null): string {
  if (!value) return '—'
  return value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function buildEmailHtml(data: {
  candidateName: string
  candidateRole: string
  department: string
  hiringLevel: string
  interviewerName: string
  roundNumber: number
  verdict: string
  scores: { person: number; professional: number; mindset: number; overall: number }
  dimensions: Record<string, any>
}): string {
  const v = verdictLabels[data.verdict] || verdictLabels['lean-no']

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">

  <!-- Header -->
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="margin:0;font-size:24px;color:#222;">Sideways Assessment Report</h1>
    <p style="margin:4px 0 0;font-size:14px;color:#888;">Culture & Talent Fit Evaluation</p>
  </div>

  <!-- Candidate Card -->
  <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #e8e4de;">
    <h2 style="margin:0 0 4px;font-size:20px;color:#222;">${data.candidateName}</h2>
    <p style="margin:0;font-size:14px;color:#888;">${data.candidateRole || 'Role not specified'} · ${(data.department || '').replace(/-/g, ' / ').replace(/\b\w/g, c => c.toUpperCase())} · ${data.hiringLevel}</p>
    <p style="margin:8px 0 0;font-size:13px;color:#aaa;">Round ${data.roundNumber} · Interviewer: ${data.interviewerName}</p>
  </div>

  <!-- Verdict -->
  <div style="background:${v.color}15;border:2px solid ${v.color};border-radius:12px;padding:20px;margin-bottom:20px;text-align:center;">
    <h3 style="margin:0;font-size:28px;color:${v.color};font-weight:800;">${v.label}</h3>
    <p style="margin:4px 0 0;font-size:14px;color:#555;">${v.desc}</p>
  </div>

  <!-- Scores -->
  <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #e8e4de;">
    <h3 style="margin:0 0 16px;font-size:16px;color:#222;">Category Scores</h3>
    ${scoreBar(data.scores.person, 'The Person')}
    ${scoreBar(data.scores.professional, 'The Professional')}
    ${scoreBar(data.scores.mindset, 'Mindset & Alignment')}
    <div style="border-top:2px solid #e8e4de;padding-top:12px;margin-top:16px;">
      ${scoreBar(data.scores.overall, 'Overall')}
    </div>
  </div>

  <!-- Dimension Details -->
  <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #e8e4de;">
    <h3 style="margin:0 0 12px;font-size:16px;color:#222;">Assessment Dimensions</h3>
    <table style="width:100%;border-collapse:collapse;">
      ${dimensionRow('Interested in Others', data.dimensions.interested_in_others)}
      ${dimensionRow('Reads Widely', data.dimensions.reads_widely)}
      ${dimensionRow('Depth Score', data.dimensions.depth_score)}
      ${dimensionRow('Depth Topic', data.dimensions.depth_topic)}
      ${dimensionRow('Aesthetics Interest', data.dimensions.aesthetics_interest)}
      ${dimensionRow('Depth of Craft', data.dimensions.depth_of_craft)}
      ${dimensionRow('Articulation Skill', data.dimensions.articulation_skill)}
      ${dimensionRow('Portfolio Quality', data.dimensions.portfolio_quality)}
      ${dimensionRow('Problem Solving', data.dimensions.problem_solving_approach)}
      ${dimensionRow('Professional Breadth', data.dimensions.professional_breadth)}
      ${dimensionRow('Resilience', data.dimensions.resilience_score)}
      ${dimensionRow('Diagnostic Level', formatCategorical(data.dimensions.diagnostic_level))}
      ${dimensionRow('Honesty Level', formatCategorical(data.dimensions.honesty_level))}
      ${dimensionRow('Motivation', formatCategorical(data.dimensions.motivation_level))}
      ${dimensionRow('Sideways Motivation', formatCategorical(data.dimensions.sideways_motivation_level))}
    </table>
  </div>

  ${data.dimensions.background_notes ? `
  <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #e8e4de;">
    <h3 style="margin:0 0 8px;font-size:16px;color:#222;">Background Notes</h3>
    <p style="margin:0;font-size:13px;color:#555;white-space:pre-line;">${data.dimensions.background_notes}</p>
  </div>` : ''}

  ${data.dimensions.professional_dive_notes ? `
  <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #e8e4de;">
    <h3 style="margin:0 0 8px;font-size:16px;color:#222;">Professional Deep Dive</h3>
    <p style="margin:0;font-size:13px;color:#555;white-space:pre-line;">${data.dimensions.professional_dive_notes}</p>
  </div>` : ''}

  <!-- Footer -->
  <div style="text-align:center;padding:24px 0;color:#bbb;font-size:12px;">
    <p style="margin:0;">Sideways · Creative Problem Solving Outfit</p>
    <p style="margin:4px 0 0;">This is an internal assessment report. Please do not forward.</p>
  </div>
</div>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { assessmentData, candidateData, scores, verdict, interviewerEmail } = await req.json()

    if (!interviewerEmail) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no_email' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const messageId = uuidv4()
    const html = buildEmailHtml({
      candidateName: candidateData.name,
      candidateRole: candidateData.role || '',
      department: candidateData.department || '',
      hiringLevel: candidateData.hiring_level || '',
      interviewerName: assessmentData.interviewer_name,
      roundNumber: assessmentData.round_number,
      verdict,
      scores,
      dimensions: {
        interested_in_others: assessmentData.interested_in_others,
        reads_widely: assessmentData.reads_widely,
        depth_score: assessmentData.depth_score,
        depth_topic: assessmentData.depth_topic,
        aesthetics_interest: assessmentData.aesthetics_interest,
        depth_of_craft: assessmentData.depth_of_craft,
        articulation_skill: assessmentData.articulation_skill,
        portfolio_quality: assessmentData.portfolio_quality,
        problem_solving_approach: assessmentData.problem_solving_approach,
        professional_breadth: assessmentData.professional_breadth,
        resilience_score: assessmentData.resilience_score,
        diagnostic_level: assessmentData.diagnostic_level,
        honesty_level: assessmentData.honesty_level,
        motivation_level: assessmentData.motivation_level,
        sideways_motivation_level: assessmentData.sideways_motivation_level,
        background_notes: assessmentData.background_notes,
        professional_dive_notes: assessmentData.professional_dive_notes,
      },
    })

    const payload = {
      run_id: uuidv4(),
      to: interviewerEmail,
      from: `Sideways Assessments <assessments@notify.hiring.sideways.co.in>`,
      sender_domain: 'notify.hiring.sideways.co.in',
      subject: `Assessment Report: ${candidateData.name} — Round ${assessmentData.round_number}`,
      html,
      text: `Assessment report for ${candidateData.name}. Verdict: ${verdict}. Overall score: ${scores.overall}. View the full report in the Sideways Dashboard.`,
      purpose: 'transactional',
      label: 'assessment_report',
      message_id: messageId,
      queued_at: new Date().toISOString(),
    }

    const { error: enqueueError } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload,
    })

    if (enqueueError) throw enqueueError

    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'assessment_report',
      recipient_email: interviewerEmail,
      status: 'pending',
    })

    return new Response(JSON.stringify({ success: true, message_id: messageId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('send-assessment-report error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
