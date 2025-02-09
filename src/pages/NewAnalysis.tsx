
import { useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const NewAnalysis = () => {
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [recentAnalysis, setRecentAnalysis] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch the most recent analysis whenever a new video is uploaded
  const fetchRecentAnalysis = async () => {
    try {
      // First get the most recent video_analysis entry
      const { data: videoData, error: videoError } = await supabase
        .from('video_analysis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (videoError) throw videoError;

      if (videoData) {
        // Then get all students associated with this video
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('st_id, image, attention_percentage')
          .order('created_at', { ascending: false });

        if (studentsError) throw studentsError;
        setRecentAnalysis(studentsData || []);
      }
    } catch (error: any) {
      console.error('Error fetching recent analysis:', error);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      setUploading(true);
      const file = e.dataTransfer.files[0];
      if (!file) return;

      // First, get the current video if any exists
      const { data: existingVideos } = await supabase
        .from('video_analysis')
        .select('video_url')
        .limit(1);

      if (existingVideos && existingVideos.length > 0) {
        const oldVideoUrl = existingVideos[0].video_url;
        const oldFileName = oldVideoUrl.split('/').pop();
        
        if (oldFileName) {
          await supabase.storage
            .from('videos')
            .remove([oldFileName]);

          await supabase
            .from('video_analysis')
            .delete()
            .match({ video_url: oldVideoUrl });
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('videos')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: publicURL } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('video_analysis')
        .insert([{ video_url: publicURL.publicUrl }]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });

      // Fetch the latest analysis after successful upload
      await fetchRecentAnalysis();
    } catch (error: any) {
      console.error('Error uploading video:', error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error uploading video",
      });
    } finally {
      setUploading(false);
    }
  }, [navigate, toast]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div>
      <Navbar email={user?.email || ""} />
      <div className="container mx-auto py-8 px-4 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Video for Analysis</CardTitle>
            <CardDescription>
              Drag and drop your video file here to analyze student attention levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary cursor-pointer"
            >
              {uploading ? (
                <div className="space-y-2">
                  <div className="animate-spin">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Uploading...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Drag and drop your video file here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {recentAnalysis.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Analysis Results</CardTitle>
              <CardDescription>
                Analysis results for the most recently uploaded video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Attention Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAnalysis.map((student) => (
                    <TableRow key={student.st_id}>
                      <TableCell>{student.st_id}</TableCell>
                      <TableCell>
                        {student.image && (
                          <img 
                            src={student.image} 
                            alt={`Student ${student.st_id}`} 
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell>{student.attention_percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewAnalysis;
