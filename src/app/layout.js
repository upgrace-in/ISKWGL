import "@/globals.css";
import { DonationProvider } from '@/Helpers/DonationContext';
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
      <body>
        <DonationProvider>{children}</DonationProvider>
      </body>
    </html>
  );
}
