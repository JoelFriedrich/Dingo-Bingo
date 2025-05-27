
"use client";

import React, { useState, useEffect } from 'react';
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
import { Save, Settings, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phrases: '',
    },
  });

  useEffect(() => {
    const storedPhrases = localStorage.getItem(PHRASES_STORAGE_KEY);
    if (storedPhrases) {
      try {
        const parsedPhrases: string[] = JSON.parse(storedPhrases);
        if (Array.isArray(parsedPhrases) && parsedPhrases.length > 0) {
          form.setValue('phrases', parsedPhrases.join(', '));
        }
      } catch (error) {
        console.error("Failed to parse stored phrases for form init", error);
      }
    }
  }, [form]);

  function onSubmit(values: SetupFormValues) {
    const phrasesArray = values.phrases.split(',').map(p => p.trim()).filter(p => p.length > 0);

    if (phrasesArray.length > 0) {
      localStorage.setItem(PHRASES_STORAGE_KEY, JSON.stringify(phrasesArray));
      toast({
        title: "Phrases Saved!",
        description: "Your custom phrases are now ready for your Bingo game.",
      });

      // Generate shareable URL
      const phrasesForUrl = phrasesArray.join(';;;'); // Using ';;;' as a robust separator
      const encodedPhrases = encodeURIComponent(phrasesForUrl);
      
      // Ensure window is defined (runs on client)
      if (typeof window !== "undefined") {
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/?phrases=${encodedPhrases}`;
        setShareableUrl(url);
      }
      // router.push('/'); // Optionally keep user on setup page to see/copy the shareable URL
    } else {
      setShareableUrl(null);
      toast({
        title: "No Phrases Provided",
        description: "Please enter some phrases to save.",
        variant: "destructive",
      });
    }
  }

  const handleCopyUrl = () => {
    if (shareableUrl && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl).then(() => {
        toast({ title: "URL Copied!", description: "Shareable URL copied to clipboard." });
      }).catch(err => {
        toast({ title: "Copy Failed", description: "Could not copy URL.", variant: "destructive" });
        console.error('Failed to copy URL: ', err);
      });
    } else if (shareableUrl) {
        // Fallback for older browsers or non-secure contexts if needed, though less common now
        const textArea = document.createElement("textarea");
        textArea.value = shareableUrl;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            toast({ title: "URL Copied!", description: "Shareable URL copied to clipboard." });
        } catch (err) {
            toast({ title: "Copy Failed", description: "Could not copy URL.", variant: "destructive" });
            console.error('Failed to copy URL with execCommand: ', err);
        }
        document.body.removeChild(textArea);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Customize Your Bingo Phrases
          </CardTitle>
          <CardDescription>
            Enter a list of comma-separated words or phrases for your Bingo game. These will be saved to your browser.
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
                Save Phrases & Get Share Link
              </Button>
            </CardContent>
          </form>
        </Form>
        {shareableUrl && (
          <CardFooter className="flex-col items-start gap-2 pt-4 border-t mt-6">
            <h3 className="text-lg font-semibold text-primary">Share Your Custom Phrases!</h3>
            <p className="text-sm text-muted-foreground">
              Copy and send this URL to others. When they open it, your phrases will be loaded for their game.
            </p>
            <div className="flex w-full items-center gap-2 mt-2">
              <Input readOnly value={shareableUrl} className="flex-grow bg-muted/50" aria-label="Shareable URL" />
              <Button onClick={handleCopyUrl} variant="outline" size="icon" aria-label="Copy URL">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Note: Very long phrase lists can result in a very long URL.
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
