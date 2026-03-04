import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

// ─── Rate Limiter (in-memory) ────────────────────────────────────────────────
const RATE_LIMIT_MAX = 3;          // จำนวนครั้งสูงสุด
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 นาที (ms)

interface RateRecord { count: number; resetAt: number; }
const rateLimitMap = new Map<string, RateRecord>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, retryAfter: 0 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true, retryAfter: 0 };
}

// ─── Nodemailer ──────────────────────────────────────────────────────────────
// สร้าง transporter สำหรับ Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, _hp, _loadedAt } = body;

    // Get IP address and user agent
    const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1').split(',')[0].trim();
    const userAgent = request.headers.get('user-agent') || '';

    // ── ป้องกัน Bot: Honeypot ─────────────────────────────────────────────────
    // _hp ต้องว่างเสมอ — bot มักกรอก field ซ่อนทุก field
    if (_hp) {
      // ตอบ success หลอก bot ไม่ให้รู้ว่าถูกบล็อก
      return NextResponse.json({ message: 'Message sent successfully' }, { status: 200 });
    }

    // ── ป้องกัน Bot: Timing check ─────────────────────────────────────────────
    // form ต้องถูก load อย่างน้อย 3 วินาทีก่อน submit
    const MIN_FILL_TIME_MS = 3000;
    if (_loadedAt && typeof _loadedAt === 'number') {
      const elapsed = Date.now() - _loadedAt;
      if (elapsed < MIN_FILL_TIME_MS) {
        return NextResponse.json({ message: 'Message sent successfully' }, { status: 200 });
      }
    }

    // ── ป้องกัน Spam: Rate Limiting ───────────────────────────────────────────
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${Math.ceil(rateCheck.retryAfter / 60)} minutes.` },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfter) },
        }
      );
    }

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Save to database
    await prisma.contact_messages.create({
      data: {
        name,
        email,
        subject: subject || null,
        message,
        ip_address: ip || null,
        user_agent: userAgent || null,
        status: 'new',
      },
    });

    // Send email notification (non-blocking — ไม่ให้ error นี้กระทบการตอบกลับผู้ใช้)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const notifyTo = process.env.CONTACT_NOTIFY_EMAIL || process.env.GMAIL_USER;
      const emailSubject = subject ? `[Contact Form] ${subject}` : `[Contact Form] ข้อความจาก ${name}`;

      transporter
        .sendMail({
          from: `"CE Website" <${process.env.GMAIL_USER}>`,
          to: notifyTo,
          replyTo: email,
          subject: emailSubject,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed; border-bottom: 2px solid #e9d5ff; padding-bottom: 8px;">
                ข้อความจากฟอร์มติดต่อ
              </h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 100px;"><strong>ชื่อ</strong></td>
                  <td style="padding: 8px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>อีเมล</strong></td>
                  <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                ${subject ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>เรื่อง</strong></td>
                  <td style="padding: 8px 0;">${subject}</td>
                </tr>` : ''}
              </table>
              <div style="background: #f9fafb; border-radius: 8px; padding: 16px;">
                <strong style="color: #6b7280;">ข้อความ:</strong>
                <p style="margin-top: 8px; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
                อีเมลนี้ส่งอัตโนมัติจากเว็บไซต์ภาควิชา CE KSU
              </p>
            </div>
          `,
        })
        .catch((err) => {
          // Log เฉยๆ ไม่ throw เพื่อให้ response ปกติ
          console.error('Email notification failed:', err);
        });
    }

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
