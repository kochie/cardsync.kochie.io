"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox, CheckboxField } from "@/components/ui/checkbox"
import { AuthLayout } from "@/components/ui/auth-layout"
import { Heading } from "@/components/ui/heading"
import { Field, Label } from "@/components/ui/fieldset"
import { Strong, Text, TextLink } from "@/components/ui/text"
import { loginAction } from "@/actions/auth/login"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)


  return (
    <AuthLayout>
      <form action={loginAction} className="grid w-full max-w-sm grid-cols-1 gap-8">
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
        <Button type="submit" className="w-full" >
          Login
        </Button>
        <Text>
          Don’t have an account?{' '}
          <TextLink href="/auth/signup">
            <Strong>Sign up</Strong>
          </TextLink>
        </Text>
      </form>
    </AuthLayout>
  )
}
