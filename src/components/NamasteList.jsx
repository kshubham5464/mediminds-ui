import React, { useEffect, useState } from "react";

const NamasteList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/namaste");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching data:", err); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (!data.length) return <p>No data found. Please upload CSV first.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>NAMASTE Codes</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Term</th>
            <th>Definition</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td>{row.id}</td>
              <td>{row.code}</td>
              <td>{row.term}</td>
              <td>{row.definition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NamasteList;
