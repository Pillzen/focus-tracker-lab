import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  fullName: z.string().optional(),
  institution: z.string().optional(),
  profilePicture: z.instanceof(File).optional(),
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      fullName: "",
      institution: "",
      profilePicture: undefined,
    },
    mode: "onSubmit",
  });

  const toggleSignUp = () => {
    form.reset();
    setPreviewImage(null);
    setIsSignUp(!isSignUp);
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('profilePicture', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmailAuth = async (values: {
    email: string;
    password: string;
    username?: string;
    fullName?: string;
    institution?: string;
    profilePicture?: File;
  }) => {
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              username: values.username,
              full_name: values.fullName,
              institution: values.institution,
            },
          },
        });

        if (authError) throw authError;

        if (values.profilePicture) {
          const fileExt = values.profilePicture.name.split('.').pop();
          const fileName = `${authData.user?.id}/profile.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, values.profilePicture);

          if (uploadError) {
            console.error('Profile picture upload error:', uploadError);
            toast({
              variant: "destructive",
              title: "Profile Picture Upload Failed",
              description: uploadError.message,
            });
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);

            await supabase
              .from('profiles')
              .update({ profile_picture: publicUrl })
              .eq('id', authData.user?.id);
          }
        }

        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth',
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Google Sign In Error",
          description: error.message,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>{isSignUp ? "Create Account" : "Sign In"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Create a new account to get started" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailAuth)} className="space-y-4">
              {isSignUp && (
                <FormItem className="flex flex-col items-center space-y-2">
                  <FormLabel>Profile Picture (Optional)</FormLabel>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="profilePicture"
                    onChange={handleProfilePictureChange}
                  />
                  <Label 
                    htmlFor="profilePicture" 
                    className="cursor-pointer"
                  >
                    <Avatar className="w-24 h-24">
                      <AvatarImage 
                        src={previewImage || undefined} 
                        alt="Profile Picture Preview" 
                      />
                      <AvatarFallback>
                        {previewImage ? "Change" : "Upload"}
                      </AvatarFallback>
                    </Avatar>
                  </Label>
                </FormItem>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isSignUp && (
                <>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="yourusername" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="institution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your School or Organization" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleAuth}
              type="button"
            >
              Continue with Google
            </Button>
          </div>

          <p className="text-center mt-4">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={toggleSignUp}
              className="text-blue-500 hover:underline"
              type="button"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
