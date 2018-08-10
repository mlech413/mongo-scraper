// Grab all articles as a json
$.getJSON("/articles", function(data) {
  console.log("/articles");
  let saveButtonHtml=""
  // For each one
  for (var i = 0; i < data.length; i++) {
    if (data[i].saved) {
      saveButtonHtml="<button class='btn btn-default disabled' data-id='" + data[i]._id + "' id='save-article-button'>Article Saved</button><br><br><hr><br>";
    }
    else {
      saveButtonHtml="<button class='btn btn-default' data-id='" + data[i]._id + "' id='save-article-button'>Save Article</button><br><br><hr><br>";
    };
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'><strong>" + data[i].title + "</strong><br />" + data[i].summary + "<br /><a href='" + data[i].link  + "'>" + data[i].link + "</a></p><button class='btn btn-default'  data-id='" + data[i]._id + "' id='add-notes-button'>&nbsp;Add Notes&nbsp;</button>&nbsp;&nbsp;&nbsp;" + saveButtonHtml);
  }
});

// Grab the saved articles as a json
$.getJSON("/savedarticles", function(data) {
  console.log("/savedarticles");
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#saved-articles").append("<p data-id='" + data[i]._id + "'><strong>" + data[i].title + "</strong><br />" + data[i].summary + "<br />" + data[i].link  + "</p>");
  }
});

  $(document).on("click", "#add-notes-button", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").html("<br><br><br><br><br><br><font color='green'><h1>Note Saved!</h1></font>");
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

// When you click the save article button
$(document).on("click", "#save-article-button", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/save-article/" + thisId
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      location.reload();
    });

 
});

// someone clicks the scrape articles button
$(document).on("click", "#scrape-button", function() {
  $("#articles").html("<img src='/assets/img/loading.gif' style='height: 200px;'>");
  
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
  .then(function(data) {
    console.log(data);
    location.reload();
  });
});

// someone clicks the erase all articles button
$(document).on("click", "#erase-all-button", function() {
  $("#articles").html("<img src='/assets/img/loading.gif' style='height: 200px;'>");
  
  $.ajax({
    method: "POST",
    url: "/erase-all"
  })
  .then(function(data) {
    console.log(data);
    location.reload();
  });
});

// someone clicks the erase all articles button
$(document).on("click", "#erase-saved-button", function() {
  
  $.ajax({
    method: "POST",
    url: "/erase-saved"
  })
  .then(function(data) {
    console.log(data);
    location.reload();
  });
});