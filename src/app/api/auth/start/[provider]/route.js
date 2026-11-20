import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req, { params }) {
  const { provider } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (provider === 'gdrive') {
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${baseUrl}/api/auth/callback/gdrive`
    );
    const url = oauth2.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
    return NextResponse.redirect(url);
  }

  if (provider === 'box') {
    const url = `https://account.box.com/api/oauth2/authorize?client_id=${process.env.BOX_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(`${baseUrl}/api/auth/callback/box`)}`;
    return NextResponse.redirect(url);
  }

  if (provider === 'pcloud') {
    const url = `https://my.pcloud.com/oauth2/authorize?client_id=${process.env.PCLOUD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(`${baseUrl}/api/auth/callback/pcloud`)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.json({ error: 'Unknown OAuth provider' }, { status: 400 });
}