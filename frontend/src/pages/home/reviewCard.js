import React from 'react';

const STAR_ICON = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
        fill="currentColor" className="w-4 h-4 text-yellow-400">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
    </svg>
);

function ReviewCard({ review }, intials) {
    const { studentName, rating, comment, created_at } = review;
    const dateStr = created_at ? new Date(created_at).toLocaleDateString() : '';
    return (
        <div className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="flex flex-row items-start gap-3">
                <div className="flex">
                    <span className="flex justify-center items-center h-16 w-16 rounded-full bg-gray-300 text-center font-semibold text-lg text-white"> MN</span>
                </div>
                <div className="flex flex-col items-start w-full">
                    <div className='flex flex-row justify-between w-full'>
                        <span className="font-semibold text-sm">{studentName || 'Student'}</span>
                        <div className=""> <span className="flex flex-row items-center justify-center gap-1 text-xs font-medium">{rating} <STAR_ICON /></span>
                        </div>
                        
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500">{dateStr}</div>
                    <div>
                        <p className="text-sm text-gray-700 mt-1">{comment || 'No comment provided.'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReviewCard;