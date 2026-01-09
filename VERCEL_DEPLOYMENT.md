# Vercel Deployment Checklist - Toetsenist

This guide walks you through deploying Toetsenist to Vercel step-by-step.

## Prerequisites Checklist

Before you start, make sure you have:

- [x] GitHub repository is up to date (already done ✅)
- [ ] Supabase project is set up
- [ ] Database migrations are run in Supabase
- [ ] Anthropic API key (or Gemini API key)
- [ ] All API keys are ready

---

## Part 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and project name (e.g., "toetsenist")
4. Set a strong database password (save it!)
5. Choose region closest to your users
6. Wait for project to initialize (~2 minutes)

### 1.2 Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy contents of `database_schema.sql` from your project
4. Paste and click **Run**
5. Create another new query
6. Copy contents of `auth_migration.sql`
7. Paste and click **Run**

### 1.3 Get Supabase Keys

1. Go to **Project Settings** → **API**
2. Copy these values (you'll need them later):
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGc...
   service_role key: eyJhbGc... (click "Reveal" first)
   ```

### 1.4 Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (should be on by default)
3. Optional: Enable **Google** or **Microsoft** OAuth if desired
4. Go to **Authentication** → **URL Configuration**
5. Add your site URL later after Vercel deployment

---

## Part 2: API Keys Setup

### 2.1 Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to **API Keys**
4. Click **Create Key**
5. Name it "Toetsenist Production"
6. Copy the key (starts with `sk-ant-`)
7. **Save it securely** - you can't see it again!

### 2.2 Optional: Get Gemini API Key

1. Go to [AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Get API Key**
3. Create or select project
4. Copy the key
5. Save securely

---

## Part 3: Vercel Deployment via CLI

### 3.1 Install Vercel CLI

Open your terminal:

```bash
npm install -g vercel
```

Verify installation:
```bash
vercel --version
```

### 3.2 Login to Vercel

```bash
vercel login
```

This will:
- Open your browser
- Ask you to authenticate
- Confirm in terminal when done

### 3.3 Navigate to Project

```bash
cd "/Users/hendrikpostma/Library/CloudStorage/OneDrive-HAN/Vibe Coding/Toetsenist/toetsenist"
```

### 3.4 First Deployment (Preview)

```bash
vercel
```

**Answer the questions:**

```
? Set up and deploy "~/...toetsenist"? [Y/n]
→ Y

? Which scope do you want to deploy to?
→ (Select your account)

? Link to existing project? [y/N]
→ N

? What's your project's name?
→ toetsenist (or press Enter)

? In which directory is your code located?
→ ./ (press Enter)

? Want to modify these settings? [y/N]
→ N
```

Wait for deployment (~2-3 minutes).

You'll get a **Preview URL**: `https://toetsenist-xxxxx.vercel.app`

**⚠️ Don't test yet! Environment variables are missing.**

---

## Part 4: Add Environment Variables

### 4.1 Via Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on **toetsenist** project
3. Click **Settings** → **Environment Variables**
4. Add each variable below:

#### Required Variables:

| Variable Name | Value | Where to Get It |
|---------------|-------|-----------------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | From Anthropic Console (Part 2.1) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Project Settings → API (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase Project Settings → API (service_role) |

#### Optional Variables:

| Variable Name | Value | When to Add |
|---------------|-------|-------------|
| `GEMINI_API_KEY` | `...` | If using Gemini features |

**For each variable:**
1. Click **Add New**
2. Enter name (exactly as shown above)
3. Enter value
4. Select environments: ✅ **Production**, ✅ **Preview**, ✅ **Development**
5. Click **Save**

### 4.2 Alternative: Via CLI

```bash
# Add each variable (will prompt for value)
vercel env add ANTHROPIC_API_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add GEMINI_API_KEY production
```

---

## Part 5: Deploy to Production

After adding environment variables:

```bash
vercel --prod
```

Wait for deployment (~2-3 minutes).

You'll get your **Production URL**: `https://toetsenist.vercel.app`

---

## Part 6: Configure Supabase with Vercel URL

Now that you have your production URL:

1. Go back to **Supabase Dashboard**
2. Go to **Authentication** → **URL Configuration**
3. Add **Site URL**: `https://toetsenist.vercel.app`
4. Add **Redirect URLs**:
   ```
   https://toetsenist.vercel.app/auth/callback
   https://toetsenist.vercel.app/**
   ```
5. Click **Save**

---

## Part 7: Test Your Deployment

### 7.1 Basic Tests

1. ✅ **Open your app**: Go to `https://toetsenist.vercel.app`
2. ✅ **Check homepage loads**: Should see upload interface
3. ✅ **Test registration**:
   - Click login/register
   - Create a test account
   - Check email for verification (if enabled)
4. ✅ **Test document upload**:
   - Upload a small PDF or TXT file
   - Wait for concept extraction
   - Verify concepts appear
5. ✅ **Test conversation**:
   - Start a session
   - Answer 2-3 questions
   - Verify level adjusts
6. ✅ **Test report**:
   - End the session
   - Check report generates correctly
7. ✅ **Test dashboard**:
   - Go to dashboard
   - Verify session appears in history

### 7.2 Check Logs

If something fails:

```bash
# View recent deployment logs
vercel logs

# Or in browser:
# Go to Vercel Dashboard → Your Project → Deployments → Click latest → View Logs
```

---

## Part 8: Set Up Custom Domain (Optional)

### 8.1 Add Domain in Vercel

1. Go to **Project Settings** → **Domains**
2. Click **Add**
3. Enter your domain (e.g., `toetsenist.yourdomain.com`)
4. Vercel will show DNS records to add

### 8.2 Update DNS

Add these records in your domain registrar:

```
Type: CNAME
Name: toetsenist (or @ for root)
Value: cname.vercel-dns.com
```

### 8.3 Update Supabase

After domain is active:
1. Go to Supabase → **Authentication** → **URL Configuration**
2. Update **Site URL** to your custom domain
3. Add custom domain to **Redirect URLs**

---

## Part 9: Enable Automatic Deployments

This is already set up! Now every time you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will:
- ✅ Automatically detect the push
- ✅ Build and deploy
- ✅ Show preview URL in GitHub (if you set up GitHub integration)
- ✅ Update production if on main branch

---

## Troubleshooting

### Build Fails

**Check build logs:**
```bash
vercel logs --follow
```

**Common issues:**
- ❌ Missing environment variables → Add in Vercel Dashboard
- ❌ TypeScript errors → Run `npm run build` locally first
- ❌ API key invalid → Verify keys are correct

### Authentication Not Working

1. Check Supabase URL Configuration has correct redirect URLs
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
3. Check browser console for errors

### AI Not Responding

1. Verify `ANTHROPIC_API_KEY` is set correctly
2. Check API key has credits/quota
3. Look at Vercel function logs for errors

### Database Errors

1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
2. Check database migrations ran successfully
3. Verify RLS policies are enabled in Supabase

---

## Useful Commands Reference

```bash
# Deploy preview
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs (live)
vercel logs --follow

# Pull environment variables for local dev
vercel env pull .env.local

# Remove a deployment
vercel rm [deployment-url]

# Open project in Vercel dashboard
vercel inspect
```

---

## Post-Deployment Checklist

After successful deployment:

- [ ] App loads at production URL
- [ ] User registration works
- [ ] Email verification works (if enabled)
- [ ] Document upload works
- [ ] Concept extraction works
- [ ] Conversation starts and responds
- [ ] Level adjustment works during conversation
- [ ] Session can be ended
- [ ] Report generates correctly
- [ ] Dashboard shows session history
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring/analytics set up (optional)

---

## Monitoring & Maintenance

### Check Usage

**Vercel:**
- Dashboard → Analytics → View bandwidth, function invocations

**Anthropic:**
- Console → Usage → Monitor API calls and costs

**Supabase:**
- Dashboard → Usage → Check database size and auth users

### Set Up Alerts

1. **Vercel**: Settings → Notifications → Enable build/deployment alerts
2. **Anthropic**: Console → Set spending limits
3. **Supabase**: Project Settings → Set up usage alerts

---

## Support

If you encounter issues:

1. **Check logs**: `vercel logs --follow`
2. **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
3. **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
4. **Project Issues**: Open issue on GitHub

---

## Success! 🎉

Your Toetsenist app is now live and ready to use!

**Next steps:**
- Share the URL with test users
- Monitor usage and performance
- Iterate based on feedback
- Add more features

**Your Production URL**: `https://toetsenist.vercel.app`

---

*Last updated: January 2026*
