import "@/globals.css";
import { DonationProvider } from '@/Helpers/DonationContext';
import Script from 'next/script';
export const metadata = {
  title: "ISKCON WARANGAL",
  description: "SHRI SHRI RADHA NILMADHAV MANDIR",
  icons: {
    icon: "/assets/iskcon_logo.jpg",
  }
};

// export default function RootLayout({ children }) {

//   return (
//     <html lang="en">
//       <body>{children}</body>
//     </html>
//   );
// }

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-RRN3XB5GXQ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-RRN3XB5GXQ');
        `}
      </Script>
      <body>
        <DonationProvider>{children}</DonationProvider>
      </body>
    </html>
  );
}
