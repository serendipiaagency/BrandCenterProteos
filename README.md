# Brand Portal - Proteos Biotech

## 🎯 Overview
Professional brand asset management system for Proteos Biotech, enabling distributors, agencies, and marketing teams to access, download, and manage brand materials across multiple brands and regions.

## ✨ Features Completed

### 🔐 Authentication & User Management
- **Multi-role system**: Admin, Marketing Team, Distributor, Agency
- **User administration panel** for creating and managing users
- **Role-based permissions** with brand access control
- **Region and country-specific access**

### 🏢 Brand & Asset Organization
- **Hierarchical structure**: Brand → Sub-Brand → Material Type
- **4 Main Brands**: PROTEOS BIOTECH, pbserum, WAID, FIBRORESTIL
- **8 Sub-brands** under pbserum (HA, REVEAL, PLUS, SPECIFIC, VELURIA, etc.)
- **15 Material categories**: Brand Books, Logos, Typography, Packshots, Images, Videos, Slide Kits, Sales Materials, Marketing, Training, Medical, Events, Social Media, Press, Graphics

### 📁 Asset Management
- **File upload system** with drag-and-drop support
- **Metadata tagging**: Region, Country, Regulatory (EU/NON-EU/GLOBAL), Language
- **File type support**: PDF, Images, Videos, ZIP, Office files
- **Asset library** with filtering by brand, sub-brand, and material type
- **Download tracking** and activity logs

### 🎨 User Interface
- **Modern, responsive design** with TailwindCSS
- **Dashboard** with statistics and quick access
- **Brand cards** for easy navigation
- **Asset grid view** with thumbnail previews
- **Modal-based workflows** for uploads and user management

## 🗄️ Data Architecture

### Database (Cloudflare D1 - SQLite)
- **users**: User accounts with role-based access
- **brands**: Main brand catalog
- **sub_brands**: Product lines under each brand
- **material_types**: 15 predefined asset categories
- **assets**: File metadata with taxonomy
- **activity_log**: Audit trail for all actions

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
```

## 🌐 URLs

### Development (Sandbox)
- **Application**: https://3000-ich0xjbt2qsykky4ri4zb-5634da27.sandbox.novita.ai
- **Login**: admin@proteos.com / admin123

### API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/brands` - List all brands
- `GET /api/material-types` - List material categories
- `GET /api/assets` - Search and filter assets
- `POST /api/assets` - Create new asset
- `POST /api/upload` - Upload file to R2
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)

## 🚀 Deployment Status

### Current Status: ✅ Development Server Running

### Technology Stack
- **Backend**: Hono (v4.11.4) - Fast, lightweight web framework
- **Frontend**: Vanilla JavaScript with TailwindCSS
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Runtime**: Cloudflare Workers
- **Build**: Vite (v6.3.5)
- **Process Manager**: PM2

## 📖 User Guide

### For Administrators
1. **Login** with admin credentials
2. **Navigate to Users** to create distributor/agency accounts
3. **Assign brand access** based on distribution agreements
4. **Upload assets** through the Upload button
5. **Monitor activity** in the dashboard

### For Distributors
1. **Login** with provided credentials
2. **Browse brands** you have access to
3. **Filter assets** by material type (logos, packshots, etc.)
4. **Download materials** for your region/market
5. **View metadata** (regulatory status, language, etc.)

### For Marketing Team
1. **Full access** to all brands and materials
2. **Upload new assets** with proper metadata
3. **Manage materials** across all brands
4. **Track downloads** and usage

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
- [ ] **Bulk upload** functionality
- [ ] **Asset versions** and revision history
- [ ] **Download as ZIP** for multiple files
- [ ] **Favorites/Collections** for users
- [ ] **Comments** on assets
- [ ] **Expiration dates** for time-limited materials
- [ ] **Usage analytics** dashboard

### Phase 3 - Enterprise Features
- [ ] **Custom workflows** for asset approval
- [ ] **Email notifications** for new uploads
- [ ] **API access** for third-party integrations
- [ ] **CDN integration** for global delivery
- [ ] **Advanced permissions** (view/download/edit)
- [ ] **Multi-language UI** (currently English/Spanish metadata only)
- [ ] **Mobile app** version

## 🎯 Recommended Next Steps

### Immediate (Week 1)
1. **Test file uploads** to Cloudflare R2 (requires R2 bucket setup)
2. **Configure production database** (create D1 database in Cloudflare)
3. **Set up Cloudflare account** and deploy to Pages
4. **Create real user accounts** for testing
5. **Upload sample assets** for each brand

### Short-term (Month 1)
1. **Implement password hashing** with bcrypt for production
2. **Add JWT authentication** for secure API access
3. **Create admin documentation** for user management
4. **Train initial users** on the platform
5. **Gather feedback** and iterate on UX

### Long-term (Quarter 1)
1. **Scale to handle thousands of assets**
2. **Add advanced search** capabilities
3. **Implement analytics** for usage tracking
4. **Integrate with existing systems** (CRM, etc.)
5. **Expand to additional brands/regions**

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

**Last Updated**: 2026-01-20
**Version**: 1.0.0
**Status**: Development Active ✅
