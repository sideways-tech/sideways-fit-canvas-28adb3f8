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

const verdictConfig: Record<string, { label: string; emoji: string; bg: string; border: string; text: string; desc: string }> = {
  'strong-no':  { label: 'Strong No',  emoji: '✕', bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', desc: 'Not a fit for Sideways' },
  'lean-no':    { label: 'Lean No',    emoji: '→', bg: '#fff7ed', border: '#fdba74', text: '#ea580c', desc: 'Below the bar — revisit if they grow' },
  'lean-yes':   { label: 'Lean Yes',   emoji: '✓', bg: '#f0fdf4', border: '#86efac', text: '#16a34a', desc: 'Above the bar — worth a second look' },
  'strong-yes': { label: 'Strong Yes', emoji: '★', bg: '#f0fdf4', border: '#4ade80', text: '#15803d', desc: 'Trusted Advisor Material' },
}

function scoreBar(score: number, label: string): string {
  const s = Number(score) || 0
  const color = s >= 70 ? '#16a34a' : s >= 50 ? '#ea580c' : '#dc2626'
  const bgColor = s >= 70 ? '#dcfce7' : s >= 50 ? '#fff7ed' : '#fef2f2'
  return `
    <tr>
      <td style="padding:10px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="font-size:13px;color:#64748b;font-weight:500;padding-bottom:6px;">${escapeHtml(label)}</td>
            <td style="font-size:14px;font-weight:700;color:${color};text-align:right;padding-bottom:6px;">${s}/100</td>
          </tr>
          <tr>
            <td colspan="2">
              <div style="background:${bgColor};border-radius:100px;height:10px;overflow:hidden;">
                <div style="width:${s}%;height:100%;background:${color};border-radius:100px;"></div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

function dimensionRow(label: string, value: string | number | null, icon: string = '·'): string {
  if (value === null || value === undefined || value === '') return ''
  return `<tr>
    <td style="padding:10px 16px;font-size:13px;color:#94a3b8;border-bottom:1px solid #f1f5f9;width:40%;">${icon} ${escapeHtml(label)}</td>
    <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1e293b;border-bottom:1px solid #f1f5f9;">${escapeHtml(value)}</td>
  </tr>`
}

function formatCategorical(value: string | null): string {
  if (!value) return '—'
  return value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function notesBlock(title: string, notes: string | null, icon: string): string {
  if (!notes) return ''
  return `
  <div style="margin-bottom:16px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#1e293b;">${icon} ${escapeHtml(title)}</p>
          <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;white-space:pre-line;">${escapeHtml(notes)}</p>
        </td>
      </tr>
    </table>
  </div>`
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
  hasCv: boolean
}): string {
  const v = verdictConfig[data.verdict] || verdictConfig['lean-no']
  const overallScore = Number(data.scores.overall) || 0
  const deptDisplay = (data.department || '').replace(/-/g, ' / ').replace(/\b\w/g, c => c.toUpperCase())

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Assessment Report — ${escapeHtml(data.candidateName)}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<!-- Preheader text (hidden) -->
<div style="display:none;max-height:0;overflow:hidden;">
  ${escapeHtml(data.candidateName)} · ${v.label} · Overall ${overallScore}/100
</div>

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;">

        <!-- Logo / Header -->
        <tr>
          <td style="padding:0 0 24px;text-align:center;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#94a3b8;">Sideways</p>
            <p style="margin:2px 0 0;font-size:10px;letter-spacing:1px;color:#cbd5e1;">CULTURE & TALENT FIT ASSESSMENT</p>
          </td>
        </tr>

        <!-- Candidate Hero Card -->
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
              <tr>
                <td style="padding:28px 28px 20px;">
                  <p style="margin:0;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.3px;">${escapeHtml(data.candidateName)}</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#64748b;">${escapeHtml(data.candidateRole || 'Role not specified')}${deptDisplay ? ` · ${escapeHtml(deptDisplay)}` : ''}</p>
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
                    <tr>
                      <td style="background:#f1f5f9;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;color:#64748b;margin-right:8px;">Level: ${escapeHtml(data.hiringLevel || '—')}</td>
                      <td style="width:8px;"></td>
                      <td style="background:#f1f5f9;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;color:#64748b;">Round ${Number(data.roundNumber) || 1}</td>
                      <td style="width:8px;"></td>
                      <td style="background:#f1f5f9;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;color:#64748b;">${escapeHtml(data.interviewerName)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:16px;"></td></tr>

        <!-- Verdict Banner -->
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${v.bg};border-radius:16px;border:2px solid ${v.border};">
              <tr>
                <td style="padding:24px 28px;text-align:center;">
                  <p style="margin:0;font-size:32px;font-weight:900;color:${v.text};letter-spacing:-0.5px;">${v.emoji} ${v.label}</p>
                  <p style="margin:6px 0 0;font-size:14px;color:${v.text};opacity:0.8;">${v.desc}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:16px;"></td></tr>

        <!-- Overall Score Highlight -->
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;">
              <tr>
                <td style="padding:24px 28px;text-align:center;">
                  <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">Overall Score</p>
                  <p style="margin:8px 0 4px;font-size:48px;font-weight:900;color:${overallScore >= 70 ? '#16a34a' : overallScore >= 50 ? '#ea580c' : '#dc2626'};letter-spacing:-2px;line-height:1;">${overallScore}</p>
                  <p style="margin:0;font-size:12px;color:#94a3b8;">out of 100</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:16px;"></td></tr>

        <!-- Category Scores -->
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#1e293b;">📊 Category Breakdown</p>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    ${scoreBar(data.scores.person, 'The Person')}
                    ${scoreBar(data.scores.professional, 'The Professional')}
                    ${scoreBar(data.scores.mindset, 'Mindset & Alignment')}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:16px;"></td></tr>

        <!-- Dimension Details -->
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;">
              <tr>
                <td style="padding:24px 28px 8px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1e293b;">📋 Assessment Dimensions</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 12px 16px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    ${dimensionRow('Interested in Others', data.dimensions.interested_in_others, '🤝')}
                    ${dimensionRow('Reads Widely', data.dimensions.reads_widely, '📚')}
                    ${dimensionRow('Depth Score', data.dimensions.depth_score, '🔬')}
                    ${dimensionRow('Depth Topic', data.dimensions.depth_topic, '💡')}
                    ${dimensionRow('Aesthetics Interest', data.dimensions.aesthetics_interest, '🎨')}
                    ${dimensionRow('Depth of Craft', data.dimensions.depth_of_craft, '⚒️')}
                    ${dimensionRow('Articulation Skill', data.dimensions.articulation_skill, '🗣️')}
                    ${dimensionRow('Portfolio Quality', data.dimensions.portfolio_quality, '📁')}
                    ${dimensionRow('Problem Solving', data.dimensions.problem_solving_approach, '🧩')}
                    ${dimensionRow('Professional Breadth', data.dimensions.professional_breadth, '🌐')}
                    ${dimensionRow('Resilience', data.dimensions.resilience_score, '💪')}
                    ${dimensionRow('Diagnostic Level', formatCategorical(data.dimensions.diagnostic_level), '🩺')}
                    ${dimensionRow('Honesty Level', formatCategorical(data.dimensions.honesty_level), '⚖️')}
                    ${dimensionRow('Motivation', formatCategorical(data.dimensions.motivation_level), '🔥')}
                    ${dimensionRow('Sideways Motivation', formatCategorical(data.dimensions.sideways_motivation_level), '🎯')}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:16px;"></td></tr>

        <!-- Notes Sections -->
        <tr>
          <td>
            ${notesBlock('Background Notes', data.dimensions.background_notes, '📝')}
            ${notesBlock('Professional Deep Dive', data.dimensions.professional_dive_notes, '🔍')}
            ${notesBlock('Interests & Passions', data.dimensions.interests_passions_notes, '✨')}
            ${notesBlock('Sideways Website Feedback', data.dimensions.sideways_website_feedback, '🌐')}
            ${notesBlock('Motivation Reason', data.dimensions.motivation_reason, '🔥')}
            ${notesBlock('Sideways Motivation Reason', data.dimensions.sideways_motivation_reason, '🎯')}
            ${notesBlock('Recent Read Example', data.dimensions.recent_read_example, '📖')}
            ${notesBlock('Aesthetics Process Note', data.dimensions.aesthetics_process_note, '🎨')}
          </td>
        </tr>

        ${data.hasCv ? `
        <!-- CV Attachment Notice -->
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe;">
              <tr>
                <td style="padding:16px 24px;text-align:center;">
                  <p style="margin:0;font-size:13px;color:#1d4ed8;font-weight:600;">📎 Candidate's CV/Resume is attached to this email</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="height:16px;"></td></tr>
        ` : ''}

        <!-- Footer -->
        <tr>
          <td style="padding:24px 0;text-align:center;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#cbd5e1;">Sideways</p>
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
          
          // Determine filename and content type
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
        interests_passions_notes: assessmentData.interests_passions_notes,
        sideways_website_feedback: assessmentData.sideways_website_feedback,
        motivation_reason: assessmentData.motivation_reason,
        sideways_motivation_reason: assessmentData.sideways_motivation_reason,
        recent_read_example: assessmentData.recent_read_example,
        aesthetics_process_note: assessmentData.aesthetics_process_note,
      },
      hasCv: attachments.length > 0,
    })

    const payload: Record<string, any> = {
      idempotency_key: messageId,
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
