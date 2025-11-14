import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface PatientData {
  profile: any;
  medicalRecords?: any[];
  prescriptions?: any[];
  medications?: any[];
}

const PatientDataDisplay = ({
  patientId,
  accessLevel,
}: {
  patientId: string;
  accessLevel: string;
}) => {
  const [data, setData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", patientId)
        .single();

      if (profileError) throw profileError;

      const patientData: PatientData = { profile };

      if (accessLevel === "full" || accessLevel === "medical") {
        const { data: records } = await supabase
          .from("medical_records")
          .select("*")
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false });
        patientData.medicalRecords = records || [];

        const { data: prescriptions } = await supabase
          .from("prescriptions")
          .select("*")
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false });
        patientData.prescriptions = prescriptions || [];

        const { data: medications } = await supabase
          .from("medications")
          .select("*")
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false });
        patientData.medications = medications || [];
      }

      setData(patientData);
    } catch (error: any) {
      toast.error("Failed to load patient data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading patient data...</div>;
  if (!data) return <div className="text-center p-8">No data found</div>;

  return (
    <div className="space-y-6">
      <Card className="shadow-elegant border-border/50">
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>
            Access Level: <Badge>{accessLevel}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {data.profile.first_name} {data.profile.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Blood Type</p>
              <p className="font-medium">{data.profile.blood_type || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{data.profile.date_of_birth || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{data.profile.phone || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {(accessLevel === "full" || accessLevel === "medical") && (
        <>
          <Card className="shadow-elegant border-border/50">
            <CardHeader>
              <CardTitle>Recent Medical Records</CardTitle>
            </CardHeader>
            <CardContent>
              {data.medicalRecords?.length === 0 ? (
                <p className="text-muted-foreground">No medical records found</p>
              ) : (
                <div className="space-y-3">
                  {data.medicalRecords?.map((record, idx) => (
                    <div key={record.id}>
                      {idx > 0 && <Separator className="my-3" />}
                      <div>
                        <p className="font-medium">{record.record_type}</p>
                        <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(record.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50">
            <CardHeader>
              <CardTitle>Active Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {data.prescriptions?.length === 0 ? (
                <p className="text-muted-foreground">No prescriptions found</p>
              ) : (
                <div className="space-y-3">
                  {data.prescriptions?.map((prescription, idx) => (
                    <div key={prescription.id}>
                      {idx > 0 && <Separator className="my-3" />}
                      <div>
                        <p className="font-medium">{prescription.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                        <Badge variant="outline" className="mt-2">
                          {prescription.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default PatientDataDisplay;
