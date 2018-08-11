"use strict";

let bookModifyForm = `<form class="book-modify-form hidden-desc" method="POST">
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
                        <input type="text" name="publisher" class="input-new-publisher" maxlength="200">
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

                    <button type="submit" class="modify-book-button">Add</button>
                </form>`;

$(function() {

    // Book object (for new books)
    let Book = function(
        bookAuthor, bookTitle, bookISBN, bookPublisher, bookGenre
    ) {
         this.author = bookAuthor;
         this.title = bookTitle;
         this.isbn = bookISBN;
         this.publisher = bookPublisher;
         this.genre = bookGenre;
    };


    // GET book data and create list items and divs
    $.ajax({
         url: "http://localhost:8000/book/",
         type: "GET",
         dataType: "json"
    }).done(function(result) {
        for (let i = 0; i < result.length; i++) {
            let newBook = $('<li class="book-title" data-id="' +
                result[i].id +
                '">' +
                result[i].title +
                '<div class="remove-button">' +
                '<button>Remove</button>' +
                '</div>' +
                '<div class="book-desc hidden-desc"></div>' +
                '</li>');
            $(".book-list").eq(0).append(newBook);
        }

        // Removal event
        $(".remove-button button").each(function(index, element) {
            $(element).on("click", function(removalClickEvent) {
                removalClickEvent.stopImmediatePropagation();
                $.ajax({
                    url: "http://localhost:8000/book/"
                        + $(element).parent().parent().data("id"),
                    type: "DELETE",
                    dataType: "json"
                }).done(function () {
                    location.reload();
                    console.log("DELETE OK");
                }).fail(function (xhr, status, err) {
                }).always(function (xhr, status) {
                });
            });
        });


        // Prepare divs with click events
        $(".book-title").each(function(index, element) {
            $(element).on("click", function () {
                if ($(element).children().last().eq(0).hasClass("hidden-desc")) {

                    $(element).children().last().eq(0).toggleClass("hidden-desc");

                    $.ajax({
                        url: "http://localhost:8000/book/" + $(element).data("id"),
                        type: "GET",
                        dataType: "json"
                    }).done(function (bookData) {
                        $(element).children().last().eq(0).html(
                            "<span><br>Author: "
                            + bookData.author + "<br>"
                            + "Title: " +  bookData.title + "<br>"
                            + "ISBN: " +  bookData.isbn + "<br>"
                            + "Publisher: " +  bookData.publisher + "<br>"
                            + "Genre: " +  bookData.genre + "</span><br><br>"
                            + "<button type=\"submit\" class=\"modify-button\">"
                            + "Modify</button>"
                            + bookModifyForm
                        );

                        // Display modification form
                            $(".book-title").find(".modify-button").each(function(index, element) {
                            $(element).on("click", function (event) {
                                event.stopPropagation();
                                if ($(element).next().hasClass("hidden-desc")) {
                                    $(element).next().toggleClass("hidden-desc");
                                }
                            })
                        });

                        // PUT modify book
                        $(".modify-book-button").each(function(modifyButton){
                            $(modifyButton).on("click", function(event) {
                                // Perform validation
                                if (!$(modifyButton).parent().find(".input-new-author").val()
                                    || !$(modifyButton).parent().find(".input-new-title").val()
                                    || !$(modifyButton).parent().find(".input-new-isbn").val()
                                    || !$(modifyButton).parent().find(".input-new-publisher").val()
                                    || !$(modifyButton).parent().find(".input-new-genre").val()) {
                                    alert("Input values are not correct.");
                                    event.preventDefault();
                                } else {

                                    // New book object
                                    let modifiedBook = new Book(
                                        $(modifyButton).parent().find(".input-author").val(),
                                        $(modifyButton).parent().find(".input-title").val(),
                                        $(modifyButton).parent().find(".input-isbn").val(),
                                        $(modifyButton).parent().find(".input-publisher").val(),
                                        $(modifyButton).parent().find(".input-genre").val()
                                    );

                                    // Submit object via AJAX
                                    $.ajax({
                                        url: "http://localhost:8000/book/"+ $(element).parent().parent().data("id"),        //Check
                                        data: modifiedBook,
                                        type: "PUT",
                                        dataType: "json"
                                    }).done(function () {
                                        console.log("PUT OK");
                                        location.reload();
                                    }).fail(function (xhr, status, err) {
                                    }).always(function (xhr, status) {
                                    });
                                }
                            });
                        })

                    }).fail(function (xhr, status, err) {
                    }).always(function (xhr, status) {
                    });

                } else {
                    $(element).children().last().eq(0).toggleClass("hidden-desc");
                }
            })
        });

    }).fail(function(xhr,status,err) {
    }).always(function(xhr,status) {
    });


    // POST new book data
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
            $.ajax({
                url: "http://localhost:8000/book/",
                data: newBook,
                type: "POST",
                dataType: "json"
            }).done(function () {
                console.log("POST OK");
            }).fail(function (xhr, status, err) {
            }).always(function (xhr, status) {
            });
        }
    });

});