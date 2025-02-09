
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

const PastAnalysis = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    fetchResults();
  }, []);

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

  return (
    <div>
      <Navbar email={user?.email || ""} />
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Past Analysis Results</CardTitle>
            <CardDescription>
              View previous attention analysis results for each student
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
