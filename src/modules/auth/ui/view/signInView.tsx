"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { OctagonAlertIcon } from "lucide-react";
import { Link } from "next-view-transitions";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function SignInView() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);
    await authClient.signIn.email(
      { email: data.email, password: data.password, callbackURL: "/" },
      {
        onSuccess: () => {
          setPending(false);
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error?.message ?? "Unexpected error");
          if (error?.status === 403) {
            setError("Please verify your email address");
          }
        },
      }
    );
  };
  const onSocial = async (provider: "github" | "google") => {
    setError(null);
    setPending(true);
    await authClient.signIn.social(
      {
        provider: provider,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
          router.push("/");
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error?.message ?? "Unexpected error");
        },
      }
    );
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              action=""
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 md:p-8 bg-primary/80"
            >
              <div className="flex flex-col gap-6 ">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold text-white">
                    Welcome Back!
                  </h1>
                  <p className=" text-balance text-white">
                    Login to your account
                  </p>
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="m@example.com"
                            {...field}
                            className="bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="*********"
                            type="password"
                            {...field}
                            className="bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ✅ رابط Forgot Password */}
                  <div className="flex justify-end">
                    <Link
                      href="/request-password-reset"
                      className="text-white text-sm underline hover:text-gray-200 transition"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 text-destructive!" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <Button
                  disabled={pending}
                  type="submit"
                  className="w-full bg-primary text-white font-bold"
                >
                  {pending ? <Spinner /> : <div>Sign In</div>}
                </Button>
                <span className="text-white text-center">Or Continue with</span>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => onSocial("google")}
                    variant={"outline"}
                    type="button"
                    className="w-full"
                  >
                    <FaGoogle />
                    Google
                  </Button>
                  <Button
                    onClick={() => onSocial("github")}
                    variant={"outline"}
                    type="button"
                    className="w-full"
                  >
                    <FaGithub />
                    Github
                  </Button>
                </div>
                <div className="text-center text-white">
                  {" "}
                  Don&apos;t have an account ?{" "}
                  <Link href="/sign-up" className="underline">
                    Sign Up
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          <div className=" relative hidden md:flex flex-col gap-y-4 items-center justify-center py-20">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={200}
              height={200}
              className="w-[200px] h-[250px]"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 hoverEffect">
        By clicking continue, you agree to your{" "}
        <a href="#">Terms of Services</a> and <a href="#">Privecy Policy</a>
      </div>
    </div>
  );
}
