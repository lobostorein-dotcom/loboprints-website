// upload-instruction.js
// Injects an instruction note ONLY when there is a single upload button and no 'Create Your Design' button in the same container, using the same style as upload-flow-note.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.d-flex.flex-wrap.gap-3').forEach(function (actionWrap) {
    var uploadBtn = actionWrap.querySelector('[data-open-upload-form="true"]');
    var createBtn = actionWrap.querySelector('a[href*="customizer-tool/customizer.html"]');
    // Only inject if upload button exists and create design does NOT
    if (uploadBtn && !createBtn && !actionWrap.querySelector('.upload-flow-note')) {
      var note = document.createElement('div');
      note.className = 'upload-flow-note';
      note.innerHTML = '<strong>Upload Files:</strong> Attach your ready-to-print logo, artwork, or design files (JPG, PNG, PDF, AI, etc.). Our team will review and confirm your order details.';
      uploadBtn.insertAdjacentElement('afterend', note);
    }
  });
});
