
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { Save, Settings, Copy, Wand2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { generateBingoPhrases } from '@/ai/flows/generate-bingo-phrases-flow';

const formSchema = z.object({
  phrases: z.string().min(10, { message: "Please provide a list of phrases." })
    .refine(phrases => phrases.split(',').map(p => p.trim()).filter(p => p.length > 0).length >= 5, {
      message: "Please provide at least 5 comma-separated phrases."
    }),
  aiPrompt: z.string().optional(),
});

type SetupFormValues = z.infer<typeof formSchema>;

export default function SetupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const [isGeneratingPhrases, setIsGeneratingPhrases] = useState(false);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phrases: '',
      aiPrompt: '',
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

  const generateShareableUrl = useCallback((phrasesArray: string[]) => {
    if (phrasesArray.length > 0) {
      const phrasesForUrl = phrasesArray.join(';;;');
      const encodedPhrases = encodeURIComponent(phrasesForUrl);
      if (typeof window !== "undefined") {
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/?phrases=${encodedPhrases}`;
        setShareableUrl(url);
      }
    } else {
      setShareableUrl(null);
    }
  }, []);

  function onSubmit(values: SetupFormValues) {
    const phrasesArray = values.phrases.split(',').map(p => p.trim()).filter(p => p.length > 0);

    if (phrasesArray.length > 0) {
      localStorage.setItem(PHRASES_STORAGE_KEY, JSON.stringify(phrasesArray));
      toast({
        title: "Phrases Saved!",
        description: "Your custom phrases are now ready for your Bingo game.",
      });
      generateShareableUrl(phrasesArray);
    } else {
      setShareableUrl(null);
      toast({
        title: "No Phrases Provided",
        description: "Please enter some phrases to save.",
        variant: "destructive",
      });
    }
  }

  const handleGenerateWithAI = async () => {
    const aiPrompt = form.getValues('aiPrompt');
    if (!aiPrompt || aiPrompt.trim() === '') {
      toast({
        title: 'AI Prompt Required',
        description: 'Please enter a theme or prompt for the AI.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingPhrases(true);
    try {
      const result = await generateBingoPhrases({ theme: aiPrompt, count: 25 });
      if (result.phrases && result.phrases.length > 0) {
        const currentPhrases = form.getValues('phrases').split(',').map(p => p.trim()).filter(p => p.length > 0);
        const newPhrases = result.phrases.filter(p => !currentPhrases.includes(p)); // Avoid duplicates
        const combinedPhrases = [...currentPhrases, ...newPhrases];
        
        form.setValue('phrases', combinedPhrases.join(', '));
        toast({
          title: 'AI Phrases Generated!',
          description: `${newPhrases.length} new phrases added to your list. Review and save.`,
        });
        // Update shareable URL if phrases were already saved
        if (localStorage.getItem(PHRASES_STORAGE_KEY)) {
            generateShareableUrl(combinedPhrases);
        }

      } else {
        toast({
          title: 'AI Generation Note',
          description: 'The AI did not return any new phrases for this prompt.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error generating AI phrases:', error);
      toast({
        title: 'AI Generation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred. Check your API key and console.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPhrases(false);
    }
  };

  const handleCopyUrl = () => {
    if (shareableUrl && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareableUrl).then(() => {
        toast({ title: "URL Copied!", description: "Shareable URL copied to clipboard." });
      }).catch(err => {
        toast({ title: "Copy Failed", description: "Could not copy URL.", variant: "destructive" });
        console.error('Failed to copy URL: ', err);
      });
    } else if (shareableUrl) {
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
            Enter a list of comma-separated words or phrases for your Bingo game, or use AI to generate them based on a theme.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              
              {/* AI Phrase Generation Section */}
              <div className="space-y-4 p-4 border rounded-md bg-card-foreground/5">
                <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                  <Wand2 className="h-6 w-6" />
                  AI Phrase Generation
                </h3>
                <FormField
                  control={form.control}
                  name="aiPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme or Prompt</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Summer Vacation, Office Jokes, Fantasy Creatures" 
                          {...field} 
                          disabled={isGeneratingPhrases}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a theme, and the AI will suggest bingo phrases for you.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="button" 
                  onClick={handleGenerateWithAI} 
                  disabled={isGeneratingPhrases || !form.watch('aiPrompt')?.trim()}
                  variant="outline"
                  className="w-full"
                >
                  {isGeneratingPhrases ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Phrases with AI
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              {/* Manual Phrase Input Section */}
              <FormField
                control={form.control}
                name="phrases"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Your Bingo Phrases List</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter at least 5 phrases, separated by commas. e.g., Beach, Ice Cream, Sunglasses, Road Trip, Camping"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a comma-separated list of words or short phrases. These will be used to generate your Bingo cards.
                      AI-generated phrases will be added here for you to review.
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
