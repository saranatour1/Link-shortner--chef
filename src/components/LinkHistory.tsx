import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Copy, ExternalLink, Trash2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export function LinkHistory() {
  const links = useQuery(api.links.getUserLinks, {}) || [];
  const deleteLink = useMutation(api.links.deleteLink);

  const copyToClipboard = async (shortCode: string) => {
    try {
      const shortLink = `${window.location.origin}/r/${shortCode}`;
      await navigator.clipboard.writeText(shortLink);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const openOriginalUrl = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (links.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No links created yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Your Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {links.map((link) => (
          <div
            key={link._id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  /{link.shortCode}
                </code>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <BarChart3 className="h-3 w-3" />
                  {link.clicks} clicks
                </div>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {link.originalUrl}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(link.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(link.shortCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openOriginalUrl(link.originalUrl)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  try {
                    await deleteLink({ linkId: link._id });
                    toast.success("Link deleted");
                  } catch (error: any) {
                    toast.error(error.message || "Failed to delete link");
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
