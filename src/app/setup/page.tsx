"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { filterInappropriatePhrases } from '@/ai/flows/filter-inappropriate-phrases';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { PHRASES_STORAGE_KEY } from '@/lib/bingo-utils';
import { useRouter } from 'next/navigation';
import { Loader2, Wand2, ListChecks, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  theme: z.string().min(3, { message: "Theme must be at least 3 characters long." }).max(50),
  phrases: z.string().min(10, { message: "Please provide a list of phrases." })
    .refine(phrases => phrases.split(',').map(p => p.trim()).filter(p => p.length > 0).length >= 5, {
      message: "Please provide at least 5 comma-separated phrases."
    }),
});

type SetupFormValues = z.infer<typeof formSchema>;

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [relevantPhrases, setRelevantPhrases] = useState<string[]>([]);
  const [inappropriatePhrases, setInappropriatePhrases] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: '',
      phrases: '',
    },
  });

  async function onSubmit(values: SetupFormValues) {
    setIsLoading(true);
    setError(null);
    setRelevantPhrases([]);
    setInappropriatePhrases([]);

    const phrasesArray = values.phrases.split(',').map(p => p.trim()).filter(p => p.length > 0);

    try {
      const result = await filterInappropriatePhrases({
        theme: values.theme,
        phrases: phrasesArray,
      });
      setRelevantPhrases(result.relevantPhrases);
      setInappropriatePhrases(result.inappropriatePhrases);
      toast({
        title: "Phrases Filtered!",
        description: `${result.relevantPhrases.length} relevant phrases found.`,
        variant: "default",
      });
    } catch (e) {
      console.error("AI filtering error:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during AI filtering.";
      setError(errorMessage);
      toast({
        title: "Filtering Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleUsePhrases() {
    if (relevantPhrases.length > 0) {
      localStorage.setItem(PHRASES_STORAGE_KEY, JSON.stringify(relevantPhrases));
      toast({
        title: "Phrases Saved!",
        description: "Your custom phrases are now ready for your Bingo game.",
      });
      router.push('/');
    } else {
      toast({
        title: "No Relevant Phrases",
        description: "Cannot save as there are no relevant phrases. Please refine your input.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Wand2 className="h-8 w-8 text-primary" />
            Customize Your Bingo Phrases
          </CardTitle>
          <CardDescription>
            Enter a theme and a list of comma-separated words or phrases. Our AI will help filter them for relevance and appropriateness for your Bingo game!
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Bingo Theme</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Summer Vacation, Movie Genres, Office Lingo" {...field} />
                    </FormControl>
                    <FormDescription>
                      What's the central theme for your Bingo game?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      Provide a comma-separated list of words or short phrases.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Filtering Phrases...
                  </>
                ) : (
                  <>
                    <ListChecks className="mr-2 h-5 w-5" />
                    Filter Phrases with AI
                  </>
                )}
              </Button>
            </CardContent>
          </form>
        </Form>
        {error && (
          <CardFooter className="flex-col items-start pt-4">
            <div className="bg-destructive/10 text-destructive p-4 rounded-md w-full">
              <h3 className="font-semibold flex items-center gap-2"><AlertTriangle />Error Filtering Phrases</h3>
              <p>{error}</p>
            </div>
          </CardFooter>
        )}
        {(relevantPhrases.length > 0 || inappropriatePhrases.length > 0) && !isLoading && (
          <CardFooter className="flex-col items-start pt-6 gap-6">
            {relevantPhrases.length > 0 && (
              <div className="w-full">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-green-600">
                  <CheckCircle2 /> Relevant Phrases ({relevantPhrases.length})
                </h3>
                <ScrollArea className="h-48 w-full rounded-md border p-3 bg-green-50">
                  <ul className="list-disc list-inside space-y-1">
                    {relevantPhrases.map((phrase, index) => (
                      <li key={`relevant-${index}`} className="text-sm">{phrase}</li>
                    ))}
                  </ul>
                </ScrollArea>
                 <Button onClick={handleUsePhrases} className="mt-4 w-full bg-primary hover:bg-primary/90">
                  Use These Relevant Phrases for Bingo
                </Button>
              </div>
            )}
            {inappropriatePhrases.length > 0 && (
               <div className="w-full">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-amber-600">
                  <AlertTriangle /> Potentially Inappropriate or Irrelevant ({inappropriatePhrases.length})
                </h3>
                <ScrollArea className="h-40 w-full rounded-md border p-3 bg-amber-50">
                  <ul className="list-disc list-inside space-y-1">
                    {inappropriatePhrases.map((phrase, index) => (
                      <li key={`inappropriate-${index}`} className="text-sm">{phrase}</li>
                    ))}
                  </ul>
                </ScrollArea>
                <p className="text-xs text-muted-foreground mt-2">These phrases were flagged by the AI as potentially unsuitable for the theme or general audience.</p>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
