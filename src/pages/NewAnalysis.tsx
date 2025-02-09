
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
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

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

      // Simulating analysis results for demonstration
      const mockAnalysis = {
        total_students: Math.floor(Math.random() * 30) + 10,
        average_attention_percentage: Math.floor(Math.random() * 100)
      };

      const { data: analysisData, error: dbError } = await supabase
        .from('video_analysis')
        .insert([{ 
          video_url: publicURL.publicUrl,
          total_students: mockAnalysis.total_students,
          average_attention_percentage: mockAnalysis.average_attention_percentage
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      setAnalysisResult(analysisData);

      toast({
        title: "Success",
        description: "Video uploaded and analyzed successfully!",
      });
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

        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Here are the results of your video analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Total Students</TableHead>
                    <TableHead>Average Attention Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{analysisResult.total_students}</TableCell>
                    <TableCell>{analysisResult.average_attention_percentage}%</TableCell>
                  </TableRow>
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
