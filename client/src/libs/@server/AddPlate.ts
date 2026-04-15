import { DATA_API } from "@/util/APIs";

const AddPlate = async (data: {
  walletAddress: string;
  plate: string;
}) => {
  const response = await fetch(`${DATA_API}/api/user/add-plate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

export default AddPlate;