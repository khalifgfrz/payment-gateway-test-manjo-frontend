import { useState } from "react";

interface PaymentResponse {
  responseMessage: string;
  responseCode?: string;
}

interface ErrorResponse {
  error: number;
  message: string;
}

export default function Payment() {
  const [form, setForm] = useState({
    referenceNo: "",
    amount: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    if (!form.referenceNo.trim()) {
      setError("Reference No wajib diisi");
      return false;
    }
    if (!form.amount.trim()) {
      setError("Amount wajib diisi");
      return false;
    }
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError("Amount harus berupa angka positif");
      return false;
    }
    return true;
  };

  const generateSignature = async () => {
    const res = await fetch("http://localhost:8080/api/v1/signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "payment",
        originalReferenceNo: form.referenceNo,
        amountValue: form.amount,
      }),
    });

    return res.json();
  };

  const handlePay = async () => {
    setError("");
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const sig = await generateSignature();

      const res = await fetch("http://localhost:8080/api/v1/qr/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SIGNATURE": sig.signature,
        },
        body: JSON.stringify({
          originalReferenceNo: form.referenceNo,
          transactionStatusDesc: "SUCCESS",
          paidTime: new Date().toISOString(),
          amount: {
            value: form.amount,
            currency: "IDR",
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorData = data as ErrorResponse;
        setError(errorData.message || "Terjadi kesalahan saat memproses pembayaran");
        return;
      }

      const paymentData = data as PaymentResponse;
      setMessage(paymentData);
      setForm({ referenceNo: "", amount: "" });
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pembayaran"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePay();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Simulasi Pembayaran</h2>
        <p className="text-slate-600">Proses pembayaran untuk referensi transaksi yang sudah dibuat</p>
      </div>

      <div className="card p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reference No *</label>
            <input
              type="text"
              name="referenceNo"
              placeholder="Masukkan nomor referensi (ex: REF-2024-001)"
              value={form.referenceNo}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount (IDR) *</label>
            <input
              type="number"
              name="amount"
              placeholder="Masukkan jumlah pembayaran (ex: 100000)"
              value={form.amount}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              className="input"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">⚠️ {error}</p>
            </div>
          )}

          {message && (
            <div className={`rounded-lg p-4 border ${message.responseCode === "0000" ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
              <div className="flex gap-3">
                <div>
                  {message.responseCode === "0000" ? (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`font-semibold ${message.responseCode === "0000" ? "text-green-800" : "text-yellow-800"}`}>
                    {message.responseMessage}
                  </p>
                  {message.responseCode && (
                    <p className={`text-sm ${message.responseCode === "0000" ? "text-green-700" : "text-yellow-700"}`}>
                      Code: {message.responseCode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <button onClick={handlePay} disabled={loading} className="btn w-full text-lg py-3">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memproses...
              </span>
            ) : (
              "Proses Pembayaran"
            )}
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tips:</span> Pastikan Reference No sudah dibuat terlebih dahulu melalui halaman Generate QR
          </p>
        </div>
      </div>
    </div>
  );
}
