/* PetCARE — Application entry point */
(function boot(){
  loadState();
  applyHashRoute();
  render();
  window.addEventListener("hashchange", () => { applyHashRoute(); render(); });
})();
