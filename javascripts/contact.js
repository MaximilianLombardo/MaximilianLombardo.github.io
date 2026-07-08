// Assemble the contact email at runtime so it never appears as a
// scrapable string in the page source. Split into parts on purpose.
(function () {
  var user = ['maximilian', 'g', 'lombardo'].join('.');
  var domain = ['gmail', 'com'].join('.');
  var address = user + '@' + domain;

  var link = document.getElementById('email-link');
  if (link) {
    link.href = 'mailto:' + address;
    link.textContent = address;
  }
})();
