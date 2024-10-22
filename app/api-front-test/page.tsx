"use client";

import useFooBarHook from "@/hooks/fooBarHook";
import { useEffect } from "react";

export default function ApiFrontTest() {
  const { fooBarData, fetchData } = useFooBarHook();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>FooBar</h1>
      <button
        style={{ border: "1px solid black", padding: "5px", cursor: "pointer" }}
        onClick={() => window.dispatchEvent(new CustomEvent("refetch-data"))}
      >
        Re-fetch Data
      </button>
      <ul>
        {fooBarData.map((foo, index) => (
          <li key={index}>
            <p>{foo.bar}</p>
            <p>{foo.spam + ""}</p>
            <p>{foo.eggs}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
