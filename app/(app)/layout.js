import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Providers } from "@/app/providers";

export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
