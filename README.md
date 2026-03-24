# Brand Portal - Proteos Biotech

## 🎯 Overview
Professional brand asset management system for Proteos Biotech, enabling distributors, agencies, and marketing teams to access, download, and manage brand materials across multiple brands and regions.

## ✨ Features Completed

### 🌍 Public Catalog (Login Required)
- **🔐 Protected catalog** with authentication system
- **Advanced filtering** by brand, material type, region, and search
- **Real-time statistics** showing available assets and brands
- **Direct download** links for all materials
- **Responsive design** optimized for all devices
- **Multi-language support** (English/Spanish)
- **Hero section** with brand statistics

### 🔐 Authentication & User Management
- **Multi-role system**: Admin, Marketing Team, Distributor, Agency
- **User administration panel** for creating and managing users
- **Role-based permissions** with brand access control
- **Region and country-specific access**
- **🆕 Brand Permissions**: Users only see assets from assigned brands
- **🆕 Region Permissions**: Users only see assets from assigned regions (GLOBAL, USA, LATAM, EUROPA, MENA, ASIA)
- **🆕 Strict Access Control**: Users with NO brand access see NO assets (except admin/marketing)
- **🆕 Primary Brand Validation**: Users can only see assets if they have access to the primary brand
- **Session management** with persistent login

### 🏢 Brand & Asset Organization
- **Hierarchical structure**: Brand → Sub-Brand → Material Type
- **4 Main Brands**: PROTEOS BIOTECH, pbserum, WAID, FIBRORESTIL
- **8 Sub-brands** under pbserum (HA, REVEAL, PLUS, SPECIFIC, VELURIA, etc.)
- **15 Material categories**: Brand Books, Logos, Typography, Packshots, Images, Videos, Slide Kits, Sales Materials, Marketing, Training, Medical, Events, Social Media, Press, Graphics
- **🆕 Multi-Brand Assets**: Assets can belong to multiple brands simultaneously

### 📁 Asset Management
- **File upload system** with drag-and-drop support
- **🆕 Large file support**: Upload files up to **2.5 GB** using chunked upload
- **🆕 R2 Multipart Upload**: Native Cloudflare R2 multipart API for reliable large file uploads
- **Progress tracking**: Real-time progress bar for large file uploads (>80 MB)
- **Automatic chunking**: Files >80 MB automatically split into 50 MB chunks
- **🆕 Featured Image/Thumbnail**: Upload custom preview images (400x300px, max 500KB) for assets displayed in public catalog
- **Metadata tagging**: Region, Country, Regulatory (EU/NON-EU/GLOBAL), Language
- **File type support**: PDF, Images, Videos, ZIP, Office files
- **Asset library** with filtering by brand, sub-brand, and material type
- **Download tracking** and activity logs
- **🆕 Bulk Edit**: Edit brands for multiple assets at once
  - Replace brands (overwrite existing)
  - Add brands (keep existing + add new)
  - Remove brands (remove specific brands)
- **🆕 Multi-brand assignment**: Assign assets to multiple brands during upload/edit
- **🆕 Dedicated edit pages**: Each asset has its own edit page (no modals) for better UX
- **🆕 Analytics Tracking**: Track all user views and downloads with complete history
  - User email, name, role
  - Event type (view/download)
  - Asset details (title, brand, type)
  - IP address and user agent
  - Timestamp for every action

### 🎨 User Interface
- **Elegant corporate design** inspired by modern brand portals
- **Professional color palette** with blue gradient header
- **Clean sidebar navigation** with hierarchical organization
- **Interactive dashboard** with stats cards and brand grid
- **Responsive asset library** with visual thumbnails
- **Smooth animations** and hover effects throughout
- **Modal-based workflows** for uploads and user management
- **Completely custom CSS** - no heavy frameworks, pure performance
- **🆕 Instructions Page**: Built-in user guide with step-by-step instructions for asset uploads and permission management

### 📊 Analytics Dashboard
- **Overview statistics**: Total views, downloads, unique users, assets accessed
- **Top 10 assets**: Most viewed and downloaded materials
- **🆕 User Activity**: Complete activity history for ALL 94+ registered users
  - Single comprehensive view replacing the previous summary table
  - Expandable/collapsible rows showing full event history per user
  - Shows ALL users in the platform, even those without activity yet
  - Complete timeline of all views and downloads (up to 1,000 events per user)
  - Asset details: title, brand, material type
  - Event metadata: timestamp, IP address, action type
  - Click any user to expand/collapse their full activity history
  - Filter by period: last 7, 30, 90 days, or 12 months
  - Users without activity show 0 views/downloads

### 📧 Transactional Email System
- **🆕 Welcome Emails**: Automatic email sent to new users with login credentials
- **🆕 Password Reset**: Secure token-based password recovery system (1-hour expiration)
- **🆕 Password Changed**: Confirmation email when password is updated
- **Professional templates**: Responsive HTML emails with brand styling
- **Powered by Resend**: Reliable transactional email delivery
- **From address**: brandcenter@pbserum.com

### 📤 User Data Export
- **🆕 Excel Export**: Download complete user database as .xlsx file
  - All user fields: email, name, role, region, country, distributor, language, brands access
  - Status indicators: active/inactive, creation date, last login
  - Timestamped filename for record-keeping
  - One-click export from User Management panel

### 🔄 Mailchimp Integration
- **🆕 Automatic Synchronization**: Users automatically synced to Mailchimp list "BrandCenter"
  - New user creation → Subscribe to Mailchimp
  - User update → Update Mailchimp data
  - User deactivation → Unsubscribe from Mailchimp
- **🆕 Manual Bulk Sync**: Admin can trigger full user sync to Mailchimp
  - Processes all active users in batches
  - Rate-limited to respect Mailchimp API limits (10 users per batch)
  - Detailed sync results with success/failure counts
- **🆕 Rich Data Mapping**: Full user profile synced to Mailchimp
  - Merge fields: FNAME, LNAME, ROLE, REGION, COUNTRY, DISTRIB, LANGUAGE
  - Tags: BrandCenter, user role, user region
- **🆕 Configuration Status**: Check if Mailchimp is properly configured
- **Error Handling**: Failed syncs don't prevent user operations
- **Documentation**: Complete setup guide in MAILCHIMP_SETUP.md

### 🎨 User Interface
- **Elegant corporate design** inspired by modern brand portals
- **Professional color palette** with blue gradient header
- **Clean sidebar navigation** with hierarchical organization
- **Interactive dashboard** with stats cards and brand grid
- **Responsive asset library** with visual thumbnails
- **Smooth animations** and hover effects throughout
- **Modal-based workflows** for uploads and user management
- **Completely custom CSS** - no heavy frameworks, pure performance
- **🆕 Instructions Page**: Built-in user guide with step-by-step instructions for asset uploads and permission management

## 🗄️ Data Architecture

### Database (Cloudflare D1 - SQLite)
- **users**: User accounts with role-based access and brand permissions
- **brands**: Main brand catalog
- **sub_brands**: Product lines under each brand
- **material_types**: 15 predefined asset categories
- **assets**: File metadata with taxonomy
- **🆕 asset_brands**: Many-to-many relationship for multi-brand assets
- **🆕 analytics_events**: Detailed tracking of all user interactions
  - event_type: 'view' or 'download'
  - user information: id, email, name, role, region
  - asset information: id, title, brand, material type, file type
  - metadata: timestamp, IP address, user agent, referer, session_id
- **activity_log**: Audit trail for all actions
- **user_requests**: Customer requests for specific materials

### Storage (Cloudflare R2)
- File storage with unique identifiers
- Public URL access for downloads
- Automatic file type detection
- **🆕 Thumbnails**: Separate storage for custom preview images (`thumbnails/` directory)

### Taxonomy Structure
```
Brand (Level 1)
  └── Sub-Brand (Level 2)
      └── Material Type (Level 3)
          └── Assets
              └── 🆕 Multiple Brands (M2M relationship)
```

## 🌐 URLs

### Production (Cloudflare Pages)
- **🌐 Primary Domain**: https://brandcenter.pbserum.com ⭐ **(CONFIGURAR DNS)**
- **📦 Catalog**: https://brandcenter.pbserum.com/catalog
- **🔧 Admin Panel**: https://brandcenter.pbserum.com/admin
- **🔗 Backup URL**: https://brand-portal-proteos.pages.dev

### Development (Sandbox)
- **Public Catalog**: https://3000-ich0xjbt2qsykky4ri4zb-5634da27.sandbox.novita.ai
- **Admin Panel**: https://3000-ich0xjbt2qsykky4ri4zb-5634da27.sandbox.novita.ai/admin
- **Admin Login**: admin@proteos.com / admin123

### 🔧 Custom Domain Setup
Para configurar `brandcenter.pbserum.com`, consulta: **[DOMAIN_SETUP.md](./DOMAIN_SETUP.md)**

### Public API Endpoints (No authentication required)
- `GET /api/public/brands` - List all active brands
- `GET /api/public/material-types` - List all material categories
- `GET /api/public/assets` - Browse and search assets with filters
- `GET /api/public/stats` - Get catalog statistics

### Protected API Endpoints (Authentication required)
- `POST /api/auth/login` - User authentication
- `GET /api/auth/session` - Verify session
- `GET /api/brands` - List all brands
- `GET /api/material-types` - List material categories
- `GET /api/assets?userId=X` - Search and filter assets (with brand permissions)
- `POST /api/assets` - Create new asset with multiple brands
- `PUT /api/assets/:id` - Update asset with multiple brands
- `🆕 POST /api/assets/bulk-edit` - Bulk edit multiple assets
- `DELETE /api/assets/:id` - Delete asset
- `POST /api/upload` - Upload file to R2 (small files <80 MB)
- `🆕 POST /api/upload/start-multipart` - Start multipart upload for large files
- `🆕 POST /api/upload/chunk` - Upload chunk (part) for large files
- `🆕 POST /api/upload/complete-multipart` - Complete multipart upload
- `🆕 POST /api/upload/abort-multipart` - Abort failed multipart upload
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/:id/password` - View user password (admin only)
- `PUT /api/users/:id/password` - Change user password (admin only)
- `🆕 GET /api/users/export` - Export all users to Excel (admin only)
- `🆕 POST /api/users/sync-mailchimp` - Bulk sync all active users to Mailchimp (admin only)

### Analytics API Endpoints (Admin/Marketing only)
- `GET /api/analytics/stats?days=30` - Get overview statistics
- `GET /api/analytics/top-assets?days=30&limit=10` - Get top performing assets
- `GET /api/analytics/by-user?days=30` - Get activity summary by user
- `🆕 GET /api/analytics/users-history?days=30` - Get complete activity history for all users with events
- `GET /api/analytics/user/:userId/history?days=30` - Get activity history for specific user
- `GET /api/analytics/by-brand?days=30` - Get activity by brand
- `GET /api/analytics/timeline?days=30` - Get daily activity timeline
- `GET /api/analytics/all-assets?days=30` - Get performance for all assets
- `POST /api/analytics/track/view` - Track asset view event
- `POST /api/analytics/track/download` - Track asset download event

### Mailchimp Integration API Endpoints (Admin only)
- `🆕 GET /api/mailchimp/status` - Check Mailchimp configuration status
- `🆕 POST /api/users/sync-mailchimp` - Bulk synchronize all active users to Mailchimp list

## 🚀 Deployment Status

### Current Status: ✅ Production Ready

### Live URLs
- **Production**: https://brandcenter.pbserum.com (DNS pending)
- **Cloudflare**: https://brand-portal-proteos.pages.dev
- **Latest Deployment**: https://1f84b426.brand-portal-proteos.pages.dev

## 📧 Transactional Email System

**Status**: ✅ **CONFIGURED AND ACTIVE** (Resend API configured)

The system uses **Resend** (https://resend.com) to send professional transactional emails from `brandcenter@pbserum.com`.

### Email Templates Available

1. **Welcome Email** - Sent when creating new users
   - Includes login credentials
   - Security warning to change password
   - Direct access button

2. **Password Reset** - Sent when user requests password recovery
   - Secure token link (expires in 1 hour)
   - One-time use only
   - Professional design

3. **Password Changed** - Sent after successful password change
   - Confirmation with timestamp
   - Security alert section

### Configuration Required

✅ **CONFIGURED** - Resend API Key is active in production

For local development, add to `.dev.vars`:
```bash
RESEND_API_KEY=your_api_key_here
```

📖 **Complete setup guide**: See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for detailed instructions.

**Note**: Emails are now sent automatically for new users, password resets, and password changes.

## 🔄 Mailchimp Integration

**Status**: ✅ **CONFIGURED AND ACTIVE** (List ID: c01bb7b337, Server: us15)

The system automatically synchronizes user data with Mailchimp for email marketing campaigns.

### Current Configuration
- ✅ **MAILCHIMP_API_KEY**: Configured (us15 server)
- ✅ **MAILCHIMP_LIST_ID**: Configured (c01bb7b337)
- ✅ **Tag**: `brandcenter` (lowercase)
- ✅ **Active Users**: 107 users ready to sync
- ✅ **Status Endpoint**: https://brandcenter.pbserum.com/api/mailchimp/status

### Features

1. **Automatic Sync** - Users are synced automatically:
   - ✅ **New user created** → Subscribes to Mailchimp
   - ✅ **User data updated** → Updates Mailchimp record
   - ✅ **User deactivated** → Unsubscribes from Mailchimp

2. **Manual Bulk Sync** - Admin can sync all active users:
   - Click "Sync to Mailchimp" button in User Management
   - Processes users in batches (10 per batch)
   - Shows detailed results (success/failed counts)
   - Rate-limited to respect Mailchimp API limits

3. **Rich Data Mapping** - Full user profile synced:
   ```javascript
   Merge Fields: FNAME, LNAME, ROLE, REGION, COUNTRY, DISTRIB, LANGUAGE
   Tags: brandcenter, user_role, user_region
   ```

4. **Configuration Status** - Check if properly configured:
   - API endpoint: `GET /api/mailchimp/status`
   - Shows: hasApiKey, hasListId, server

### Mailchimp List Setup

Required merge fields in your Mailchimp list (c01bb7b337):
- `FNAME` (Text) - First Name
- `LNAME` (Text) - Last Name  
- `ROLE` (Text) - User Role
- `REGION` (Text) - Region
- `COUNTRY` (Text) - Country
- `DISTRIB` (Text) - Distributor
- `LANGUAGE` (Text) - Language

### Next Steps

1. **Create merge fields** in Mailchimp list (5 minutes)
2. **Run first sync** from Admin Panel > Users > "Sync to Mailchimp" (2 minutes)
3. **Verify contacts** in Mailchimp (107 active users will be synced)

📖 **Activation guide**: See [MAILCHIMP_READY.md](./MAILCHIMP_READY.md) for step-by-step instructions.
📖 **Technical guide**: See [MAILCHIMP_SETUP.md](./MAILCHIMP_SETUP.md) for detailed documentation.

### Technology Stack
- **Backend**: Hono (v4.0.0) - Fast, lightweight web framework
- **Frontend**: Vanilla JavaScript with TailwindCSS CDN
- **Database**: Cloudflare D1 (SQLite) - Global distributed
- **Storage**: Cloudflare R2 (S3-compatible) - Object storage
- **Runtime**: Cloudflare Workers - Edge computing
- **Build**: Vite (v6.4.1) - Lightning fast bundler
- **Process Manager**: PM2 (development)
- **Deployment**: Cloudflare Pages - Automatic CI/CD

## 📖 User Guide

### For Public Catalog Users
1. **Login** at https://brandcenter.pbserum.com/login
2. **Use credentials** provided by administrator
3. **Browse materials** by brand, type, or region
4. **Use search** to find specific assets
5. **Download directly** any material you need
6. **Filter by region** to find location-specific content

### For Administrators
1. **Login** with admin credentials at /admin
2. **Navigate to Users** to create distributor/agency accounts
3. **Assign brand access** based on distribution agreements
4. **Upload assets** through the Upload button (supports multi-brand)
5. **Use Bulk Edit** to assign multiple assets to brands at once
6. **Monitor activity** in the dashboard
7. **🆕 Export users** to Excel for record-keeping
8. **🆕 Sync users** to Mailchimp for email marketing campaigns

### For Distributors
1. **Login** with provided credentials
2. **Browse brands** you have access to (filtered automatically)
3. **Filter assets** by material type (logos, packshots, etc.)
4. **Download materials** for your region/market
5. **View metadata** (regulatory status, language, etc.)
6. **Only see assets** from brands assigned to your account

### For Marketing Team
1. **Full access** to all brands and materials
2. **Upload new assets** with proper metadata
3. **Assign assets to multiple brands** simultaneously
4. **Manage materials** across all brands
5. **Use Bulk Edit** for efficient asset management
6. **Track downloads** and usage

## 🔧 Development

### Local Setup
```bash
# Install dependencies
npm install

# Build project
npm run build

# Run migrations
npm run db:migrate:local

# Seed database
npm run db:seed

# Start development server
pm2 start ecosystem.config.cjs

# View logs
pm2 logs brand-portal --nostream
```

### Database Management
```bash
# Apply migrations locally
npm run db:migrate:local

# Apply migrations to production
npm run db:migrate:prod

# Seed local database
npm run db:seed

# Reset local database
npm run db:reset

# Query local database
npm run db:console:local
```

## 📝 Features Not Yet Implemented

### Phase 2 - Advanced Features
- [ ] **Advanced search** with full-text search
- [ ] **Asset versions** and revision history
- [ ] **Download as ZIP** for multiple files
- [ ] **Favorites/Collections** for users
- [ ] **Comments** on assets
- [ ] **Expiration dates** for time-limited materials
- [ ] **Usage analytics** dashboard
- [ ] **Email notifications** for new uploads

### Phase 3 - Enterprise Features
- [ ] **Custom workflows** for asset approval
- [ ] **API access** for third-party integrations
- [ ] **CDN integration** for global delivery
- [ ] **Advanced permissions** (view/download/edit)
- [ ] **Multi-language UI** (currently English/Spanish metadata only)
- [ ] **Mobile app** version
- [ ] **Asset sharing** via public links

### ✅ Recently Completed
- [x] **🎉 Large file upload support** (up to 2.5 GB with R2 Multipart Upload API)
- [x] **Progress tracking** for large file uploads with real-time progress bar
- [x] **Automatic chunking** (50 MB chunks) for files >80 MB
- [x] **Dedicated edit pages** for assets (replaced modals for better UX)
- [x] **Multi-select regions** in asset edit/create forms
- [x] **Multi-brand assets** (assets can belong to multiple brands)
- [x] **Bulk edit** functionality (edit multiple assets at once)
- [x] **Brand permissions** (users only see assigned brands)
- [x] **Protected catalog** (login required)
- [x] **Many-to-many relationship** (asset_brands table)

## 🎯 Recommended Next Steps

### Immediate (Week 1)
1. ✅ **Configure custom domain** `brandcenter.pbserum.com` (see DOMAIN_SETUP.md)
2. ✅ **Test multi-brand assets** and bulk edit features
3. ✅ **Verify brand permissions** for different user roles
4. **Create production user accounts** for distributors/agencies
5. **Upload real brand assets** for each brand
6. **Train users** on new bulk edit and multi-brand features

### Short-term (Month 1)
1. ✅ **Implement password hashing** with bcrypt for production
2. ✅ **Add JWT authentication** for secure API access
3. **Create admin documentation** for user management
4. **Set up monitoring** and error tracking
5. **Gather feedback** and iterate on UX
6. **Test brand permissions** with real distributors

### Long-term (Quarter 1)
1. **Scale to handle thousands of assets**
2. **Add advanced search** capabilities
3. **Implement analytics** for usage tracking
4. **Integrate with existing systems** (CRM, etc.)
5. **Expand to additional brands/regions**
6. **Implement asset versioning** system

## 🔒 Security Notes

### Current Implementation
- Basic email/password authentication
- Role-based access control
- SQL injection protection (parameterized queries)
- CORS enabled for API routes

### Production Requirements
- [ ] Enable HTTPS only (Cloudflare automatic)
- [ ] Implement JWT tokens for API auth
- [ ] Hash passwords with bcrypt (currently placeholder)
- [ ] Rate limiting on login attempts
- [ ] File upload validation and sanitization
- [ ] Content Security Policy headers

## 📞 Support

For questions or issues:
- Email: admin@proteos.com
- GitHub Issues: [Create issue]
- Documentation: See `docs/` folder

## 📄 License

Proprietary - Proteos Biotech © 2026

---

**Last Updated**: 2026-02-20
**Version**: 2.2.2
**Status**: Production Ready ✅

### Recent Updates (v2.2.2)
- 🎬 **Updated English video** - New compressed version (29.73 MB, was 113.7 MB)
- ⚡ **Faster loading** - 74% smaller file size for better performance
- 📹 **Same quality** - Optimized video maintains visual quality

### Previous Updates (v2.2.1)
- 📚 **User Guide in Public Catalog** - Added "User Guide" button next to Logout
- 🎬 **Video tutorials accessible** - Public users can watch tutorial videos
- 🌐 **Bilingual modal** - User Guide modal with English/Spanish videos
- 📱 **Responsive design** - Modal works perfectly on all devices

### Previous Updates (v2.2.0)
- 🎬 **Video Tutorials** - Added tutorial videos to Admin User Guide (English & Spanish)
- 🌐 **Bilingual support** - Video instructions in both languages
- 📹 **Integrated video player** - Watch tutorials directly in admin panel
- ⬇️ **Downloadable videos** - Option to download for offline viewing

### Previous Updates (v2.1.1)
- 🐛 **Fixed asset page login** - Moved JavaScript to external file `asset-page.js`
- 🔧 **Fixed syntax error** - Resolved `Uncaught SyntaxError: Unexpected string` error
- 📊 **Fixed analytics tracking** - Downloads and views now count correctly
- 📈 **Analytics Dashboard** - All metrics now working (views, downloads, conversion rate)
- 🎨 **Fixed asset thumbnails** - Images now display in admin Assets Library
- 📝 **Brand naming** - Changed all references to "BRAND CENTER" (uppercase)

### Previous Updates (v2.1.0)
- 🎉 **Large file upload support** (up to 2.5 GB)
- 🚀 **R2 Multipart Upload API** implementation (fixes 503 timeout)
- 📊 **Real-time progress tracking** for large uploads
- ⚡ **Automatic chunking** with 50 MB chunks
- 🎨 **Dedicated edit pages** for better asset editing UX
- 🌍 **Multi-select regions** in forms
