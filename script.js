const BASE_STORAGE_KEY = "photoLikes";
const BASE_API = "https://api.unsplash.com/photos/";
const BASE_RANDOM_PHOTO = "random";
const BASE_KEY = "oiLFNl2HZnhw1dKQ6fe_wyESLCdKRfD_b9JPrvB-rJM";
const app = document.querySelector("#app");

const saveToStorage = (photoId, count) => {
    let likes = JSON.parse(localStorage.getItem(BASE_STORAGE_KEY));
    if (likes) {
        likes = {
            ...likes,
            [photoId]: count,
        };
    } else {
        likes = {
            [photoId]: count,
        };
    }
    localStorage.setItem(BASE_STORAGE_KEY, JSON.stringify(likes));
};

const getLikesFromStorage = (photoId) => {
    const photos = JSON.parse(localStorage.getItem(BASE_STORAGE_KEY));
    if (!photos || !photos[photoId]) {
        const count = 0;
        saveToStorage(photoId, count);
        return count;
    }
    return photos[photoId];
};

const fetchData = async(arg) => {
    const response = await fetch(`${BASE_API}${arg}?client_id=${BASE_KEY}`);
    return await response.json();
};

const createActionsPhotos = () => {
    return `<button id="pastPhotos">Get  Past Photos</button><button id="randomPhoto">Get Random Photo</button><div id="photos"></>`;
};
const createContent = (src, author, photoId, likes) => {
    return `<div class="photo" id="${photoId}">
<img class="photo__img" src="${src}" alt="${author}">
<h3>${author}</h3>
<div class="photo__actions">
<span class="photo__counter">${likes}</span>
<button class="photo__like">Like</button>
</div>
</div>`;
};

const likesListener = (e) => {
    if (!e.target.closest(".photo__like")) return;
    const photoDiv = e.target.closest(".photo");
    const photoId = photoDiv.id;

    const currentCountSpan = photoDiv.querySelector(".photo__counter");
    const currentCount = +currentCountSpan.textContent + 1;
    currentCountSpan.textContent = currentCount;

    saveToStorage(photoId, currentCount);
};

const getPhotoDataFromResponse = (data) => {
    const src = data.urls.small;
    const author = data.user.name;
    const photoId = data.id;
    const likes = getLikesFromStorage(photoId);

    return { src, author, photoId, likes }
}

const getShowedPhotoIds = () => {
    let photos = JSON.parse(localStorage.getItem(BASE_STORAGE_KEY));
    if (!photos) return;

    const photoIds = Object.keys(photos);
    document.querySelector("#photos").innerHTML = '';
    photoIds.forEach(photo => {
        fetchData(photo).then(data => getPhotoDataFromResponse(data)).then(({ src, author, photoId, likes }) => {
            document.querySelector("#photos").innerHTML += createContent(src, author, photoId, likes);
        });
    })
}

const fetchRandomPhoto = async() => {
    const data = await fetchData(BASE_RANDOM_PHOTO);
    const { src, author, photoId, likes } = getPhotoDataFromResponse(data);
    document.querySelector("#photos").innerHTML = createContent(src, author, photoId, likes);
}

document.addEventListener("DOMContentLoaded", async() => {
    app.addEventListener("click", likesListener);
    app.innerHTML = createActionsPhotos();
    document.querySelector('#randomPhoto').addEventListener('click', fetchRandomPhoto);
    document.querySelector('#pastPhotos').addEventListener('click', getShowedPhotoIds);
    await fetchRandomPhoto();
});