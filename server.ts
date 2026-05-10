import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import nodemailer from 'nodemailer';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin (Using default creds if available, otherwise just use what we can)
// For AI Studio environment, we often have default credentials or can use ADC
const adminApp = initializeApp();
const db = getFirestore(adminApp);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Recovery API
  app.post('/api/admin/send-recovery', async (req, res) => {
    const { email, appPassword, masterPin } = req.body;

    if (!email || !appPassword || !masterPin) {
      return res.status(400).json({ error: 'সবগুলো তথ্য প্রদান করুন।' });
    }

    try {
      // Get settings from Firestore to verify credentials
      const settingsDoc = await db.collection('settings').doc('site').get();
      if (!settingsDoc.exists) {
        return res.status(404).json({ error: 'সেটিংস পাওয়া যায়নি।' });
      }

      const settings = settingsDoc.data();
      const adminCreds = settings?.adminCredentials;

      if (!adminCreds) {
        return res.status(400).json({ error: 'অ্যাডমিন ক্রেডেনশিয়াল সেট করা নেই।' });
      }

      // Verify Gmail and Master PIN
      if (email !== adminCreds.adminGmail || masterPin !== adminCreds.masterPin) {
        return res.status(401).json({ error: 'ভুল জিমেইল অথবা সিকিউরিটি পিন।' });
      }

      // Verify App Password matches what's in settings (security requirement)
      if (appPassword !== adminCreds.adminGmailPassword) {
        return res.status(401).json({ error: 'ভুল অ্যাপ পাসওয়ার্ড।' });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: email,
          pass: appPassword
        }
      });

      const token = uuidv4();
      const expiration = Date.now() + 1000 * 60 * 30; // 30 minutes

      // Save token to Firestore
      await db.collection('recoveryTokens').doc(token).set({
        email: email,
        expiresAt: expiration,
        used: false
      });

      const host = req.get('host');
      const protocol = req.protocol;
      const verifyLink = `${protocol}://${host}/admin/verify?token=${token}`;

      const mailOptions = {
        from: email,
        to: email, // Sending to themselves
        subject: 'BAZAR DALA - অ্যাডমিন রিকভারি কনফার্মেশন',
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #6366f1;">অ্যাডমিন এক্সেস রিকভারি</h2>
            <p>আপনি আপনার অ্যাডমিন এক্সেস রিকভার করার জন্য রিকোয়েস্ট করেছেন।</p>
            <p>নিচের বাটনে ক্লিক করে আপনার পরিচয় নিশ্চিত করুন এবং লগইন করুন:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" style="display: inline-block; padding: 14px 28px; background: #6366f1; color: white; text-decoration: none; font-weight: bold; border-radius: 4px;">কনফার্ম এবং লগইন</a>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #eee; pt: 10px;">এই লিঙ্কটি ৩০ মিনিটের জন্য কার্যকর থাকবে। আপনি যদি এই রিকোয়েস্ট না করে থাকেন, তবে দ্রুত আপনার পাসওয়ার্ড পরিবর্তন করুন।</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: 'রিকভারি ইমেইল পাঠানো হয়েছে।' });
    } catch (error: any) {
      console.error('Email send error:', error);
      res.status(500).json({ error: 'ইমেইল পাঠাতে সমস্যা হয়েছে। আপনার অ্যাপ পাসওয়ার্ড চেক করুন।' });
    }
  });

  // Verification API
  app.get('/api/admin/verify-recovery', async (req, res) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token is required' });
    }

    try {
      const tokenDoc = await db.collection('recoveryTokens').doc(token).get();
      
      if (!tokenDoc.exists) {
        return res.status(404).json({ error: 'Invalid or expired token' });
      }

      const data = tokenDoc.data();
      if (!data || data.used || data.expiresAt < Date.now()) {
        return res.status(400).json({ error: 'Token already used or expired' });
      }

      // Mark token as used
      await db.collection('recoveryTokens').doc(token).update({ used: true });

      res.json({ success: true, message: 'Identity verified' });
    } catch (error: any) {
      console.error('Verification error:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  // Add a simple health check or API route if needed in the future
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for SPA in dev mode - handle all non-API and non-source requests
    app.use('*', async (req, res, next) => {
      const urlPath = req.originalUrl;
      
      // EXCLUSIONS:
      // 1. API routes
      // 2. Vite internal paths (/@vite, /@fs, /@id)
      // 3. Source files (/src)
      // 4. Files with extensions that are NOT .html (assets)
      if (
        urlPath.startsWith('/api') || 
        urlPath.startsWith('/@vite') || 
        urlPath.startsWith('/@fs') || 
        urlPath.startsWith('/@id') ||
        urlPath.startsWith('/src') ||
        (urlPath.includes('.') && !urlPath.endsWith('.html'))
      ) {
        return next();
      }

      try {
        let template = await fs.readFile(
          path.resolve(__dirname, 'index.html'),
          'utf-8',
        );

        template = await vite.transformIndexHtml(urlPath, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production mode
    const distPath = path.resolve(__dirname, 'dist');
    
    // Serve static files
    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: true
    }));

    // SPA fallback: serve index.html for all non-matched routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
          res.status(500).send('Server Error: Failed to load index.html');
        }
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
