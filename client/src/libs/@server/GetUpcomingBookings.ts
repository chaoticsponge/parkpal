import { DATA_API } from "@/util/APIs";

const GetUpcomingBookings = async (data: {
  plates: string[];
}) => {
  const response = await fetch(`${DATA_API}/api/parking/upcoming`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

export default GetUpcomingBookings;
