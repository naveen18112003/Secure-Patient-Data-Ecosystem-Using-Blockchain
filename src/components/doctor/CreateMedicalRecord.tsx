import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Patient {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

const CreateMedicalRecord = ({ doctorId }: { doctorId: string }) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    patientId: "",
    recordType: "",
    diagnosis: "",
    recordData: "",
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load patients");
      return;
    }

    setPatients(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("medical_records").insert({
        patient_id: formData.patientId,
        doctor_id: doctorId,
        record_type: formData.recordType,
        diagnosis: formData.diagnosis,
        record_data: JSON.parse(formData.recordData || "{}"),
      });

      if (error) throw error;

      toast.success("Medical record created successfully");
      setFormData({
        patientId: "",
        recordType: "",
        diagnosis: "",
        recordData: "",
      });
    } catch (error: any) {
      toast.error("Failed to create medical record");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-elegant border-border/50">
      <CardHeader>
        <CardTitle>Create Medical Record</CardTitle>
        <CardDescription>Add a new medical record for a patient</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patientId">Patient</Label>
            <Select
              value={formData.patientId}
              onValueChange={(value) => setFormData({ ...formData, patientId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recordType">Record Type</Label>
            <Select
              value={formData.recordType}
              onValueChange={(value) => setFormData({ ...formData, recordType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="lab_result">Lab Result</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
                <SelectItem value="vaccination">Vaccination</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="recordData">Record Data (JSON)</Label>
            <Textarea
              id="recordData"
              value={formData.recordData}
              onChange={(e) => setFormData({ ...formData, recordData: e.target.value })}
              placeholder='{"notes": "Patient doing well", "vitals": {"bp": "120/80"}}'
              rows={4}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Record"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateMedicalRecord;
