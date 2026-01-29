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

### 🎨 User Interface
- **Elegant corporate design** inspired by modern brand portals
- **Professional color palette** with blue gradient header
- **Clean sidebar navigation** with hierarchical organization
- **Interactive dashboard** with stats cards and brand grid
- **Responsive asset library** with visual thumbnails
- **Smooth animations** and hover effects throughout
- **Modal-based workflows** for uploads and user management
- **Completely custom CSS** - no heavy frameworks, pure performance

## 🗄️ Data Architecture

### Database (Cloudflare D1 - SQLite)
- **users**: User accounts with role-based access and brand permissions
- **brands**: Main brand catalog
- **sub_brands**: Product lines under each brand
- **material_types**: 15 predefined asset categories
- **assets**: File metadata with taxonomy
- **🆕 asset_brands**: Many-to-many relationship for multi-brand assets
- **activity_log**: Audit trail for all actions
- **user_requests**: Customer requests for specific materials

### Storage (Cloudflare R2)
- File storage with unique identifiers
- Public URL access for downloads
- Automatic file type detection

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

## 🚀 Deployment Status

### Current Status: ✅ Production Ready

### Live URLs
- **Production**: https://brandcenter.pbserum.com (DNS pending)
- **Cloudflare**: https://brand-portal-proteos.pages.dev
- **Latest Deployment**: https://d967882e.brand-portal-proteos.pages.dev

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

**Last Updated**: 2026-01-29
**Version**: 2.1.0
**Status**: Production Ready ✅

### Recent Updates (v2.1.0)
- 🎉 **Large file upload support** (up to 2.5 GB)
- 🚀 **R2 Multipart Upload API** implementation (fixes 503 timeout)
- 📊 **Real-time progress tracking** for large uploads
- ⚡ **Automatic chunking** with 50 MB chunks
- 🎨 **Dedicated edit pages** for better asset editing UX
- 🌍 **Multi-select regions** in forms
- ✅ **Cache busting** system (v=12)
