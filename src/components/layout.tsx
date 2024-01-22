export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-black w-screen h-screen flex items-center justify-center">{children}</main>
  )
}
