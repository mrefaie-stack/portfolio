"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/dashboard/actions";
import { SubmitButton } from "./SubmitButton";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<ActionState, FormData>(loginAction, {});
  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="password" className="label">
          كلمة المرور
        </label>
        <input id="password" name="password" type="password" required autoFocus autoComplete="current-password" className="field" dir="ltr" />
      </div>
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{state.error}</p>}
      <SubmitButton className="w-full">دخول</SubmitButton>
    </form>
  );
}
