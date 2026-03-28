import { useState, useEffect } from "react";

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

const getStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return "✓";
    case "PENDING":
      return "⏳";
    case "FAILED":
      return "✕";
    default:
      return "•";
  }
};

export default function GetAll() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const fetchAllTransactions = async () => {
    setLoading(true);
    setError("");
    setTransactions([]);

    try {
      const res = await fetch("http://localhost:8080/api/v1/qr/all");

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: Transaction[] = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError("Gagal memuat data transaksi");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((trx) => {
    if (!filter) return true;
    const searchLower = filter.toLowerCase();
    return (
      trx.reference_no?.toLowerCase().includes(searchLower) ||
      trx.merchant_id?.toLowerCase().includes(searchLower) ||
      trx.trx_id?.toLowerCase().includes(searchLower) ||
      trx.status?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: transactions.length,
    success: transactions.filter((t) => t.status?.toUpperCase() === "SUCCESS").length,
    pending: transactions.filter((t) => t.status?.toUpperCase() === "PENDING").length,
    failed: transactions.filter((t) => t.status?.toUpperCase() === "FAILED").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Semua Transaksi</h2>
        <p className="text-slate-600">Lihat daftar lengkap semua transaksi yang telah dibuat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-slate-600 mb-1">Total Transaksi</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>

        <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-slate-600 mb-1">Sukses</p>
          <p className="text-3xl font-bold text-green-600">{stats.success}</p>
        </div>

        <div className="card p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <p className="text-sm text-slate-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>

        <div className="card p-4 bg-gradient-to-br from-red-50 to-red-100">
          <p className="text-sm text-slate-600 mb-1">Gagal</p>
          <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Cari Transaksi</label>
            <input
              type="text"
              placeholder="Cari berdasarkan Reference No, Merchant ID, Trx ID, atau Status..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input"
            />
          </div>

          <button
            onClick={fetchAllTransactions}
            disabled={loading}
            className="btn px-6"
          >
            {loading ? "Refresh..." : "Refresh"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card p-12 text-center">
          <div className="inline-block animate-spin text-blue-600 mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-slate-600">Memuat data transaksi...</p>
        </div>
      )}

      {error && (
        <div className="card p-4 bg-red-50 border border-red-200">
          <p className="text-red-700 font-medium">⚠️ {error}</p>
          <button
            onClick={fetchAllTransactions}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {!loading && !error && filteredTransactions.length === 0 && (
        <div className="card p-12 text-center border-2 border-dashed border-slate-300">
          <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-600 mb-2">
            {filter ? "Tidak ada transaksi yang cocok dengan pencarian" : "Tidak ada transaksi"}
          </p>
          {filter && (
            <button
              onClick={() => setFilter("")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Bersihkan Filter
            </button>
          )}
        </div>
      )}

      {!loading && !error && filteredTransactions.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Reference No</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Merchant ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Trx ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Transaction Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTransactions.map((trx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm font-semibold text-slate-900">{trx.reference_no}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{trx.merchant_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">Rp {Number(trx.amount).toLocaleString("id-ID")}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(trx.status)}`}>
                        {getStatusIcon(trx.status)} {trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{trx.trx_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{new Date(trx.transaction_date).toLocaleString("id-ID")}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Menampilkan <span className="font-semibold">{filteredTransactions.length}</span> dari{" "}
              <span className="font-semibold">{transactions.length}</span> transaksi
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
