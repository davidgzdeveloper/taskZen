"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

function GoogleIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>Google</title>
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.98-4.66 1.98-3.55 0-6.43-2.91-6.43-6.49S7.93 5.51 11.48 5.51c1.91 0 3.3.79 4.07 1.52l2.36-2.36C16.32 3.24 14.16 2 11.48 2 6.45 2 2.73 5.61 2.73 10.63s3.72 8.63 8.75 8.63c2.63 0 4.87-.88 6.48-2.55s2.4-3.99 2.4-6.68c0-.6-.05-1.19-.15-1.73H12.48z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function SignupPage() {
  const { signUp, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account.",
      });
      router.push('/login');
    }
    
    setIsLoading(false);
  };
  
  const totalLoading = isLoading || loading;

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Create an account to start managing your tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={totalLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={totalLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={totalLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={totalLoading}>
              {totalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            <Separator className="my-2" />
            <Button variant="outline" className="w-full" type="button" disabled={totalLoading}>
              <GoogleIcon />
              Sign up with Google
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
