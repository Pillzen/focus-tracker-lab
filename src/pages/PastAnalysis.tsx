
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface Student {
  st_id: string;
  image: string | null;
  attention_percentage: number | null;
  created_at: string;
  user_id: string | null;
}

const PastAnalysis = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
      fetchResults(user.id);
    };
    getUser();
  }, [navigate]);

  const fetchResults = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching results:', error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch analysis results",
      });
    }
  };

  return (
    <div>
      <Navbar email={user?.email || ""} />
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Past Analysis Results</CardTitle>
            <CardDescription>
              View your previous attention analysis results for each student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Card key={student.st_id}>
                  <CardContent className="p-4">
                    {student.image && (
                      <img
                        src={student.image}
                        alt={`Student ${student.st_id}`}
                        className="w-full h-48 object-cover mb-4 rounded-md"
                      />
                    )}
                    <div className="space-y-2">
                      <p className="font-semibold">Student ID: {student.st_id}</p>
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
    </div>
  );
};

export default PastAnalysis;
