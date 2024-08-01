import './style.css'
const apiKey = `Bearer ${import.meta.env.VITE_WISTIA_TOKEN}`; // read-only key
let currentPage = 1;
const perPage = 200;
let totalPages = 1;

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    authorization: apiKey,
  },
};

const formatDuration = (duration) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const updateThumbnailUrl = (url) => {
  const urlObj = new URL(url);
  urlObj.searchParams.set('image_crop_resized', '480x270');
  return urlObj.toString();
};

const fetchMediaCount = () => {
  fetch('https://api.wistia.com/v1/account.json', options)
    .then((response) => response.json())
    .then((response) => {
      const mediaCount = response.mediaCount;
      document.getElementById(
        'pageTitle'
      ).textContent = `Contentful Video Library Browser • ${mediaCount} Videos`;
      totalPages = Math.ceil(mediaCount / perPage);
      createPaginationControls();
    })
    .catch((err) => console.error(err));
};

const createPaginationControls = () => {
  const paginationControls =
    document.getElementById('paginationControls');
  paginationControls.innerHTML = '';

  const prevButton = document.createElement('button');
  prevButton.id = 'prevPage';
  prevButton.textContent = 'Previous';
  prevButton.classList.add(
    'mr-2',
    'p-2',
    'border',
    'border-gray-300',
    'dark:border-gray-700',
    'rounded',
    'bg-white',
    'dark:bg-gray-800',
    'text-gray-900',
    'dark:text-gray-100',
    'hover:bg-gray-200',
    'dark:hover:bg-gray-700'
  );
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) updatePage(currentPage - 1);
  });
  paginationControls.appendChild(prevButton);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.id = `page${i}`;
    pageButton.textContent = i;
    pageButton.classList.add(
      'mr-2',
      'p-2',
      'rounded',
      'bg-white',
      'dark:bg-gray-800',
      'text-gray-900',
      'dark:text-gray-100',
      'hover:bg-gray-200',
      'dark:hover:bg-gray-700'
    );
    if (i === currentPage) {
      pageButton.classList.add(
        'bg-gray-900',
        'dark:bg-gray-100',
        'text-white',
        'dark:text-gray-900'
      );
    }
    pageButton.addEventListener('click', () => updatePage(i));
    paginationControls.appendChild(pageButton);
  }

  const nextButton = document.createElement('button');
  nextButton.id = 'nextPage';
  nextButton.textContent = 'Next';
  nextButton.classList.add(
    'p-2',
    'border',
    'border-gray-300',
    'dark:border-gray-700',
    'rounded',
    'bg-white',
    'dark:bg-gray-800',
    'text-gray-900',
    'dark:text-gray-100',
    'hover:bg-gray-200',
    'dark:hover:bg-gray-700'
  );
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) updatePage(currentPage + 1);
  });
  paginationControls.appendChild(nextButton);
};

const fetchData = (page) => {
  fetch(
    `https://api.wistia.com/v1/medias?page=${page}&per_page=${perPage}&sort_by=created&sort_direction=0&archived=false&type=Video`,
    options
  )
    .then((response) => response.json())
    .then((response) => {
      const tableBody = document.querySelector('#jsonTable tbody');
      const searchField = document.getElementById('search');

      const renderTable = (data) => {
        tableBody.innerHTML = '';
        data.forEach((jsonData) => {
          const row = document.createElement('tr');

          const thumbnailCell = document.createElement('td');
          const thumbnailLink = document.createElement('a');
          thumbnailLink.href = `https://contentful.wistia.com/medias/${jsonData.hashed_id}`;
          thumbnailLink.target = '_blank';
          const thumbnailImg = document.createElement('img');
          thumbnailImg.src = updateThumbnailUrl(jsonData.thumbnail.url);
          thumbnailImg.alt = jsonData.name;
          thumbnailImg.classList.add('aspect-video', 'rounded');
          thumbnailCell.classList.add(
            'w-44',
            'py-2',
            'px-4',
            'border-b',
            'border-gray-300',
            'dark:border-gray-700'
          );
          thumbnailLink.appendChild(thumbnailImg);
          thumbnailCell.appendChild(thumbnailLink);
          row.style.verticalAlign = 'top';
          row.appendChild(thumbnailCell);

          // const idCell = document.createElement('td');
          // const idLink = document.createElement('a');
          // idLink.href = `https://contentful.wistia.com/medias/${jsonData.hashed_id}`;
          // idLink.target = "_blank";
          // idLink.textContent = jsonData.hashed_id;
          // idLink.classList.add('text-blue-500', 'dark:text-blue-300', 'hover:underline');
          // idCell.classList.add('py-2', 'px-4', 'border-b', 'border-gray-300', 'dark:border-gray-700');
          // idCell.appendChild(idLink);
          // row.appendChild(idCell);

          const nameCell = document.createElement('td');
          const nameLink = document.createElement('a');
          nameLink.href = `https://contentful.wistia.com/medias/${jsonData.hashed_id}`;
          nameLink.target = '_blank';
          nameLink.textContent = jsonData.name;
          nameLink.classList.add(
            'text-blue-500',
            'dark:text-blue-300',
            'hover:underline'
          );
          nameCell.classList.add(
            'max-w-md',
            'py-2',
            'px-4',
            'border-b',
            'border-gray-300',
            'dark:border-gray-700'
          );
          nameCell.appendChild(nameLink);
          row.appendChild(nameCell);

          const durationCell = document.createElement('td');
          durationCell.textContent = formatDuration(jsonData.duration);
          durationCell.classList.add(
            'mono',
            'py-2',
            'px-4',
            'border-b',
            'border-gray-300',
            'dark:border-gray-700'
          );
          row.appendChild(durationCell);

          const dateCell = document.createElement('td');
          dateCell.textContent = formatDate(jsonData.created);
          dateCell.classList.add(
            'mono',
            'w-32',
            'py-2',
            'px-4',
            'border-b',
            'border-gray-300',
            'dark:border-gray-700'
          );
          row.appendChild(dateCell);

          tableBody.appendChild(row);

          const descriptionCell = document.createElement('td');
          descriptionCell.innerHTML = jsonData.description;
          descriptionCell.classList.add(
            'text-sm',
            'font-light',
            'leading-normal',
            'max-w-xl',
            'py-2',
            'px-4',
            'border-b',
            'border-gray-300',
            'dark:border-gray-700',
            'desc'
          );
          // if (jsonData.description.length > 256) {
          //     descriptionCell.classList.add('truncate', 'max-w-lg');
          // }
          row.appendChild(descriptionCell);
        });
      };

      renderTable(response);

      searchField.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredData = response.filter((item) =>
          item.name.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredData);
      });
    })
    .catch((err) => console.error(err));
};

fetchMediaCount();
fetchData(currentPage);

const updatePage = (newPage) => {
  currentPage = newPage;
  fetchData(currentPage);
  createPaginationControls();
};
