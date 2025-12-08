interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const ProgressBar = ({ currentStep, totalSteps = 3 }: ProgressBarProps) => {
  return (
    <div className="flex items-center justify-center mb-8 ml-30">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((num) => (
        <div key={num} className="flex-1 flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-all duration-300 ${
              currentStep >= num ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-500 bg-white"
            }`}
          >
            {num}
          </div>
          {num < totalSteps && (
            <div
              className={`flex-1 h-1 mx-2 transition-all duration-500 ${currentStep > num ? "bg-blue-600" : "bg-gray-300"}`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
