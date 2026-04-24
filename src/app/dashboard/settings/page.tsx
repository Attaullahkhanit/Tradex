import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon, Bell, Lock, Palette, Globe } from "lucide-react";

const sections = [
  { name: "General", icon: SettingsIcon, desc: "Manage your account settings and preferences." },
  { name: "Notifications", icon: Bell, desc: "Control how you receive alerts and updates." },
  { name: "Security", icon: Lock, desc: "Update your password and security settings." },
  { name: "Appearance", icon: Palette, desc: "Customize the look and feel of your dashboard." },
  { name: "Language", icon: Globe, desc: "Select your preferred language and region." },
];

export default function SettingsPage() {
  return (
    <div className="p-8 pb-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-zinc-500">Manage your application preferences and account security.</p>
        </div>

        <div className="grid gap-6">
          {sections.map((section) => (
            <Card key={section.name} className="border-zinc-800 bg-zinc-900/40 transition-colors hover:bg-zinc-900/60">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                  <section.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{section.name}</CardTitle>
                  <CardDescription>{section.desc}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
