import { useState } from "react";

interface Transaction {
  id?: string;
  merchant_id: string;
  amount: number;
  trx_id: string;
  partner_reference_no?: string;
  reference_no: string;
  status: string;
  transaction_date: string;
  paid_date?:
    | {
        String?: string;
        Valid?: boolean;
      }
    | string;
}

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return "text-green-600 bg-green-50";
    case "PENDING":
      return "text-yellow-600 bg-yellow-50";
    case "FAILED":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

const getStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Tracker() {
  const [referenceNo, setReferenceNo] = useState<string>("");
  const [result, setResult] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSearch = async () => {
    if (!referenceNo.trim()) {
      setError("Masukkan nomor referensi");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`http://localhost:8080/api/v1/tracker/${referenceNo}`);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: Transaction = await res.json();

      if (!data) {
        setError("Transaksi Tidak Ditemukan");
        return;
      }

      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Cari Transaksi</h2>
        <p className="text-slate-600">Masukkan nomor referensi untuk melihat status transaksi Anda</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex gap-2">
          <input placeholder="Nomor Referensi" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} onKeyPress={handleKeyPress} className="input flex-1" />
          <button onClick={handleSearch} disabled={loading} className="btn">
            {loading ? "Mencari..." : "Cari"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card p-8 text-center">
          <div className="inline-block animate-spin text-blue-600 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-slate-600">Memproses...</p>
        </div>
      )}

      {error && (
        <div className="card p-4 bg-red-50 border border-red-200 mb-6">
          <p className="text-red-700 font-medium">⚠️ {error}</p>
        </div>
      )}

      {result && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Detail Transaksi</h3>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(result.status)}`}>{result.status}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Reference No", key: "reference_no" },
              { label: "Merchant ID", key: "merchant_id" },
              { label: "Amount", key: "amount" },
              { label: "Transaction ID", key: "trx_id" },
              { label: "Partner Ref", key: "partner_reference_no" },
              { label: "Status", key: "status" },
              { label: "Transaction Date", key: "transaction_date" },
              { label: "Paid Date", key: "paid_date" },
            ].map(({ label, key }) => {
              let displayValue = "";

              if (key === "paid_date") {
                const paidDate = result.paid_date;
                if (typeof paidDate === "object" && paidDate?.Valid) {
                  displayValue = paidDate.String || "-";
                } else if (typeof paidDate === "string" && paidDate) {
                  displayValue = paidDate;
                } else {
                  displayValue = "-";
                }
              } else {
                const value = result[key as keyof Transaction];
                displayValue = value ? String(value) : "-";
              }

              return (
                <div key={key} className="border-b pb-4">
                  <p className="text-sm text-slate-600 mb-1">{label}</p>
                  <p className={`font-semibold text-lg ${key === "status" ? getStatusColor(displayValue) : "text-slate-900"}`}>{displayValue}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && !error && !result && (
        <div className="card p-12 text-center border-2 border-dashed border-slate-300">
          <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-slate-600">Cari transaksi untuk melihat detailnya</p>
        </div>
      )}
    </div>
  );
}
