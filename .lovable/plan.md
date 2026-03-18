

## Publishing Directly from Lovable

You can publish your app directly from Lovable and connect your custom domain `hiring.sideways.co.in` to it. Here's the process:

### Step 1: Publish from Lovable
Click the **Publish** button (top right of the editor). This deploys your app to a Lovable staging URL like `sideways-fit-canvas.lovable.app`.

### Step 2: Connect your custom domain
1. Go to **Project Settings → Domains**
2. Click **Connect Domain**
3. Enter `hiring.sideways.co.in`
4. Lovable will give you DNS records to add

### Step 3: Update DNS at your registrar
You'll need to update the DNS for `hiring.sideways.co.in` to point to Lovable instead of Netlify:

- **A Record**: `hiring` → `185.158.133.1`
- **TXT Record**: `_lovable.hiring` → the verification value Lovable provides

Remove or update the existing CNAME/A record that currently points `hiring.sideways.co.in` to Netlify.

### Step 4 (optional): Add www variant
If you also want `www.hiring.sideways.co.in`, add that as a separate domain in Lovable settings with its own A record.

### Important notes
- Your existing `notify.hiring.sideways.co.in` email subdomain will **not** be affected — it's a separate DNS entry
- Your root domain `sideways.co.in` and Google Workspace emails are **not** affected — you're only changing the `hiring` subdomain record
- SSL is automatically provisioned by Lovable
- DNS propagation can take up to 72 hours
- Once connected, every time you click **Update** in the publish dialog, your live site updates

No code changes are needed — this is purely a DNS and platform configuration task.

