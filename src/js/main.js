document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const overlay = document.querySelector('.mobile-overlay');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileContent = document.querySelector('.mobile-menu__content');

  // Функция наполнения меню (клонирует навигацию и поиск)
  function populateMobileMenu() {
    if (mobileContent.children.length > 0) return; // уже наполнено
    const navClone = document.querySelector('.header__nav').cloneNode(true);
    const searchClone = document.querySelector('.search').cloneNode(true);
    mobileContent.appendChild(navClone);
    mobileContent.appendChild(searchClone);
    // убираем скрытие на мобильных
    navClone.style.display = 'block';
    searchClone.style.display = 'flex';
  }

  function openMenu() {
    burger.classList.add('active');
    overlay.classList.add('active');
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    burger.classList.remove('active');
    overlay.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Переключение по клику на бургер
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mobileMenu.classList.contains('active')) {
      closeMenu();
    } else {
      populateMobileMenu(); // заполняем при первом открытии
      openMenu();
    }
  });

  // Закрытие по клику на оверлей
  overlay.addEventListener('click', closeMenu);

  // Закрытие при изменении размера окна (если стало >767px)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 767 && mobileMenu.classList.contains('active')) {
      closeMenu();
    }
  });
});