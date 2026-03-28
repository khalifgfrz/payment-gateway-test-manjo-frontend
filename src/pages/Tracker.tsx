import { useState } from "react";

interface Transaction {
  merchant_id: string;
  amount: number;
  trx_id: string;
  partner_reference_no: string;
  reference_no: string;
  status: string;
  transaction_date: string;
  paid_date: string;
}

export default function Tracker() {
  const [referenceNo, setReferenceNo] = useState<string>("");
  const [result, setResult] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`http://localhost:8080/api/v1/qr/status/${referenceNo}`);

      if (res.status === 404) throw new Error("NOT_FOUND");

      const data: Transaction = await res.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === "NOT_FOUND") {
          setError("Transaksi Tidak Ditemukan");
        } else {
          setError(err.message);
        }
      } else {
        setError("Terjadi kesalahan");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Merchant Status Tracker</h2>

      <div className="flex gap-2 max-w-md">
        <input placeholder="Reference Number" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} className="input w-full" />
        <button onClick={handleSearch} className="btn">
          Search
        </button>
      </div>

      {loading && <p className="mt-4 animate-pulse">Loading...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Transaction Detail</h3>

          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="flex justify-between border-b py-1">
              <span className="text-gray-600">{key}</span>
              <span className={key === "status" ? (value === "SUCCESS" ? "text-green-600 font-bold" : value === "PENDING" ? "text-yellow-600 font-bold" : "text-red-600 font-bold") : ""}>{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
