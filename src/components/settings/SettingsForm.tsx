
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { requestNotificationPermission } from "@/lib/alarm";

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
        
        try {
            const result = await updateUserPreferences({
                pomodoroWork,
                pomodoroBreak,
                notifications,
                theme: theme.toUpperCase() as 'LIGHT' | 'DARK',
            });

            if (result.error) {
                toast({
                    title: "No se guardaron los ajustes",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Ajustes guardados",
                });
            }
        } catch (err) {
            toast({
                title: "No se guardaron los ajustes",
                description: "El servidor no respondió. Comprueba tu conexión e inténtalo de nuevo.",
                variant: "destructive",
            });
        }
        
        setIsLoading(false);
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
        <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Temporizador</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="work-duration">Sesión de foco (minutos)</Label>
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
                                <Label htmlFor="break-duration">Descanso (minutos)</Label>
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
                         <h2 className="text-xl font-semibold">Apariencia y avisos</h2>
                        <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
                            <div>
                                <Label htmlFor="notifications">Avisos</Label>
                                <p className="text-sm text-muted-foreground">
                                    Notificación del sistema al terminar una sesión si estás en otra pestaña o ventana.
                                </p>
                            </div>
                            <Switch 
                                id="notifications"
                                checked={notifications}
                                onCheckedChange={(checked) => {
                                    setNotifications(checked);
                                    if (checked) requestNotificationPermission();
                                }}
                                disabled={isLoading}
                            />
                        </div>
                         <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
                             <div>
                                <Label htmlFor="theme">Modo oscuro</Label>
                                <p className="text-sm text-muted-foreground">
                                    Fondo azul noche, más cómodo con poca luz.
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

                    <div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar ajustes
                        </Button>
                    </div>
                </form>
        </div>
    );
}
