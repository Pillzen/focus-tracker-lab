
import { useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Upload, AlertCircle } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const NewAnalysis = () => {
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [recentAnalysis, setRecentAnalysis] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const fetchRecentAnalysis = async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('st_id, image, attention_percentage, created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      if (studentsError) throw studentsError;
      setRecentAnalysis(studentsData || []);
    } catch (error: any) {
      console.error('Error fetching recent analysis:', error);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      setUploading(true);
      setUploadProgress(0);
      const file = e.dataTransfer.files[0];
      if (!file) return;

      // Simulated progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: existingVideos } = await supabase
        .from('video_analysis')
        .select('video_url')
        .eq('user_id', user.id)
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
            .match({ video_url: oldVideoUrl, user_id: user.id });
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
        .insert([{ 
          video_url: publicURL.publicUrl,
          user_id: user.id 
        }]);

      if (dbError) throw dbError;

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });

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
    <div className="min-h-screen bg-background">
      <Navbar email={user?.email || ""} />
      <div className="container mx-auto py-8 px-4 space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Upload Video for Analysis</CardTitle>
            <CardDescription>
              Drag and drop your video file here to analyze student attention levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary cursor-pointer transition-all duration-200 hover:bg-accent"
            >
              {uploading ? (
                <div className="space-y-4">
                  <div className="animate-spin">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Uploading...</p>
                  <Progress value={uploadProgress} className="w-[60%] mx-auto" />
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
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Only video files are supported. Maximum file size: 100MB
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {recentAnalysis.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Recent Analysis Results
                <Badge variant="secondary">Latest</Badge>
              </CardTitle>
              <CardDescription>
                Analysis results for the most recently uploaded video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded-md border">
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
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.attention_percentage > 70 ? "default" : "destructive"}>
                            {student.attention_percentage}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewAnalysis;
