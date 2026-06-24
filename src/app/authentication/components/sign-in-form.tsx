"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { signIn } from "@/actions/auth/sign-in";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.email("E-mail inválido!"),
  password: z.string("Senha inválida!").min(8, "Senha inválida!"),
});

type FormValues = z.infer<typeof formSchema>;

const SignInForm = () => {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    const result = await signIn({
      email: values.email,
      password: values.password,
    });

    if (!result.success) {
      toast.error(result.error);
      form.setError("email", { message: result.error });
      form.setError("password", { message: result.error });
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Faça login para continuar.</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite sua senha"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default SignInForm;
