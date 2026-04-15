import { DATA_API } from "@/util/APIs";

const AddSlot = async (data: {
  date: string;
  timeSlot: number[];
  plate: string;
}) => {
  const response = await fetch(`${DATA_API}/api/parking/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

export default AddSlot;