document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.card');

  cards.forEach(function (card) {
    const actionLink = card.querySelector('a.btn');
    if (!actionLink || !actionLink.getAttribute('href')) return;

    const targetHref = actionLink.getAttribute('href');
    const target = actionLink.getAttribute('target');

    const cardImage = card.querySelector('img.card-img-top');
    if (cardImage && !cardImage.closest('a')) {
      const imageAnchor = document.createElement('a');
      imageAnchor.href = targetHref;
      if (target) imageAnchor.target = target;
      cardImage.parentNode.insertBefore(imageAnchor, cardImage);
      imageAnchor.appendChild(cardImage);
    }

    const cardTitle = card.querySelector('.card-title');
    if (cardTitle && !cardTitle.querySelector('a')) {
      const titleText = cardTitle.textContent;
      cardTitle.textContent = '';

      const titleAnchor = document.createElement('a');
      titleAnchor.href = targetHref;
      if (target) titleAnchor.target = target;
      titleAnchor.className = 'text-decoration-none text-dark';
      titleAnchor.textContent = titleText;

      cardTitle.appendChild(titleAnchor);
    }
  });
});
