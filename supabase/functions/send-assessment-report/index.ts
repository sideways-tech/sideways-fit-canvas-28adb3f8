import { createClient } from 'npm:@supabase/supabase-js@2'
import { v4 as uuidv4 } from 'npm:uuid@9'
import { encode as base64Encode } from 'https://deno.land/std@0.208.0/encoding/base64.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function escapeHtml(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// --- Color helpers matching dashboard logic ---
function scoreColor(s: number): string {
  return s >= 60 ? '#16a34a' : s >= 40 ? '#d97706' : '#dc2626'
}
function scoreBg(s: number): string {
  return s >= 60 ? '#dcfce7' : s >= 40 ? '#fef3c7' : '#fef2f2'
}
function getSliderLabel(value: number): string {
  if (value <= 20) return 'Low'
  if (value <= 40) return 'Fair'
  if (value <= 60) return 'Good'
  if (value <= 80) return 'Strong'
  return 'Excellent'
}
function formatCategorical(value: string | null): string {
  if (!value) return ''
  return value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
function diagnosticInfo(v: string | null): { label: string; desc: string; color: string } {
  if (!v) return { label: 'Not assessed', desc: '', color: '#94a3b8' }
  if (v === 'diagnostician') return { label: 'Diagnostician', desc: 'Challenged the premise / Asked "Why"', color: '#16a34a' }
  if (v === 'clarifier') return { label: 'Clarifier', desc: 'Asked superficial process questions', color: '#d97706' }
  return { label: 'Order Taker', desc: 'Asked about timeline/budget only', color: '#dc2626' }
}
function honestyInfo(v: string | null): { label: string; desc: string; color: string } {
  if (!v) return { label: 'Not assessed', desc: '', color: '#94a3b8' }
  if (v === 'honest') return { label: 'Constructive Critique', desc: 'The Birbal Standard — Truth to power', color: '#16a34a' }
  if (v === 'diplomatic') return { label: 'Diplomatic', desc: 'Balanced but guarded feedback', color: '#d97706' }
  return { label: 'Flattery', desc: 'Only positive things, avoided critique', color: '#dc2626' }
}
function motivationInfo(v: string | null): { label: string; desc: string; color: string } {
  if (!v) return { label: 'Not assessed', desc: '', color: '#94a3b8' }
  if (v === 'passionate') return { label: 'Deep Connection', desc: 'Clear passion for problem-solving, creativity, or impact', color: '#16a34a' }
  if (v === 'practical') return { label: 'Practical Reasons', desc: 'Career growth, industry reputation, learning opportunity', color: '#d97706' }
  return { label: 'Unclear / Generic', desc: "Couldn't articulate why", color: '#dc2626' }
}
function sidewaysMotivationInfo(v: string | null): { label: string; desc: string; color: string } {
  if (!v) return { label: 'Not assessed', desc: '', color: '#94a3b8' }
  if (v === 'sideways-specific') return { label: 'Specific to Sideways', desc: 'Knows our work, references projects, articulates unique draw', color: '#16a34a' }
  if (v === 'culture-fit') return { label: 'Culture Fit', desc: 'Resonates with values, work style, or team vibe', color: '#d97706' }
  return { label: 'Generic — Could Be Any Agency', desc: 'No specific reason', color: '#dc2626' }
}
const resilienceDescs: Record<number, string> = {
  1: 'Took it personally, couldn\'t let go',
  2: 'Struggled but eventually moved on',
  3: 'Accepted feedback professionally',
  4: 'Iterated well, learned from it',
  5: 'Circus Ready! Kills darlings gracefully',
}

function mcqRow(label: string, info: { label: string; desc: string; color: string }): string {
  if (info.label === 'Not assessed') return ''
  return `
  <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td style="font-size:13px;color:#64748b;width:40%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="text-align:right;vertical-align:top;">
        <p style="margin:0;font-size:13px;font-weight:700;color:${info.color};">${escapeHtml(info.label)}</p>
        ${info.desc ? `<p style="margin:2px 0 0;font-size:11px;color:#94a3b8;">${escapeHtml(info.desc)}</p>` : ''}
      </td>
    </tr></table>
  </td></tr>`
}

function starRow(label: string, value: number | null): string {
  if (!value || value === 0) return ''
  const filled = '★'.repeat(value)
  const empty = '☆'.repeat(5 - value)
  const color = value >= 4 ? '#16a34a' : value >= 3 ? '#d97706' : '#dc2626'
  const desc = resilienceDescs[value] || ''
  return `
  <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td style="font-size:13px;color:#64748b;width:40%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="text-align:right;vertical-align:top;">
        <p style="margin:0;font-size:16px;color:${color};letter-spacing:2px;">${filled}${empty} <span style="font-size:13px;font-weight:700;">${value}/5</span></p>
        ${desc ? `<p style="margin:2px 0 0;font-size:11px;color:#94a3b8;">${escapeHtml(desc)}</p>` : ''}
      </td>
    </tr></table>
  </td></tr>`
}

const verdictConfig: Record<string, { label: string; emoji: string; bg: string; border: string; text: string; desc: string }> = {
  'strong-no':  { label: 'Strong No',  emoji: '✕', bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', desc: 'Significant gaps across key dimensions. The candidate is unlikely to thrive in a diagnostic, T-shaped culture.' },
  'lean-no':    { label: 'Lean No',    emoji: '↓', bg: '#fff7ed', border: '#fdba74', text: '#ea580c', desc: 'Some promising signals but one or more categories fall short. Consider reconnecting in 6–12 months.' },
  'lean-yes':   { label: 'Lean Yes',   emoji: '✓', bg: '#f0fdf4', border: '#86efac', text: '#16a34a', desc: 'Clears the minimum thresholds across all categories. A follow-up conversation or work trial is recommended.' },
  'strong-yes': { label: 'Strong Yes', emoji: '★', bg: '#f0fdf4', border: '#4ade80', text: '#15803d', desc: 'Diagnostic mindset, T-shaped curiosity, and genuine alignment with Sideways culture. Ready for the Circus!' },
}

// --- Email HTML building blocks ---

function card(content: string, mb = '16px'): string {
  return `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:${mb};"><tr><td style="padding:24px 28px;">${content}</td></tr></table>`
}

function sectionTitle(icon: string, title: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0f172a;">${icon} ${escapeHtml(title)}</p>`
}

function categoryScoreBlock(label: string, score: number): string {
  const s = Number(score) || 0
  const color = scoreColor(s)
  const bg = scoreBg(s)
  return `
  <td style="width:25%;padding:0 4px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
      <tr><td style="padding:14px 12px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#64748b;font-weight:500;">${escapeHtml(label)}</p>
        <p style="margin:6px 0;font-size:28px;font-weight:800;color:${color};line-height:1;">${s}</p>
        <div style="background:${bg};border-radius:100px;height:6px;overflow:hidden;margin-top:8px;">
          <div style="width:${s}%;height:100%;background:${color};border-radius:100px;"></div>
        </div>
      </td></tr>
    </table>
  </td>`
}

function sliderRow(icon: string, label: string, value: number | null): string {
  if (value === null || value === undefined) return ''
  const v = Number(value) || 0
  const color = scoreColor(v)
  const bg = scoreBg(v)
  const desc = getSliderLabel(v)
  return `
  <tr>
    <td style="padding:8px 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-size:13px;color:#475569;width:40%;">${icon} ${escapeHtml(label)}</td>
          <td style="width:35%;padding:0 12px;">
            <div style="background:${bg};border-radius:100px;height:8px;overflow:hidden;">
              <div style="width:${v}%;height:100%;background:${color};border-radius:100px;"></div>
            </div>
          </td>
          <td style="font-size:12px;font-weight:600;color:${color};text-align:right;width:25%;white-space:nowrap;">${desc} (${v})</td>
        </tr>
      </table>
    </td>
  </tr>`
}

function detailRow(label: string, value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '' || value === '—') return ''
  return `
  <tr>
    <td style="padding:8px 0;font-size:13px;color:#94a3b8;border-bottom:1px solid #f1f5f9;width:40%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 0 8px 12px;font-size:13px;font-weight:600;color:#1e293b;border-bottom:1px solid #f1f5f9;vertical-align:top;">${escapeHtml(value)}</td>
  </tr>`
}

function noteBlock(title: string, text: string | null, icon: string): string {
  if (!text) return ''
  return `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:12px;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1e293b;">${icon} ${escapeHtml(title)}</p>
      <p style="margin:0;font-size:13px;color:#475569;line-height:1.7;white-space:pre-line;">${escapeHtml(text)}</p>
    </td></tr>
  </table>`
}

function buildEmailHtml(data: {
  candidateName: string
  candidateRole: string
  candidateEmail: string
  candidateEducation: string
  candidateWebsite: string
  department: string
  hiringLevel: string
  interviewerName: string
  interviewerEmail: string
  roundNumber: number
  createdAt: string
  verdict: string
  scores: { person: number; professional: number; mindset: number; overall: number }
  dimensions: Record<string, any>
  hasCv: boolean
}): string {
  const v = verdictConfig[data.verdict] || verdictConfig['lean-no']
  const deptDisplay = (data.department || '').replace(/-/g, ' / ').replace(/\b\w/g, c => c.toUpperCase())
  const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
  const d = data.dimensions

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Assessment Report — ${escapeHtml(data.candidateName)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<div style="display:none;max-height:0;overflow:hidden;">
  ${escapeHtml(data.candidateName)} · ${v.label} · Overall ${data.scores.overall}/100
</div>

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f1f5f9;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;">

        <!-- Header -->
        <tr>
          <td style="padding:0 0 24px;text-align:center;">
            <p style="margin:0;font-size:13px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#0f172a;">SIDEWAYS</p>
            <p style="margin:4px 0 0;font-size:11px;letter-spacing:1.5px;color:#94a3b8;text-transform:uppercase;">Assessment Report</p>
          </td>
        </tr>

        <!-- Candidate Info Card -->
        <tr><td>
          ${card(`
            <p style="margin:0;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.3px;">${escapeHtml(data.candidateName)}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#64748b;">${escapeHtml(data.candidateRole || 'Role not specified')}${deptDisplay ? ` · ${deptDisplay}` : ''}${data.hiringLevel ? ` · ${escapeHtml(data.hiringLevel)}` : ''}</p>
            ${data.candidateEmail ? `<p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">${escapeHtml(data.candidateEmail)}</p>` : ''}
            ${data.candidateEducation ? `<p style="margin:2px 0 0;font-size:13px;color:#94a3b8;">Education: ${escapeHtml(data.candidateEducation)}</p>` : ''}
            ${data.candidateWebsite ? `<p style="margin:2px 0 0;font-size:13px;color:#94a3b8;">Website: ${escapeHtml(data.candidateWebsite)}</p>` : ''}
            <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">Round ${Number(data.roundNumber) || 1} · Interviewer: ${escapeHtml(data.interviewerName)}${data.interviewerEmail ? ` (${escapeHtml(data.interviewerEmail)})` : ''} · ${dateStr}</p>
          `)}
        </td></tr>

        <!-- Verdict Banner -->
        <tr><td>
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${v.bg};border-radius:12px;border:2px solid ${v.border};margin-bottom:16px;">
            <tr><td style="padding:28px;text-align:center;">
              <p style="margin:0;font-size:36px;font-weight:900;color:${v.text};letter-spacing:-0.5px;">${v.emoji} ${v.label}</p>
              <p style="margin:8px 0 0;font-size:13px;color:${v.text};line-height:1.5;">${v.desc}</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Category Scores Grid (4 columns) -->
        <tr><td>
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;">
            <tr>
              ${categoryScoreBlock('The Person', data.scores.person)}
              ${categoryScoreBlock('The Professional', data.scores.professional)}
              ${categoryScoreBlock('Mindset', data.scores.mindset)}
              ${categoryScoreBlock('Overall', data.scores.overall)}
            </tr>
          </table>
        </td></tr>

        <!-- ACT 1: The Person -->
        <tr><td>
          ${card(`
            ${sectionTitle('👤', 'Act 1 · The Person')}
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              ${sliderRow('🤝', 'Interested in Others', d.interested_in_others)}
              ${sliderRow('📚', 'Reading Breadth', d.reads_widely)}
              ${sliderRow('🔬', 'T-Shape Depth', d.depth_score)}
              ${sliderRow('🎨', 'Aesthetics Interest', d.aesthetics_interest)}
            </table>
            ${d.depth_topic ? `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px;">${detailRow('Depth Topic', d.depth_topic)}</table>` : ''}
            ${d.recent_read_example ? `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:4px;">${detailRow('Recent Read / Example', d.recent_read_example)}</table>` : ''}
          `)}
        </td></tr>

        <!-- Interests & Passions Note -->
        ${d.interests_passions_notes ? `<tr><td>${noteBlock('Interests & Passions', d.interests_passions_notes, '✨')}</td></tr>` : ''}

        <!-- Background Notes -->
        ${d.background_notes ? `<tr><td>${noteBlock('Background Notes', d.background_notes, '📝')}</td></tr>` : ''}

        <!-- ACT 2: The Professional -->
        <tr><td>
          ${card(`
            ${sectionTitle('💼', 'Act 2 · The Professional')}
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              ${sliderRow('⚒️', 'Depth of Craft', d.depth_of_craft)}
              ${sliderRow('🗣️', 'Articulation Skill', d.articulation_skill)}
              ${sliderRow('📁', 'Portfolio Quality', d.portfolio_quality)}
              ${sliderRow('🌐', 'Professional Breadth', d.professional_breadth)}
            </table>
            ${starRow('Willingness to Iterate (Resilience)', d.resilience_score)}
          `)}
        </td></tr>

        <!-- Professional Deep Dive Note -->
        ${d.professional_dive_notes ? `<tr><td>${noteBlock('Professional Deep Dive', d.professional_dive_notes, '🔍')}</td></tr>` : ''}

        <!-- Aesthetics Process Note -->
        ${d.aesthetics_process_note ? `<tr><td>${noteBlock('Aesthetics Process Note', d.aesthetics_process_note, '🎨')}</td></tr>` : ''}

        <!-- ACT 3: Mindset & Alignment -->
        <tr><td>
          ${card(`
            ${sectionTitle('🧠', 'Act 3 · Mindset & Alignment')}
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              ${mcqRow('Diagnostic Mindset', diagnosticInfo(d.diagnostic_level))}
              ${mcqRow('Honesty Level', honestyInfo(d.honesty_level))}
              ${mcqRow('Industry Motivation', motivationInfo(d.motivation_level))}
              ${mcqRow('Sideways Motivation', sidewaysMotivationInfo(d.sideways_motivation_level))}
            </table>
          `)}
        </td></tr>

        <!-- Motivation Notes -->
        ${d.motivation_reason ? `<tr><td>${noteBlock('Motivation Reason', d.motivation_reason, '🔥')}</td></tr>` : ''}
        ${d.sideways_motivation_reason ? `<tr><td>${noteBlock('Sideways Motivation Reason', d.sideways_motivation_reason, '🎯')}</td></tr>` : ''}

        ${data.hasCv ? `
        <!-- CV Notice -->
        <tr><td>
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#eff6ff;border-radius:10px;border:1px solid #bfdbfe;margin-bottom:16px;">
            <tr><td style="padding:14px 24px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#1d4ed8;font-weight:600;">📎 Candidate's CV / Resume is attached to this email</p>
            </td></tr>
          </table>
        </td></tr>` : ''}

        <!-- Footer -->
        <tr>
          <td style="padding:24px 0;text-align:center;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#cbd5e1;">Sideways</p>
            <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">Creative Problem Solving Outfit</p>
            <p style="margin:8px 0 0;font-size:10px;color:#e2e8f0;">This is an internal assessment report. Please do not forward.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`
}

// --- Main handler ---

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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

    // Download CV if available
    let attachments: Array<{ filename: string; content: string; content_type: string }> = []
    const cvPath = assessmentData.cv_file_path
    if (cvPath) {
      try {
        const { data: fileData, error: fileError } = await supabase.storage
          .from('cvs')
          .download(cvPath)

        if (!fileError && fileData) {
          const arrayBuffer = await fileData.arrayBuffer()
          const base64Content = base64Encode(new Uint8Array(arrayBuffer))
          const fileName = cvPath.split('/').pop() || 'resume'
          const ext = fileName.split('.').pop()?.toLowerCase() || ''
          const contentTypeMap: Record<string, string> = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          }
          const contentType = contentTypeMap[ext] || 'application/octet-stream'

          attachments.push({
            filename: `${candidateData.name.replace(/[^a-zA-Z0-9 ]/g, '').trim()}_CV.${ext}`,
            content: base64Content,
            content_type: contentType,
          })
        } else {
          console.warn('Could not download CV:', fileError?.message)
        }
      } catch (cvErr) {
        console.warn('CV download error:', cvErr instanceof Error ? cvErr.message : String(cvErr))
      }
    }

    const messageId = uuidv4()
    const html = buildEmailHtml({
      candidateName: candidateData.name,
      candidateRole: candidateData.role || '',
      candidateEmail: candidateData.email || '',
      candidateEducation: candidateData.education || '',
      candidateWebsite: candidateData.website || '',
      department: candidateData.department || '',
      hiringLevel: candidateData.hiring_level || '',
      interviewerName: assessmentData.interviewer_name,
      interviewerEmail: assessmentData.interviewer_email || interviewerEmail,
      roundNumber: assessmentData.round_number,
      createdAt: new Date().toISOString(),
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
        interests_passions_notes: assessmentData.interests_passions_notes,
        sideways_website_feedback: assessmentData.sideways_website_feedback,
        motivation_reason: assessmentData.motivation_reason,
        sideways_motivation_reason: assessmentData.sideways_motivation_reason,
        recent_read_example: assessmentData.recent_read_example,
        aesthetics_process_note: assessmentData.aesthetics_process_note,
      },
      hasCv: attachments.length > 0,
    })

    // Unsubscribe token
    const unsubToken = uuidv4()
    const { error: upsertError } = await supabase.from('email_unsubscribe_tokens').upsert(
      { email: interviewerEmail, token: unsubToken },
      { onConflict: 'email' }
    )
    if (upsertError) {
      await supabase.from('email_unsubscribe_tokens').insert({
        email: interviewerEmail,
        token: unsubToken,
      })
    }

    const payload: Record<string, any> = {
      idempotency_key: messageId,
      to: interviewerEmail,
      from: `Sideways Assessments <assessments@notify.hiring.sideways.co.in>`,
      sender_domain: 'notify.hiring.sideways.co.in',
      subject: `Assessment Report: ${candidateData.name} — Round ${assessmentData.round_number}`,
      html,
      text: `Assessment report for ${candidateData.name}. Verdict: ${verdict}. Overall score: ${scores.overall}/100. Person: ${scores.person}, Professional: ${scores.professional}, Mindset: ${scores.mindset}.`,
      purpose: 'transactional',
      label: 'assessment_report',
      message_id: messageId,
      queued_at: new Date().toISOString(),
      unsubscribe_token: unsubToken,
    }

    if (attachments.length > 0) {
      payload.attachments = attachments
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
