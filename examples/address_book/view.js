$(function() {
  var $detailedView = $('#contact-detailed-view')
  ,   $summary      = $('#contact-summary')
  ,   $overview     = $('#contact-overview')
  ,   $flash        = $('#flash')
  ,   $tree         = $('#tree')
  ;

  var contactInstance = new Contact();

  contactInstance.update("firstname", "Felix");
  contactInstance.update("lastname", "Jefferson");
  contactInstance.add("email", { primary: false, type: "home", value: "felix@edgecase.com" });
  contactInstance.add("email", { primary: true, type: "office", value: "leon@edgecase.com" });
  contactInstance.add("phone", { primary: true, type: "office", value: "(440) 432-3213" });
  contactInstance.add("phone", { primary: false, type: "home", value: "(232) 213-3213" });

  var contactController = window.cc = new ObjectController(contactInstance);

  $detailedView.find("input[type=text]").change(function(e){
    var $sender = $(e.target);
    contactController.set( $sender.attr("id").replace(/\-/gi, ""), $sender.val() );
  });

  contactController.addObserver($detailedView, "firstname, lastname", function(msg) {
    console.log(msg.newValue);
    $(this).find("#first-name").val(msg.object.get("firstname"));
    $(this).find("#last-name").val(msg.object.get("lastname"));
  });

  contactController.addObserver($flash, "*", function(msg) {
    $newEl = $("<div />").text("updated: "+ msg.keyPath+" from: "+msg.oldValue.toString() +" to: "+msg.newValue.toString());
    $(this).append($newEl);
    $newEl.delay(2000).fadeOut(function(){ $(this).remove(); });
  });

  contactController.addObserver($summary.find(".phone-count"), "phones", function(msg) {
    $(this).text(msg.newValue.length + " phone numbers");
  });

  contactController.addObserver($summary.find(".email-count"), "emails", function(msg) {
    $(this).text(msg.newValue.length + " email addrs");
  });

  // bootstrap main UX
  contactController.set("lastname", "Flores");
  $summary.find(".phone-count").text( contactController.get("phones").length +" phone numbers" );
  $summary.find(".email-count").text( contactController.get("emails").length +" email addrs" );

  $tree.append("Felix's mother is: " + contactController.get("family.tree.mother") );
  $tree.append("<br>Felix's father is: " + contactController.get("family.tree.father") );
});
