import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import type { AxiosError } from "axios";
import apiClient from "../services/api";
import type { QRResponse, SignatureResponse } from "../type";

export default function GenerateQR() {
  const [form, setForm] = useState({
    partnerReferenceNo: "",
    merchantId: "",
    trx_id: "",
    amount: "",
  });

  const [result, setResult] = useState<QRResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    if (!form.partnerReferenceNo.trim()) {
      setError("Partner Reference No wajib diisi");
      return false;
    }
    if (!form.merchantId.trim()) {
      setError("Merchant ID wajib diisi");
      return false;
    }
    if (!form.trx_id.trim()) {
      setError("Transaction ID wajib diisi");
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

  const generateSignature = async (): Promise<SignatureResponse> => {
    try {
      const res = await apiClient.post<SignatureResponse>("/signature", {
        type: "generateQR",
        partnerReferenceNo: form.partnerReferenceNo,
        merchantId: form.merchantId,
        amountValue: form.amount,
      });

      return res.data;
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;

      console.error("Gagal generate signature:", axiosError.response?.data || axiosError.message);

      throw new Error(axiosError.response?.data?.message || "Gagal membuat tanda tangan digital");
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const sig = await generateSignature();

      const response = await apiClient.post<QRResponse>(
        "/qr/generate",
        {
          partnerReferenceNo: form.partnerReferenceNo,
          merchantId: form.merchantId,
          trx_id: form.trx_id,
          amount: {
            value: form.amount,
            currency: "IDR",
          },
        },
        {
          headers: {
            "X-SIGNATURE": sig.signature,
          },
        },
      );

      setResult(response.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || "Gagal membuat QR";

      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Generate QR Code</h2>
        <p className="text-slate-600">Buat QR code baru untuk transaksi pembayaran</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Form Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Partner Reference No *</label>
              <input type="text" name="partnerReferenceNo" placeholder="ex: PRN-2024-001" value={form.partnerReferenceNo} onChange={handleChange} className="input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Merchant ID *</label>
              <input type="text" name="merchantId" placeholder="ex: MERCHANT123" value={form.merchantId} onChange={handleChange} className="input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Transaction ID *</label>
              <input type="text" name="trx_id" placeholder="ex: TRX-2024-001" value={form.trx_id} onChange={handleChange} className="input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount (IDR) *</label>
              <input type="number" name="amount" placeholder="ex: 100000" value={form.amount} onChange={handleChange} className="input" />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">⚠️ {error}</p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} className="btn w-full">
              {loading ? "Generating..." : "Generate QR Code"}
            </button>
          </div>
        </div>

        <div>
          {loading && (
            <div className="card p-8 flex flex-col items-center justify-center h-full">
              <div className="animate-spin text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="text-slate-600">Membuat QR Code...</p>
            </div>
          )}

          {result && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">QR Code Generated</h3>

              <div className="bg-white p-6 rounded-lg border-2 border-slate-200 mb-4 flex flex-col items-center">
                <QRCodeCanvas value={result.qrContent} size={250} level="H" className="mb-4" />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Reference No</p>
                  <p className="font-semibold text-slate-900 break-all">{result.referenceNo}</p>
                </div>

                <button
                  onClick={() => {
                    const qrElement = document.querySelector("canvas");
                    if (qrElement) {
                      const link = document.createElement("a");
                      link.href = qrElement.toDataURL("image/png");
                      link.download = `qr-${result.referenceNo}.png`;
                      link.click();
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Download QR Code
                </button>
              </div>

              <button
                onClick={() => {
                  setResult(null);
                  setForm({ partnerReferenceNo: "", merchantId: "", trx_id: "", amount: "" });
                }}
                className="w-full mt-3 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                Generate Another
              </button>
            </div>
          )}

          {!loading && !result && (
            <div className="card p-8 flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-300">
              <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="text-slate-600 text-center">Isi form dan generate QR code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
