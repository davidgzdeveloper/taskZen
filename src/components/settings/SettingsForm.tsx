
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function SettingsForm() {
    const { user, updateUserPreferences } = useAuth();
    const { toast } = useToast();

    const [pomodoroWork, setPomodoroWork] = useState(25);
    const [pomodoroBreak, setPomodoroBreak] = useState(5);
    const [notifications, setNotifications] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if (user && user.preferences) {
            setPomodoroWork(user.preferences.pomodoroWork);
            setPomodoroBreak(user.preferences.pomodoroBreak);
            setNotifications(user.preferences.notifications);
            setTheme(user.preferences.theme === 'DARK' ? 'dark' : 'light');
        }
    }, [user]);

    const handleThemeChange = (checked: boolean) => {
        const newTheme = checked ? 'dark' : 'light';
        setTheme(newTheme);
        // Apply theme immediately to the UI
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
        // Save to localStorage for persistence
        localStorage.setItem('theme', newTheme);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const { error } = await updateUserPreferences({
            pomodoroWork,
            pomodoroBreak,
            notifications,
            theme: theme.toUpperCase() as 'LIGHT' | 'DARK',
        });
        setIsLoading(false);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to save settings. Please try again.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Settings Saved",
                description: "Your preferences have been updated.",
            });
        }
    };

    if (!user) {
        // You can show a loader here while user data is being fetched
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your application preferences.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Pomodoro Timer</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="work-duration">Work Duration (minutes)</Label>
                                <Input 
                                    id="work-duration" 
                                    type="number" 
                                    value={pomodoroWork}
                                    onChange={e => setPomodoroWork(Number(e.target.value))}
                                    min="5"
                                    max="60"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                                <Input 
                                    id="break-duration" 
                                    type="number"
                                    value={pomodoroBreak}
                                    onChange={e => setPomodoroBreak(Number(e.target.value))}
                                    min="1"
                                    max="30"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-lg font-medium">Appearance & Notifications</h3>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="notifications">Enable Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Get notified when a session ends.
                                </p>
                            </div>
                            <Switch 
                                id="notifications"
                                checked={notifications}
                                onCheckedChange={setNotifications}
                                disabled={isLoading}
                            />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                             <div>
                                <Label htmlFor="theme">Dark Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Toggle between light and dark themes.
                                </p>
                            </div>
                            <Switch 
                                id="theme"
                                checked={theme === 'dark'}
                                onCheckedChange={handleThemeChange}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
