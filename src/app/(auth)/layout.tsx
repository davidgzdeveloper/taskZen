import { AppLogo } from "@/components/AppLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="p-4 border-b">
        <AppLogo />
      </header>
      <main className="flex flex-1 items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}
