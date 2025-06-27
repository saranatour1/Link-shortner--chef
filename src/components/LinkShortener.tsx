import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Copy, Link, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LinkShortener() {
  const [url, setUrl] = useState("");
  const [shortLink, setShortLink] = useState("");

  const createShortLink = useMutation(api.links.createShortLink);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    try {
      const data = await createShortLink({ originalUrl: url.trim() });
      const fullShortLink = `${window.location.origin}/r/${data.shortCode}`;
      setShortLink(fullShortLink);
      setUrl("");
      toast.success("Short link created!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create short link");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortLink);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Link className="h-5 w-5" />
          Link Shortener
        </CardTitle>
        <CardDescription>
          Transform long URLs into short, shareable links
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="url"
            placeholder="Enter your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={false}
          />
          <Button 
            type="submit" 
            className="w-full"
            disabled={!url.trim()}
          >
            Shorten URL
          </Button>
        </form>

        {shortLink && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Your short link:</label>
            <div className="flex gap-2">
              <Input
                value={shortLink}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
