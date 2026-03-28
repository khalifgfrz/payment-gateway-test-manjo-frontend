import { useState } from "react";

interface QRResponse {
  referenceNo: string;
  qrContent: string;
}

export default function GenerateQR() {
  const [form, setForm] = useState({
    partnerReferenceNo: "",
    merchantId: "",
    trx_id: "",
    amount: "",
  });

  const [result, setResult] = useState<QRResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateSignature = async () => {
    const res = await fetch("http://localhost:8080/api/v1/signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "generateQR",
        partnerReferenceNo: form.partnerReferenceNo,
        merchantId: form.merchantId,
        amountValue: form.amount,
      }),
    });

    return res.json();
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const sig = await generateSignature();

      const res = await fetch("http://localhost:8080/api/v1/qr/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SIGNATURE": sig.signature,
        },
        body: JSON.stringify({
          partnerReferenceNo: form.partnerReferenceNo,
          merchantId: form.merchantId,
          trx_id: form.trx_id,
          amount: {
            value: form.amount,
            currency: "IDR",
          },
        }),
      });

      const data: QRResponse = await res.json();
      setResult(data);
    } catch {
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Generate QR</h2>

      <div className="grid gap-3 max-w-md">
        <input name="partnerReferenceNo" placeholder="Partner Ref" onChange={handleChange} className="input" />
        <input name="merchantId" placeholder="Merchant ID" onChange={handleChange} className="input" />
        <input name="trx_id" placeholder="Trx ID" onChange={handleChange} className="input" />
        <input name="amount" placeholder="Amount" onChange={handleChange} className="input" />

        <button onClick={handleSubmit} className="btn">
          {loading ? "Loading..." : "Generate QR"}
        </button>
      </div>

      {result && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <p>
            <b>Reference No:</b> {result.referenceNo}
          </p>
          <p>
            <b>QR Content:</b> {result.qrContent}
          </p>
        </div>
      )}
    </div>
  );
}
