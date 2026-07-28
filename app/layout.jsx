import "./globals.css";

export const metadata = {
  title: "CareerForge — Build the career you are meant for",
  description:
    "AI-powered career development for students: job matching, skill assessment, resumes, learning, community, and progress analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
