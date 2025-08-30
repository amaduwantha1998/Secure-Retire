import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DOCUSIGN_CLIENT_ID = Deno.env.get('DOCUSIGN_CLIENT_ID');
const DOCUSIGN_CLIENT_SECRET = Deno.env.get('DOCUSIGN_CLIENT_SECRET');
const DOCUSIGN_ACCOUNT_ID = Deno.env.get('DOCUSIGN_ACCOUNT_ID');

// Will template generator
function generateWillHTML(testatorData: any, beneficiaries: any[], willData: any) {
  const currentDate = new Date().toLocaleDateString();
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Last Will and Testament</title>
    <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin: 20px 0; }
        .signature-line { border-bottom: 1px solid #000; width: 200px; display: inline-block; margin-left: 10px; }
        .witness-section { margin-top: 40px; }
        .beneficiary { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAST WILL AND TESTAMENT</h1>
        <h2>OF ${willData.testatorName.toUpperCase()}</h2>
    </div>

    <div class="section">
        <p><strong>I, ${willData.testatorName}</strong>, of ${willData.testatorAddress}, being of sound mind and disposing memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.</p>
    </div>

    <div class="section">
        <h3>ARTICLE I - APPOINTMENT OF EXECUTOR</h3>
        <p>I hereby nominate and appoint <strong>${willData.executorName}</strong> as the Executor of this Will. If ${willData.executorName} is unable or unwilling to serve, I nominate [Alternative Executor] as successor Executor.</p>
    </div>

    <div class="section">
        <h3>ARTICLE II - SPECIFIC BEQUESTS</h3>
        ${willData.specificBequests ? `<p>${willData.specificBequests}</p>` : '<p>No specific bequests have been designated.</p>'}
    </div>

    <div class="section">
        <h3>ARTICLE III - DISTRIBUTION OF RESIDUARY ESTATE</h3>
        <p>I give, devise, and bequeath the rest, residue, and remainder of my estate to the following beneficiaries in the proportions specified:</p>
        
        ${beneficiaries.map(b => `
            <div class="beneficiary">
                <strong>${b.full_name}</strong> (${b.relationship}) - ${b.percentage}%
                ${b.is_primary ? ' (Primary Beneficiary)' : ' (Contingent Beneficiary)'}
            </div>
        `).join('')}
        
        ${willData.residuaryClause ? `<p><strong>Additional Instructions:</strong> ${willData.residuaryClause}</p>` : ''}
    </div>

    ${willData.guardianshipClause ? `
    <div class="section">
        <h3>ARTICLE IV - GUARDIANSHIP</h3>
        <p>${willData.guardianshipClause}</p>
    </div>
    ` : ''}

    <div class="section">
        <h3>ARTICLE V - EXECUTION</h3>
        <p>IN WITNESS WHEREOF, I have hereunto set my hand this ${currentDate}.</p>
        <br><br>
        <p>Testator: <span class="signature-line"></span></p>
        <p style="margin-left: 85px;">${willData.testatorName}</p>
    </div>

    <div class="witness-section">
        <h3>WITNESS ATTESTATION</h3>
        <p>We, the undersigned witnesses, certify that the testator signed this Will in our presence, and that we signed as witnesses in the presence of the testator and each other. ${willData.witnessRequirements}</p>
        
        <br><br>
        <table style="width: 100%;">
            <tr>
                <td>Witness 1: <span class="signature-line"></span></td>
                <td>Date: <span class="signature-line"></span></td>
            </tr>
            <tr style="height: 40px;"><td colspan="2"></td></tr>
            <tr>
                <td>Witness 2: <span class="signature-line"></span></td>
                <td>Date: <span class="signature-line"></span></td>
            </tr>
        </table>
    </div>
</body>
</html>`;
}

// Get DocuSign access token
async function getDocuSignAccessToken() {
  const response = await fetch('https://account.docusign.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${DOCUSIGN_CLIENT_ID}:${DOCUSIGN_CLIENT_SECRET}`)}`
    },
    body: 'grant_type=client_credentials&scope=signature'
  });

  if (!response.ok) {
    throw new Error(`DocuSign auth failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Create DocuSign envelope
async function createDocuSignEnvelope(accessToken: string, htmlContent: string, willData: any) {
  const envelopeDefinition = {
    emailSubject: "Please sign your Last Will and Testament",
    documents: [{
      documentId: "1",
      name: "Last Will and Testament",
      htmlDefinition: {
        source: htmlContent
      }
    }],
    recipients: {
      signers: [{
        email: willData.executorEmail,
        name: willData.executorName,
        recipientId: "1",
        tabs: {
          signHereTabs: [{
            documentId: "1",
            pageNumber: "1",
            xPosition: "100",
            yPosition: "400"
          }]
        }
      }]
    },
    status: "sent"
  };

  const response = await fetch(`https://demo.docusign.net/restapi/v2.1/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(envelopeDefinition)
  });

  if (!response.ok) {
    throw new Error(`DocuSign envelope creation failed: ${response.statusText}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { user_id, beneficiaries, will_data, action } = await req.json();

    console.log(`Processing will ${action} for user:`, user_id);

    // Generate HTML content
    const htmlContent = generateWillHTML({ name: will_data.testatorName }, beneficiaries, will_data);

    if (action === 'generate') {
      // Save to documents table
      const { error: docError } = await supabaseClient
        .from('documents')
        .insert({
          user_id,
          type: 'will',
          metadata: {
            jurisdiction: will_data.jurisdiction,
            testator: will_data.testatorName,
            executor: will_data.executorName,
            beneficiaries: beneficiaries.length,
            generated_at: new Date().toISOString()
          },
          file_url: `will-${Date.now()}.html`
        });

      if (docError) {
        console.error('Error saving to documents:', docError);
      }

      // Return HTML for PDF conversion on client side
      return new Response(JSON.stringify({ 
        html_content: htmlContent,
        document_url: `data:text/html;base64,${btoa(htmlContent)}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'docusign') {
      if (!DOCUSIGN_CLIENT_ID || !DOCUSIGN_CLIENT_SECRET || !DOCUSIGN_ACCOUNT_ID) {
        throw new Error('DocuSign credentials not configured');
      }

      // Get access token and create envelope
      const accessToken = await getDocuSignAccessToken();
      const envelope = await createDocuSignEnvelope(accessToken, htmlContent, will_data);

      // Save to documents table with DocuSign reference
      const { error: docError } = await supabaseClient
        .from('documents')
        .insert({
          user_id,
          type: 'will',
          metadata: {
            jurisdiction: will_data.jurisdiction,
            testator: will_data.testatorName,
            executor: will_data.executorName,
            beneficiaries: beneficiaries.length,
            docusign_envelope_id: envelope.envelopeId,
            sent_for_signature: new Date().toISOString()
          },
          file_url: envelope.uri
        });

      if (docError) {
        console.error('Error saving to documents:', docError);
      }

      return new Response(JSON.stringify({
        envelope_id: envelope.envelopeId,
        signing_url: `https://demo.docusign.net/signing/${envelope.envelopeId}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Error in generate-will-document function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});