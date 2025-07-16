// js/modules/utils.js
export function showModal(text, onConfirm) {
  const modal = document.querySelector('.modal');
  const modalText = document.getElementById('modal-text');
  const confirmBtn = document.getElementById('modal-confirm');
  const cancelBtn = document.getElementById('modal-cancel');

  modalText.innerHTML = text;
  modal.classList.remove('hidden');
  gsap.fromTo(modal, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3 });

  confirmBtn.onclick = () => {
    if (onConfirm) onConfirm();
    modal.classList.add('hidden');
  };
  cancelBtn.onclick = () => modal.classList.add('hidden');
}
