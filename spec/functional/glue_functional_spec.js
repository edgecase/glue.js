describe("Glue.js", function(){
  var fixture;

  beforeEach(function(){
    fixture = $("#fixture").html("");
  });

  afterEach(function(){
    fixture = $("#fixture").html("");
  });

  it("binds to objects", function(){
    var obj = {"name":"Leon", "age":33};
    var controller = new Glue(obj);
    expect(controller).not.toBeUndefined();
    expect( controller.get("name") ).toEqual("Leon");
  });

  it("allows observation via keyPath", function(){
    var obj = {"name":"Leon", "age":33};
    var controller = new Glue(obj);

    var $nameView = $("<div/>").html(controller.get("name"));
    fixture.append($nameView);

    controller.addObserver($nameView, "name", function(msg){
      $(this).html(msg.value);
    });

    expect( $nameView.html() ).toEqual("Leon");

    controller.set("name", "Felix");

    expect( $nameView.html() ).toEqual("Felix");

    controller.set("name", "Jerry");

    expect( $nameView.html() ).toEqual("Jerry");
  });

  it("allows you to propogate back from view.", function(){
    var obj = {"name":"Leon", "age":33};
    var controller = new Glue(obj);

    var input = $("<input type='text'/>").change(function(e){
      controller.set("name", $(this).val());
    });

    fixture.append(input);

    controller.addObserver(jasmine, "name", function(msg){
      expect( msg.value ).toEqual("Felix");
      this.log(msg.value);
    });

    expect( controller.get("name") ).toEqual("Leon");
    input.val("Felix").trigger("change");
    expect( controller.get("name") ).toEqual("Felix");

  });

  it("works with collections", function(){
    var friends = {"friends":[
      { "name": "Felix" },
      { "name": "Jerry" },
      { "name": "Justine" }
    ]};

    var glue = new Glue(friends);
    var $nameView = $("<div/>").html( glue.get("name") );
    var $friendCountView = $("<div/>").html( glue.count("friends") )

    fixture
      .append($nameView)
      .append($friendCountView);

    glue.addObserver($friendCountView, "friends", function(msg){
      $(this).html(msg.currentCount);
    });

    glue.addObserver(jasmine, "friends", function(msg){
      this.log(msg.value.name+" was " + msg.collectionOperation + "ed to the collection");
    });

    expect( glue.count("friends") ).toEqual(3);
    expect( $friendCountView.text() ).toEqual("3");

    glue.add("friends", {"name":"Leon"});

    expect( glue.count("friends") ).toEqual(4);
    expect( $friendCountView.text() ).toEqual("4");

    var justine = glue.removeAt("friends", 2);
    expect( justine.name ).toEqual("Justine");
    expect( glue.count("friends") ).toEqual(3);
    expect( $friendCountView.text() ).toEqual("3");
  });

});
