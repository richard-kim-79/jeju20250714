# JeJu SNS Frontend

This is the frontend for JeJu SNS platform, deployed on Vercel.

## 🚀 Deployment

### Automatic Deployment via Vercel

1. Connect your GitHub repository to Vercel
2. Select the `frontend` directory as the root directory
3. Deploy with default settings

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

## 🔧 Configuration

The frontend connects to the backend API deployed on Railway. The API URL is configured in:
- `config.js` - Runtime configuration
- `vercel.json` - API proxy configuration

## 📁 Structure

```
frontend/
├── index.html          # Main page
├── admin.html          # Admin dashboard
├── debug.html          # Debug page
├── offline.html        # Offline fallback
├── styles-optimized.css # Optimized CSS
├── script.js           # Main JavaScript
├── admin.js            # Admin JavaScript
├── service-worker.js   # PWA service worker
├── config.js           # Configuration
├── vercel.json         # Vercel settings
└── js/                 # JavaScript modules
```

## 🌐 Environment Variables

No environment variables needed for frontend deployment. All configuration is handled through `config.js`.

## 🔗 Backend API

The frontend connects to the backend API at:
- Production: `https://jeju-sns.railway.app`
- Development: `http://localhost:3001`

## 📱 Features

- Progressive Web App (PWA)
- Offline support
- Responsive design
- Real-time updates
- Admin dashboard

## 🛠 Local Development

```bash
# Serve locally
npx http-server -p 8080

# Or use any static server
python -m http.server 8080
```

---
**Backend Repository**: [JeJu SNS Backend](https://github.com/richard-kim-79/jeju20250714)  
**Live Demo**: [https://jeju-sns.vercel.app](https://jeju-sns.vercel.app)