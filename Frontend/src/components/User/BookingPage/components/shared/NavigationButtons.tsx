interface NavigationButtonsProps {
  back?: () => void;
  next: () => void;
  nextLabel?: string;
  disableNext?: boolean;
}

const NavigationButtons = ({ back, next, nextLabel = "Continue", disableNext = false }: NavigationButtonsProps) => (
  <div className="flex justify-between mt-6 items-center">
    {back ? (
      <button onClick={back} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200">
        Back
      </button>
    ) : (
      <div></div>
    )}
    <button
      onClick={next}
      disabled={disableNext}
      className={`relative inline-flex items-center justify-center px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 
        ${disableNext ? "opacity-50 cursor-not-allowed bg-gray-500" : "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 hover:shadow-[0_0_25px_rgba(99,102,241,0.8)]"}
        `}
    >
      {nextLabel}
    </button>
  </div>
);

export default NavigationButtons;
