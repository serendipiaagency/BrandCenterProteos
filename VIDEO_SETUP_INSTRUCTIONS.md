# 📹 Video Tutorials Setup Instructions

## ✅ Current Status
The **Video Tutorials** section has been added to the User Guide page in the admin panel.

**Live URLs:**
- 🆕 Latest: https://c651d7d3.brand-portal-proteos.pages.dev
- 🌐 Production: https://brandcenter.pbserum.com

---

## 📝 Steps to Complete Video Integration

### Step 1: Upload Videos to Brand Center

You need to upload both video files as assets in the Brand Center to get their public URLs.

**Files to upload:**
1. **English Video**: `VIDEOS/1771429313932-Brand Center Video ENG.mp4` (108.43 MB)
2. **Spanish Video**: `VIDEOS/1771429270942-Brand Center Video ESP.mp4` (28.52 MB)

**Upload Instructions:**
1. Go to https://brandcenter.pbserum.com/admin
2. Login with admin credentials
3. Click **"Upload Asset"** button
4. Upload each video with these settings:
   - **Title**: "Brand Center Video ENG" / "Brand Center Video Guía ESP"
   - **Description**: Use the descriptions from the User Guide section
   - **Brand**: Select "PROTEOS BIOTECH" or appropriate brand
   - **Material Type**: Select "Training" or "Videos"
   - **Region**: GLOBAL
   - **Tags**: training, tutorial, guide

---

### Step 2: Get Video URLs

After uploading, you need to get the public URLs for each video:

1. Go to **Assets Library** in admin panel
2. Find both uploaded videos
3. Click on each video
4. Copy the **file_url** from the asset details
   - Or use: `https://pub-XXXXX.r2.dev/FILENAME.mp4`

**Expected URL format:**
```
https://pub-ca4c8a2c764e4e899c9c40b84a1e4449.r2.dev/1234567890-brand-center-video-eng.mp4
https://pub-ca4c8a2c764e4e899c9c40b84a1e4449.r2.dev/1234567890-brand-center-video-esp.mp4
```

---

### Step 3: Update Video URLs in Code

Once you have the public URLs, update the code:

**File to edit:** `/home/user/webapp/public/static/app.js`

**Line ~1927 (English video):**
```javascript
// REPLACE THIS:
<source src="REPLACE_WITH_ENGLISH_VIDEO_URL" type="video/mp4">

// WITH:
<source src="https://pub-ca4c8a2c764e4e899c9c40b84a1e4449.r2.dev/YOUR-ENGLISH-VIDEO.mp4" type="video/mp4">
```

**Line ~1933 (English download):**
```javascript
// REPLACE THIS:
<a href="REPLACE_WITH_ENGLISH_VIDEO_URL" download

// WITH:
<a href="https://pub-ca4c8a2c764e4e899c9c40b84a1e4449.r2.dev/YOUR-ENGLISH-VIDEO.mp4" download
```

**Line ~1957 (Spanish video):**
```javascript
// REPLACE THIS:
<source src="REPLACE_WITH_SPANISH_VIDEO_URL" type="video/mp4">

// WITH:
<source src="https://pub-ca4c8a2c764e4e899c9c40b84a1e4449.r2.dev/YOUR-SPANISH-VIDEO.mp4" type="video/mp4">
```

**Line ~1963 (Spanish download):**
```javascript
// REPLACE THIS:
<a href="REPLACE_WITH_SPANISH_VIDEO_URL" download

// WITH:
<a href="https://pub-ca4c8a2c764e4e899c9c40b84a1e4449.r2.dev/YOUR-SPANISH-VIDEO.mp4" download
```

---

### Step 4: Build and Deploy

After updating the URLs:

```bash
cd /home/user/webapp
npm run build
git add -A
git commit -m "feat: Add video URLs to User Guide tutorials"
npx wrangler pages deploy dist --project-name brandcenter-pbserum
```

---

## 🎨 Current UI Design

The Video Tutorials section appears at the **top** of the User Guide page with:

✅ **Two-column responsive grid layout**
✅ **Video player with controls**
✅ **Placeholder thumbnail** (Training text on blue background)
✅ **Title and description** for each video
✅ **File size display** (108.43 MB / 28.52 MB)
✅ **Download button** for offline viewing
✅ **Professional card design** with hover effects

**English Video Card:**
- Title: "Brand Center Video ENG"
- Description: "Learn how to easily navigate the Brand Center platform in this tutorial video..."
- Size: 108.43 MB
- Language: English

**Spanish Video Card:**
- Title: "Brand Center Video Guía ESP"
- Description: "Aprende a navegar fácilmente por la plataforma del Brand Center..."
- Size: 28.52 MB
- Language: Spanish

---

## 📊 Section Order in User Guide

1. 🎬 **Video Tutorials** (NEW - at the top)
2. ☁️ **Asset Upload** (Step 1 & 2)
3. 🔐 **User Permissions** (Cache warning)
4. 🛡️ **Asset Access Rules** (By brand/region)

---

## 🔧 Alternative: Direct Video Links

If you prefer **NOT** to upload videos to Brand Center, you can:

1. Host videos on **YouTube** or **Vimeo**
2. Embed iframe instead of `<video>` tag
3. Use external CDN/storage service

**Example with YouTube:**
```html
<iframe 
  width="100%" 
  height="100%" 
  src="https://www.youtube.com/embed/VIDEO_ID" 
  frameborder="0" 
  allowfullscreen
></iframe>
```

---

## 📞 Support

If you need help:
1. Check video files are in correct format (MP4)
2. Verify file sizes match (108.43 MB / 28.52 MB)
3. Test video URLs in browser before updating code
4. Clear browser cache after deployment

---

**Last Updated**: February 18, 2026
**Status**: ⏳ Pending video URL configuration
