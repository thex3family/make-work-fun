import Confetti from '@/components/Widgets/confetti';
import Quotes from '@/utils/quotes.json';
let quote = Quotes[(Quotes.length * Math.random()) << 0];

const ModalLevelUp = ({ playerLevel, setLevelUp }) => {
  return (
    <>
      <div className="h-screen absolute flex justify-center">
        <div className="confetti">
          <Confetti />
        </div>
        <div
          className="justify-center items-center flex flex-col overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-90"
          onClick={() => setLevelUp(false)}
        >
          <div className="animate-fade-in-up text-center">
            <h1 className="animate-soft-bounce shadow-md text-6xl font-black text-center sm:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
              LEVEL UP!
            </h1>
            <div className="flex-row align-middle">
              <div className="animate-soft-bounce px-5 pb-3 ml-2 inline-block rounded text-8xl font-black text-center sm:text-9xl bg-gradient-to-r from-emerald-500 to-blue-500">
                {playerLevel}
              </div>
            </div>
            <p className="text-sm sm:text-lg font-regular sm:font-medium mt-5 mb-3 italic px-5">
              {quote.text}
            </p>
            <p className="text-sm opacity-60">- {quote.author}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalLevelUp;
