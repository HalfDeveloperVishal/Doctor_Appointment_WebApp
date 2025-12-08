interface PaymentMethodSelectorProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  doctorFee: number;
}

const PaymentMethodSelector = ({ paymentMethod, onPaymentMethodChange, doctorFee }: PaymentMethodSelectorProps) => {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm font-medium mb-2">Select Payment Method:</p>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="counter"
            checked={paymentMethod === "counter"}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
          />
          Pay at Counter
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="online"
            checked={paymentMethod === "online"}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
          />
          Pay Online (₹{doctorFee})
        </label>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
