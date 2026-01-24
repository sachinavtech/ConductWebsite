# How to Verify GTM Tags are Published and Live

## Understanding GTM Publishing

In Google Tag Manager, there's a difference between:
- **Saving** a tag (draft, not live)
- **Publishing** a tag (live on your website)

## How to Know if Tags are Published

### Method 1: Check Version History

1. In GTM, look at the top right corner
2. You'll see a version number like "v.123" or "Version 123"
3. Click on the version number
4. You'll see a list of published versions
5. The most recent version shows when it was published
6. If you see your recent changes in the latest version, they're published

### Method 2: Check if Submit Button is Gone

**After Publishing:**
1. Click **Submit** button
2. Fill in version name and description
3. Click **Publish**
4. The **Submit** button should disappear (or change to show the version number)
5. If you still see "Submit", it means:
   - You have NEW unsaved changes, OR
   - You're in a different workspace

### Method 3: Check Workspace Status

1. Look at the top right of GTM
2. You'll see something like "Default Workspace" or "Workspace 1"
3. Next to it, you might see:
   - **"Submit"** = You have unpublished changes in this workspace
   - **Version number** (e.g., "v.123") = No unpublished changes, everything is published

### Method 4: Check Tags List

1. Go to **Tags** section in GTM
2. Look at your tags
3. Published tags don't have any special indicator
4. But if you see a tag with a **draft icon** or **"Draft"** label, it's not published

## Why You Still See "Submit" Button

If you clicked Submit and Publish but still see "Submit", here's why:

### Reason 1: You Made New Changes After Publishing

1. You published your tags
2. Then you edited a tag or created a new one
3. GTM shows "Submit" because you have NEW unpublished changes
4. **Solution:** Click Submit > Publish again

### Reason 2: You're in a Different Workspace

1. GTM has multiple workspaces
2. You might have published in one workspace but are looking at another
3. **Solution:** Check which workspace you're in (top right)

### Reason 3: Publishing Didn't Complete

1. Sometimes the publish process doesn't complete
2. **Solution:** Try publishing again

## Step-by-Step: How to Publish Correctly

### Step 1: Make Your Changes

1. Create or edit your GA4 Configuration tag
2. Make sure it's saved (click **Save** button on the tag)

### Step 2: Submit for Publishing

1. In GTM top right, click **Submit** button
2. You'll see a "Create Version" screen

### Step 3: Fill in Version Details

1. **Version Name**: Enter something descriptive
   - Example: "GA4 Configuration setup"
   - Example: "Initial analytics setup"
2. **Version Description** (optional): Add more details
   - Example: "Added GA4 Configuration tag with Measurement ID G-XXXXXXXXXX"
3. Click **Publish** button (not just "Create Version")

### Step 4: Verify Publishing

After clicking **Publish**, you should see:
- A success message: "Version X published successfully"
- The **Submit** button disappears (or shows version number)
- You're taken back to the main GTM screen

### Step 5: Confirm Tags are Live

**Test on Your Website:**

1. Go to your website: `http://localhost:3000`
2. Open DevTools (F12) > **Network** tab
3. Refresh the page
4. Look for:
   - `gtm.js?id=GTM-K6NLW6KG` (GTM loading)
   - `gtag/js?id=G-XXXXXXXXXX` (GA4 script loading)
   - `collect` requests (GA4 sending data)
5. If you see these, your tags are live!

## How to Verify Tags are Actually Firing

### Method 1: GTM Preview Mode

1. In GTM, click **Preview** button
2. Enter your website URL
3. In preview panel, go to **Tags** tab
4. Your tags should show as **"Fired"** with green checkmark ✓
5. If they show "Not Fired", check triggers

### Method 2: Browser DevTools

1. Open your website
2. Open DevTools > **Console** tab
3. Type: `window.dataLayer` and press Enter
4. You should see an array with objects
5. Look for objects related to your tags

### Method 3: Network Tab

1. Open DevTools > **Network** tab
2. Filter by: `gtm` or `gtag` or `collect`
3. Refresh the page
4. You should see:
   - GTM script loading
   - GA4 script loading (if GA4 tag is set up)
   - Collect requests (if GA4 is working)

## Common Publishing Issues

### Issue: "I clicked Submit but nothing happened"

**Check:**
- Did you click **Publish** (not just "Create Version")?
- Are there any error messages?
- Try refreshing the GTM page

### Issue: "Submit button keeps appearing"

**This means:**
- You keep making new changes after publishing
- Each time you edit a tag, GTM shows "Submit" again
- This is normal - you need to publish again

### Issue: "I published but tags aren't working"

**Check:**
- Did you refresh your website after publishing?
- Are you testing on the correct URL?
- Check browser console for errors
- Verify tags have correct triggers

## Quick Checklist: Is My Tag Published?

- [ ] I clicked **Submit** button
- [ ] I filled in version name
- [ ] I clicked **Publish** (not just "Create Version")
- [ ] I saw "Version X published successfully" message
- [ ] Submit button disappeared (or shows version number)
- [ ] I refreshed my website
- [ ] I can see tag firing in GTM Preview mode
- [ ] I can see requests in Network tab

## Understanding GTM Workspaces

GTM has workspaces to let you work on changes without affecting live tags:

- **Default Workspace**: Usually where you work
- **Other Workspaces**: For testing changes

**Important:**
- Changes in one workspace don't affect others
- You need to publish from the workspace you're working in
- Published changes affect ALL workspaces (they all use the same container)

## Still Confused?

**Simple Test:**
1. Create a test tag: Custom HTML with `<script>console.log('Test Published');</script>`
2. Set trigger to "All Pages"
3. Click **Submit** > **Publish**
4. Refresh your website
5. Check browser console for "Test Published" message
6. If you see it, publishing is working!

