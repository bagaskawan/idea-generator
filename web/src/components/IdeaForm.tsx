import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Button } from "@/components/shared/ui/button";
import { Label } from "@/components/shared/ui/label";

interface IdeaFormProps {
  formData: {
    name: string;
    description: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
    }>
  >;
  errors: { [key: string]: string };
  handleSubmit: (e: React.FormEvent) => void;
}

export default function IdeaForm({
  formData,
  setFormData,
  errors,
  handleSubmit,
}: IdeaFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Idea</CardTitle>
        <CardDescription>Capture your next big idea quickly.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Idea Name</Label>
            <Input
              id="name"
              placeholder="e.g. AI-powered To-Do List"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your idea in a few sentences..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={errors.description ? "border-red-500" : ""}
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Add Idea
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
