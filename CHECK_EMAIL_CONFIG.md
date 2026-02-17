# Quick Check: Email Configuration

## Common Issues After Adding RESEND_API_KEY

### 1. Server Not Restarted
**Most Common Issue!** Next.js only reads `.env.local` when the server starts.

**Fix:**
1. Stop your dev server (Ctrl+C or Cmd+C)
2. Start it again: `npm run dev`
3. Try submitting the form again

### 2. Variable Name Typo
Make sure it's exactly: `RESEND_API_KEY` (all caps, no spaces)

**Check your .env.local:**
```bash
RESEND_API_KEY=re_your_key_here
```

### 3. Key Format
Resend API keys start with `re_` and are long strings. Make sure you copied the entire key.

### 4. File Location
Make sure `.env.local` is in the **root** of your project (same folder as `package.json`)

### 5. Test the Configuration

Add this temporary test to verify the key is being read:

Create a test file: `test-email-config.js` in the root:

```javascript
require('dotenv').config({ path: '.env.local' });
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
console.log('RESEND_API_KEY starts with re_:', process.env.RESEND_API_KEY?.startsWith('re_'));
```

Run: `node test-email-config.js`

If it shows `false`, the key isn't being read.

