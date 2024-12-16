import "@/globals.css";

export const metadata = {
  title: "ISKCON WARANGAL",
  description: "SHRI SHRI RADHA NILMADHAV MANDIR",
  icons: {
    icon: "/assets/iskcon_logo.jpg",
  }
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
