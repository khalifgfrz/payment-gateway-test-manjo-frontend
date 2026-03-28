import { useState } from "react";

export default function Payment() {
  const [form, setForm] = useState({
    referenceNo: "",
    amount: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>("");

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
        type: "payment",
        originalReferenceNo: form.referenceNo,
        amountValue: form.amount,
      }),
    });

    return res.json();
  };

  const handlePay = async () => {
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
      setMsg(data.responseMessage);
    } catch {
      setMsg("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Simulate Payment</h2>

      <div className="grid gap-3 max-w-md">
        <input name="referenceNo" placeholder="Reference No" onChange={handleChange} className="input" />
        <input name="amount" placeholder="Amount" onChange={handleChange} className="input" />

        <button onClick={handlePay} className="btn">
          {loading ? "Processing..." : "Pay"}
        </button>
      </div>

      {msg && <p className="mt-4 text-green-600">{msg}</p>}
    </div>
  );
}
