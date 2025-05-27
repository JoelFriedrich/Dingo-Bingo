
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { PHRASES_STORAGE_KEY } from '@/lib/bingo-utils';
import { useRouter } from 'next/navigation';
import { Save, Settings } from 'lucide-react'; // Added Save icon, using Settings as a generic setup icon

const formSchema = z.object({
  phrases: z.string().min(10, { message: "Please provide a list of phrases." })
    .refine(phrases => phrases.split(',').map(p => p.trim()).filter(p => p.length > 0).length >= 5, {
      message: "Please provide at least 5 comma-separated phrases."
    }),
});

type SetupFormValues = z.infer<typeof formSchema>;

export default function SetupPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phrases: '',
    },
  });

  function onSubmit(values: SetupFormValues) {
    const phrasesArray = values.phrases.split(',').map(p => p.trim()).filter(p => p.length > 0);

    if (phrasesArray.length > 0) {
      localStorage.setItem(PHRASES_STORAGE_KEY, JSON.stringify(phrasesArray));
      toast({
        title: "Phrases Saved!",
        description: "Your custom phrases are now ready for your Bingo game.",
      });
      router.push('/');
    } else {
      toast({
        title: "No Phrases Provided",
        description: "Please enter some phrases to save.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Customize Your Bingo Phrases
          </CardTitle>
          <CardDescription>
            Enter a list of comma-separated words or phrases for your Bingo game.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="phrases"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Your Phrases</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter at least 5 phrases, separated by commas. e.g., Beach, Ice Cream, Sunglasses, Road Trip, Camping"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a comma-separated list of words or short phrases. These will be used to generate your Bingo cards.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
                <Save className="mr-2 h-5 w-5" />
                Save Phrases
              </Button>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
