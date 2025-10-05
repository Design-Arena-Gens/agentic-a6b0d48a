export const metadata = {
  title: 'Chess Game',
  description: 'Play chess in your browser',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
