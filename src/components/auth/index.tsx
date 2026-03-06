"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, ArrowRight, UserPlus } from "lucide-react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", flow);
    void signIn("password", formData).catch((error) => {
      const toastTitle = error.message.includes("Invalid password")
        ? "Invalid password. Please try again."
        : flow === "signIn"
          ? "Could not sign in, did you mean to sign up?"
          : "Could not sign up, did you mean to sign in?";
      toast.error(toastTitle);
      setSubmitting(false);
    });
  }

  return (
    <div className="w-full space-y-6">
      <form
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <div className="space-y-3">
          <Input
            className="h-12 bg-secondary border-border text-foreground
              placeholder:text-muted-foreground focus-visible:ring-primary/50
              focus-visible:border-primary"
            type="email"
            name="email"
            placeholder="Email address"
            required
          />
          <Input
            className="h-12 bg-secondary border-border text-foreground
              placeholder:text-muted-foreground focus-visible:ring-primary/50
              focus-visible:border-primary"
            type="password"
            name="password"
            placeholder="Password"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-12 font-display font-semibold text-sm
            transition-all duration-300"
        >
          {flow === "signIn" ? (
            <>
              Sign in <ArrowRight className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              Create account <UserPlus className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {flow === "signIn"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            type="button"
            className="text-primary hover:text-primary/80 font-medium
              transition-colors underline-offset-4 hover:underline"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </form>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          or
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        variant="outline"
        className="w-full h-12 font-display font-medium text-sm
          border-border hover:bg-accent
          transition-all duration-300"
        onClick={() => void signIn("anonymous")}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Continue as guest
      </Button>
    </div>
  );
}
