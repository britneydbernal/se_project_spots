import "./index.css";
import {
  enableValidation,
  validationConfig,
  resetFormValidation,
  disableButton,
} from "../scripts/validation.js";

import Api from "../utils/Api.js";

const initialCards = [
  {
    name: "Golden Gate Bridge",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
  },
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },
  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },
  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
];

function renderLoading(
  isLoading,
  button,
  buttonText = "Save",
  loadingText = "Saving..."
) {
  if (isLoading) {
    button.textContent = loadingText;
  } else {
    button.textContent = buttonText;
  }
}

function handleSubmit(request, evt, loadingText = "Saving...") {
  evt.preventDefault();

  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  disableButton(submitButton, validationConfig);
  renderLoading(true, submitButton, initialText, loadingText);

  request()
    .then(() => {
      evt.target.reset();
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, submitButton, initialText);
    });
}

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "2f9191da-7536-419d-b800-c3b88c13a750",
    "Content-Type": "application/json",
  },
});

const editProfileButton = document.querySelector(".profile__edit-button");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm = document.forms["profile-form"];
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");
const avatarSubmitButton = avatarModal.querySelector(".modal__submit-button");
const avatarImageEl = document.querySelector(".profile__avatar-image");
const avatarModalButton = document.querySelector(".profile__avatar-btn");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = document.querySelector("#delete-form");

const newPostButton = document.querySelector(".profile__new-post-button");
const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = newPostModal.querySelector(".modal__form");
const newPostTitleInput = newPostModal.querySelector("#card-image-input");
const newPostDescriptionInput = newPostModal.querySelector(
  "#card-caption-input"
);

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

const previewModal = document.querySelector("#preview-modal");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

let selectedCard;
let selectedCardId;

api
  .getAppInfo()
  .then(([cards, userInfo]) => {
    api.userId = userInfo._id;
    cards.forEach((item) => renderCard(item, "append"));
    profileNameEl.textContent = userInfo.name;
    profileDescriptionEl.textContent = userInfo.about;
    avatarImageEl.src = userInfo.avatar;
    avatarImageEl.alt = "Profile picture of ${userInfo.name}";
  })
  .catch(console.error);

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__delete-button");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  if (
    Array.isArray(data.likes) &&
    data.likes.some((user) => user._id === api.userId)
  ) {
    likeButton.classList.add("card__like-button_active");
  }

  likeButton.addEventListener("click", () => {
    if (likeButton.classList.contains("card__like-button_active")) {
      api
        .unlikeCard(data._id)
        .then((updatedCard) => {
          likeButton.classList.remove("card__like-button_active");
        })
        .catch(console.error);
    } else {
      api
        .likeCard(data._id)
        .then((updatedCard) => {
          likeButton.classList.add("card__like-button_active");
        })
        .catch(console.error);
    }
  });

  deleteButton.addEventListener("click", () => {
    selectedCard = cardElement;
    selectedCardId = data._id;
    openDeleteModal(cardElement, data._id);
  });

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function renderCard(item, method = "prepend") {
  const cardElement = getCardElement(item);
  cardsList[method](cardElement);
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");

  function handleEscClose(evt) {
    if (evt.key === "Escape") closeModal(modal);
  }

  function handleOverlayClose(evt) {
    if (evt.target === modal) closeModal(modal);
  }

  modal.addEventListener("click", handleOverlayClose);
  document.addEventListener("keydown", handleEscClose);

  modal._escHandler = handleEscClose;
  modal._overlayHandler = handleOverlayClose;
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");

  const form = modal.querySelector(".modal__form");
  if (form) {
    resetFormValidation(form, validationConfig);
  }

  if (modal._escHandler)
    document.removeEventListener("keydown", modal._escHandler);
  if (modal._overlayHandler)
    modal.removeEventListener("click", modal._overlayHandler);
}

function openDeleteModal() {
  openModal(deleteModal);
}

deleteForm.addEventListener("submit", (evt) => {
  handleSubmit(
    () => {
      return api.deleteCard(selectedCardId).then(() => {
        selectedCard.remove();
        closeModal(deleteModal);
      });
    },
    evt,
    "Deleting..."
  );
});

deleteModal
  .querySelector(".modal__cancel-button")
  .addEventListener("click", () => {
    closeModal(deleteModal);
  });

document.querySelectorAll(".modal__close-button").forEach((button) => {
  const popup = button.closest(".modal");
  button.addEventListener("click", () => closeModal(popup));
});

editProfileButton.addEventListener("click", () => {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  openModal(editProfileModal);
});

editProfileForm.addEventListener("submit", (evt) => {
  handleSubmit(
    () => {
      return api
        .editUserInfo({
          name: editProfileNameInput.value,
          about: editProfileDescriptionInput.value,
        })
        .then((data) => {
          profileNameEl.textContent = data.name;
          profileDescriptionEl.textContent = data.about;
          closeModal(editProfileModal);
        });
    },
    evt,
    "Saving..."
  );
});

avatarForm.addEventListener("submit", (evt) => {
  handleSubmit(
    () => {
      return api.editAvatarInfo(avatarInput.value).then((data) => {
        avatarImageEl.src = data.avatar;
        avatarImageEl.alt = `Profile picture of ${data.name}`;
        closeModal(avatarModal);
      });
    },
    evt,
    "Saving..."
  );
});

newPostButton.addEventListener("click", () => openModal(newPostModal));
newPostForm.addEventListener("submit", (evt) => {
  handleSubmit(
    () => {
      const cardData = {
        name: newPostDescriptionInput.value,
        link: newPostTitleInput.value,
      };
      return api.addCard(cardData).then((newCard) => {
        renderCard(newCard, "prepend");
        closeModal(newPostModal);
      });
    },
    evt,
    "Saving..."
  );
});

enableValidation(validationConfig);
