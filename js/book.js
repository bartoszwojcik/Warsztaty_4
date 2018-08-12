/*
Warning:
The current version does not resolve the CORS issue in e.g. Firefox.
Connection should be proxied
 */


"use strict";

let bookModifyForm = `
<form class="book-modify-form hidden-desc" method="POST">
<label>Book title:
    <input type="text" name="title" class="input-new-title" maxlength="200">
</label>
<label>Author:
    <input type="text" name="author" class="input-new-author" maxlength="200">
</label>
<label>ISBN:
    <input type="text" name="isbn" class="input-new-isbn" maxlength="17">
</label>
<label>Publisher:
    <input type="text" name="publisher" class="input-new-publisher"
     maxlength="200">
</label>
<label>Genre:
    <select name="genre" class="input-new-genre">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
    </select><br>
</label>
<button type="submit" class="modify-book-button">Submit Changes</button>
</form>
`;

// Book object constructor for new books or modifications
let Book = function(
    bookAuthor, bookTitle, bookISBN, bookPublisher, bookGenre
) {
     this.author = bookAuthor;
     this.title = bookTitle;
     this.isbn = bookISBN;
     this.publisher = bookPublisher;
     this.genre = bookGenre;
};

let serverAddress = "http://localhost:8000/book/";

/**
 * Function for performing Ajax requests to designated endpoint.
 * @param task string indicating task type, determines done response
 * @param requestMethod string indicating request: GET, POST, PUT, DELETE
 * @param httpDestination string with endpoint
 * @param optionalObject object to be sent to server
 * @returns {*} result, either object or message
 */
let ajaxCommunication = (
    task,
    requestMethod,
    httpDestination,
    optionalObject = 0
) => {
    return $.ajax({
        url: httpDestination,
        data: optionalObject,
        type: requestMethod,
        dataType: "json"
    }).done(function(result) {
        if (task === "buildBookList") {
            buildBookList(result);
        } else if (task === "removeBook") {
            location.reload();
            console.log("DELETE OK");
        } else if (task === "bookInfo") {
            buildBookDesc(result);
        } else if (task === "bookUpdate") {
            console.log("PUT OK");
            location.reload();
        } else if (task === "newBook") {
           console.log("POST OK");
        }
    }).fail(function (xhr, status, err) {
    }).always(function (xhr, status) {
    });
};

let buildBookList = (ajaxResult) => {

    // Book list items and hidden divs
    for (let i = 0; i < ajaxResult.length; i++) {
        let bookListItem = $('<li class="book-title" data-id="'
            + ajaxResult[i].id
            + '">'
            + "<div class=\"book-title-span\">"
            + ajaxResult[i].title
            + '<div class="remove-button">'
            + '<button>Remove</button>'
            + "</div>"
            + '</div>'
            + '<div class="book-desc hidden-desc"></div>'
            + '</li>');
        $(".book-list").eq(0).append(bookListItem);
    }

    // Set removal events on buttons
    $(".remove-button button").each(function (index, element) {
        $(element).on("click", function (removalClickEvent) {
            removalClickEvent.stopImmediatePropagation();
            ajaxCommunication("removeBook", "DELETE",
                serverAddress
                    + $(element).parent().parent().parent().data("id")
            );
        });
    });

    // Prepare divs with click events
    $(".book-title-span").each(function(index, element) {
        $(element).on("click", function () {
            if ($(element).next().hasClass("hidden-desc")) {
                $(element).next().toggleClass("hidden-desc");
                ajaxCommunication(
                    "bookInfo",
                    "GET",
                    serverAddress + $(element).parent().data("id")
                );
            } else {
                $(element).next().toggleClass("hidden-desc");
            }
        })
    });
};


let buildBookDesc = (ajaxResult) => {
    $(`.book-title[data-id=${ajaxResult.id}] .book-desc`).html(
        "<span><br>Author: "
        + ajaxResult.author + "<br>"
        + "Title: " +  ajaxResult.title + "<br>"
        + "ISBN: " +  ajaxResult.isbn + "<br>"
        + "Publisher: " +  ajaxResult.publisher + "<br>"
        + "Genre: " +  ajaxResult.genre + "</span><br><br>"
        + "<button type=\"submit\" class=\"modify-button\">"
        + "Modify</button>"
        + bookModifyForm
    );

    $(`.book-title[data-id=${ajaxResult.id}] .modify-button`)
        .on("click", function (event) {
            event.stopPropagation();
            if ($(this).next().hasClass("hidden-desc")) {
                $(this).next().toggleClass("hidden-desc");
            }
    });

    // Book modify form and button
    $(`.book-title[data-id=${ajaxResult.id}] .modify-book-button`)
        .on("click", function(event) {
                // Perform validation
                if (!$(this).parent().find(".input-new-author").val()
                    || !$(this).parent().find(".input-new-title").val()
                    || !$(this).parent().find(".input-new-isbn").val()
                    || !$(this).parent().find(".input-new-publisher").val()
                    || !$(this).parent().find(".input-new-genre").val()) {
                    alert("Input values are not correct.");
                    event.preventDefault();
                } else {

                    // New book object
                    let modifiedBook = new Book(
                        $(this).parent().find(".input-new-author").val(),
                        $(this).parent().find(".input-new-title").val(),
                        $(this).parent().find(".input-new-isbn").val(),
                        $(this).parent().find(".input-new-publisher").val(),
                        $(this).parent().find(".input-new-genre").val()
                    );

                    // Submit object via AJAX
                    ajaxCommunication(
                        "bookUpdate",
                        "PUT",
                        serverAddress + $(this)
                            .parent()
                            .parent()
                            .parent()
                            .data("id"),
                        modifiedBook
                    );
                }
            });
};


// Website modification starts here
$(function() {
    // Set event for new book form
    $(".add-book-button").eq(0).on("click", function(event) {
        // Perform validation
        if (!$(".input-author").val()
            || !$(".input-title").val()
            || !$(".input-isbn").val()
            || !$(".input-publisher").val()
            || !$(".input-genre").val()) {
            alert("Input values are not correct.");
            event.preventDefault();
        } else {

            // New book object
            let newBook = new Book(
                $(".input-author").val(),
                $(".input-title").val(),
                $(".input-isbn").val(),
                $(".input-publisher").val(),
                $(".input-genre").val()
            );

            // Submit object via AJAX
            ajaxCommunication("newBook", "POST", serverAddress, newBook);
        }
    });

    // GET book data and create list items
    ajaxCommunication("buildBookList", "GET", serverAddress);
});