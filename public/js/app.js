/* 
	================== FRONT-END JS ==================
*/

$(document).ready(function(){

	/* ================== ARTICLE ================== */

	// SCRAPE FOR ARTICLES -------------------------------
	
	$("#scraper-btn").on("click", function(){
		// when the scraper button is clicked

		// make an ajax call for the articles
		$.ajax({
			method:"GET",
			url:"/scrape"
		}).done(function(data){
			alert("SCRAPING COMPLETED");
			window.location.href = "/articles";	
		});		
	});

	// SAVE INDIVIDUAL ARTICLES -------------------------------

	$(document).on("click", ".save-article-btn", function(){
		// target the save-article-btn that was clicked

		var articleID = $(this).data("id");

		// make an ajax call to update the clicked article as saved
		$.ajax({
			method:"PUT",
			url:"/save/articles/" + articleID
		}).done(function(data){
			alert("ARTICLE SAVED");
			window.location.href = "/saved";
		});
	});

	// DELETE INDIVIDUAL ARTICLES -------------------------------

	$(document).on("click", ".delete-article-btn", function(){
		// target the delete-article-btn that was clicked

		var articleID = $(this).data("id");

		// make an ajax call to update the clicked article as removed
		$.ajax({
			method:"DELETE",
			url:"/remove/articles/" + articleID
		}).done(function(data){
			alert("ARTICLE DELETED");
			window.location.href="/articles";
		});

	});

	/* ================== NOTES ================== */

	// $(".article-notes-div").hide();
	var span = $(".close").first();
	var modal = document.getElementById("myModal");

	// GET NOTES FOR INDIVIDUAL ARTICLES -------------------------------
	$(document).on("click", ".article-notes-btn", function(){

		var articleID = $(this).data("id");

		// make an ajax call to get the articles' associated notes
		$.ajax({
			method:"GET",
			url:"/articles/notes/" + articleID
		}).done(function(data){

			modal.style.display = "block";

			if (data[0].note.length === 0) {
				$("#article-notes-div").empty();
			}
			else {

				$("#article-notes-div").empty();

				var newDiv = "<div id='" + data[0]._id +"'>";

					for (var i = 0; i < data[0].note.length; i++){

						newDiv += 	"<br/><hr/><br/><div class='panel panel-default'>" + 
										// note title
										"<div class='panel-heading'>" +
											data[0].note[i].title +
										"</div>" +
										// note body
										"<div class='panel-body'>" +
											data[0].note[i].body +
										// delete note button
										"<br/><button type='button' class='btn btn-default" + 
										" delete-note-btn' data-noteid='" + data[0].note[i]._id + 
										"'> delete </button>" + "</div>" +
									"</div>";	
			
					}

					newDiv += "</div>";

					$("#article-notes-div").append(newDiv);		
					
			}
		});
	});

	// CREATE AND SAVE NOTES FOR INDIVIDUAL ARTICLES -------------------------------
	$(document).on("click", ".add-note-btn", function(){

		// get note title
		var noteTitle = $('#note-title').val().trim();
		// get note body
		var noteBody = $('#note-body').val().trim();

		// get associated article's id
		var articleID = $(this).data("articleid");

		// make an ajax call to send note to the db
		$.ajax({
			method:"POST",
			url:"/create/notes/" + articleID,
			data:{
				title:noteTitle,
				body:noteBody
			}
		}).done(function(data){

			$(noteTitle).empty();
			$(noteBody).empty();

			window.location.href="/saved";

		});
	});

	// DELETE INDIVIDUAL NOTES FOR INDIVIDUAL ARTICLES -------------------------------
	$(document).on("click", ".delete-note-btn", function(){
		// target the delete-article-btn that was clicked

		var noteID = $(this).data("noteid");

		// make an ajax call to update the clicked article as removed
		$.ajax({
			method:"DELETE",
			url:"/remove/notes/" + noteID
		}).done(function(data){
			alert("NOTE DELETED");
			window.location.href="/saved";
		});

	});

	// MODAL WINDOW FUNCTIONALITY -------------------------------

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
    	modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
	}
});
