document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.uniform-card-grid .card');

  cards.forEach(function (card) {
    const actionLink = card.querySelector('a.btn');
    if (!actionLink || !actionLink.getAttribute('href')) return;

    const targetHref = actionLink.getAttribute('href');
    const target = actionLink.getAttribute('target');
    const rel = actionLink.getAttribute('rel');

    const cardImage = card.querySelector('img.card-img-top');
    if (cardImage && !cardImage.closest('a')) {
      const imageAnchor = document.createElement('a');
      imageAnchor.href = targetHref;
      if (target) imageAnchor.target = target;
      if (rel) imageAnchor.rel = rel;
      cardImage.parentNode.insertBefore(imageAnchor, cardImage);
      imageAnchor.appendChild(cardImage);
    }

    const cardTitle = card.querySelector('.card-title');
    if (cardTitle && !cardTitle.querySelector('a')) {
      const titleText = cardTitle.textContent.trim();
      cardTitle.textContent = '';

      const titleAnchor = document.createElement('a');
      titleAnchor.href = targetHref;
      if (target) titleAnchor.target = target;
      if (rel) titleAnchor.rel = rel;
      titleAnchor.className = 'card-title-button';
      titleAnchor.textContent = titleText;

      cardTitle.appendChild(titleAnchor);
    }

    actionLink.remove();
  });
});
