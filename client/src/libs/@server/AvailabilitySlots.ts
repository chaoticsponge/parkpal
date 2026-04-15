import { DATA_API } from "@/util/APIs";

const AvailabilitySlots = async (data: {
  date: string;
  plate: string;
}) => {
  const response = await fetch(`${DATA_API}/api/parking/slots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

export default AvailabilitySlots;