import { DATA_API } from "@/util/APIs";

const DeletePlate = async (data: {
  walletAddress: string;
  plate: string;
}) => {
  const response = await fetch(`${DATA_API}/api/user/delete-plate`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

export default DeletePlate;