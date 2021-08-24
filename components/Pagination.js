import React from 'react';

const Pagination = ({ postsPerPage, totalPosts, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className='flex flex-row gap-2 mt-10 justify-center text-center'>
        {pageNumbers.map(number => (
          <li onClick={() => paginate(number)} key={number} className={`font-semibold my-2 px-2 rounded-full inline text-center cursor-pointer ${currentPage == number ? 'bg-gradient-to-r from-emerald-500 outline-none to-blue-500 border-2' : 'border-2'}`}>
              {number}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Pagination;