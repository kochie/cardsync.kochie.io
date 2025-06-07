"use client"

import type React from "react"

import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox, CheckboxField } from "@/components/ui/checkbox"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation"
import { app } from "@/firebase"
import { AuthLayout } from "@/components/ui/auth-layout"
import { Heading } from "@/components/ui/heading"
import { Field, Label } from "@/components/ui/fieldset"
import { Strong, Text, TextLink } from "@/components/ui/text"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const [, setError] = useState("");

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(
        getAuth(app),
        email,
        password
      );
      const idToken = await credential.user.getIdToken();

      await fetch("/api/login", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      router.push("/dashboard");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleLogin} action="#" method="POST" className="grid w-full max-w-sm grid-cols-1 gap-8">
        {/* <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" /> */}
        <Heading>Sign in to your account</Heading>
        <Field>
          <Label>Email</Label>
          <Input type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} />
        </Field>
        <Field>
          <Label>Password</Label>
          <Input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)}/>
        </Field>
        <div className="flex items-center justify-between">
          <CheckboxField>
            <Checkbox name="remember" value={String(rememberMe)} onChange={setRememberMe}/>
            <Label>Remember me</Label>
          </CheckboxField>
          <Text>
            <TextLink href="#">
              <Strong>Forgot password?</Strong>
            </TextLink>
          </Text>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          Login
        </Button>
        <Text>
          Don’t have an account?{' '}
          <TextLink href="#">
            <Strong>Sign up</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  )
}
