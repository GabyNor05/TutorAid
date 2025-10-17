
const STAR_ICON = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
    fill="currentColor" className="w-4 h-4 text-yellow-400">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
  </svg>
);

function TutorCards({ tutor, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer w-64 sm:w-56 h-72 bg-white rounded-2xl shadow-md flex flex-col text-left shrink-0 overflow-hidden transition md:hover:-translate-y-1 md:hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      aria-label={`View ${tutor?.name || 'tutor'} details`}
    >
      <img
        src={tutor.image}
        alt={tutor.name}
        className="w-full h-[60%] object-cover bg-slate-200"
      />
      <div className="flex flex-col p-3 gap-1">
        <h3 className="text-base sm:text-lg font-medium line-clamp-1">{tutor.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-1">{tutor.experience} Experience</p>
        <div className="flex flex-row justify-between items-center mt-auto">
          <div className="flex items-center mt-1 space-x-1">
            <STAR_ICON />
            <span className="text-xs text-gray-700">
              {tutor.rating} ({tutor.num_ratings})
            </span>
          </div>
          <span className="text-xs text-gray-700">R{tutor.fee_per_hour} / hr</span>
        </div>
      </div>
    </button>
  );
}

export default TutorCards;