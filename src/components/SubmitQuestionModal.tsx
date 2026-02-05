import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function SubmitQuestionModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const supabase = await getSupabase();
      const { error: insertError } = await supabase
        .from("submitted_questions")
        .insert({
          name,
          github_username: githubUsername,
          question,
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setName("");
      setGithubUsername("");
      setQuestion("");
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit question");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(null); setSuccess(false); }}>
      <DialogTrigger asChild>
        <Button>Submit a Question</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit a Question</DialogTitle>
          <DialogDescription>
            Suggest a question for a future poll.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <p className="text-sm text-green-600">Question submitted!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sq-name">Name</Label>
              <Input
                id="sq-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sq-github">GitHub Username</Label>
              <Input
                id="sq-github"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sq-question">Question</Label>
              <Textarea
                id="sq-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
