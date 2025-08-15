
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/hooks/useAppContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export function SettingsForm() {
    const { user, updateUserPreferences, theme, setTheme } = useAppContext();
    const { toast } = useToast();

    const [workDuration, setWorkDuration] = useState(user?.preferences.pomodoroWork || 25);
    const [breakDuration, setBreakDuration] = useState(user?.preferences.pomodoroBreak || 5);
    const [notifications, setNotifications] = useState(user?.preferences.notifications || true);
    
    useEffect(() => {
        if (user) {
            setWorkDuration(user.preferences.pomodoroWork);
            setBreakDuration(user.preferences.pomodoroBreak);
            setNotifications(user.preferences.notifications);
        }
    }, [user]);

    const handleThemeChange = (checked: boolean) => {
        const newTheme = checked ? 'dark' : 'light';
        setTheme(newTheme);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUserPreferences({
            pomodoroWork: workDuration,
            pomodoroBreak: breakDuration,
            notifications,
            theme,
        });
        toast({
            title: "Settings Saved",
            description: "Your preferences have been updated.",
        });
    };

    if (!user) {
        return null;
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
                                    value={workDuration}
                                    onChange={e => setWorkDuration(Number(e.target.value))}
                                    min="5"
                                    max="60"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                                <Input 
                                    id="break-duration" 
                                    type="number"
                                    value={breakDuration}
                                    onChange={e => setBreakDuration(Number(e.target.value))}
                                    min="1"
                                    max="30"
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
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
