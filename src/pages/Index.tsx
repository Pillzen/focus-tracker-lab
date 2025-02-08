
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [uploading, setUploading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // First, get the current video if any exists
      const { data: existingVideos } = await supabase
        .from('video_analysis')
        .select('video_url')
        .limit(1);

      if (existingVideos && existingVideos.length > 0) {
        // Extract filename from the URL
        const oldVideoUrl = existingVideos[0].video_url;
        const oldFileName = oldVideoUrl.split('/').pop();
        
        if (oldFileName) {
          // Delete old video from storage
          await supabase.storage
            .from('videos')
            .remove([oldFileName]);

          // Delete old video entry from database
          await supabase
            .from('video_analysis')
            .delete()
            .match({ video_url: oldVideoUrl });
        }
      }

      // Upload new video to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('videos')
        .upload(fileName, file);

      if (storageError) throw storageError;

      // Get public URL
      const { data: publicURL } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      // Create new video analysis entry
      const { error: dbError } = await supabase
        .from('video_analysis')
        .insert([{ video_url: publicURL.publicUrl }]);

      if (dbError) throw dbError;

      alert('Video uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading video:', error.message);
      alert('Error uploading video');
    } finally {
      setUploading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching results:', error.message);
    }
  };

  // Fetch results when component mounts
  useState(() => {
    fetchResults();
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Classroom Attention Analysis</h1>

      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload Video for Analysis</CardTitle>
          <CardDescription>
            Upload a video file to analyze student attention levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="video">Video File</Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
            {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>
            View attention analysis results for each student
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-4">
                  {student.image && (
                    <img
                      src={student.image}
                      alt={`Student ${student.id}`}
                      className="w-full h-48 object-cover mb-4 rounded-md"
                    />
                  )}
                  <div className="space-y-2">
                    <p className="font-semibold">Student ID: {student.id}</p>
                    <p>
                      Attention: {student.attention_percentage?.toFixed(2)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(student.created_at).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
