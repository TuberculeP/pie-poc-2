import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { Foo } from "@/types/fooBar";

const useFooBarHook = () => {
  const [fooBarData, setData] = useState<Foo[]>([]);

  const fetchData = async () => {
    const data = await apiClient.getRequest<Foo[]>("/api/foo-bar");
    setData(data);
  };

  useEffect(() => {
    // Abonnement à l'événement personnalisé 'refetch-data'
    const handleRefetch = () => {
      fetchData();
    };

    window.addEventListener("refetch-data", handleRefetch);

    // Cleanup lors du démontage du composant
    return () => {
      window.removeEventListener("refetch-data", handleRefetch);
    };
  }, []); // L'effet ne s'exécute qu'au montage/démontage

  return { fooBarData, fetchData };
};

export default useFooBarHook;
