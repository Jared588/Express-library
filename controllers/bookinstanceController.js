const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("layout", {
    title: "Book Instance List",
    body: "bookinstance_list",
    bookinstance_list: allBookInstances,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    // No results.
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  res.render("layout", {
    title: "Book:",
    body: "bookinstance_detail",
    bookinstance: bookInstance,
  });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

  res.render("layout", {
    title: "Create BookInstance",
    body: "bookinstance_form",
    book_list: allBooks,
    selected_book: {},
    errors: [],
    bookinstance: {},
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

      res.render("layout", {
        title: "Create BookInstance",
        body: "bookinstance_form",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      // Data from form is valid
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  // Get info about BookInstance
  const bookinstance = await BookInstance.findById(req.params.id);

  if (bookinstance === null) {
    // No instances exist
    redirect("/catalog/bookinstances");
  }

  res.render("layout", {
    title: "Delete Book Instance",
    body: "bookinstance_delete",
    bookinstance: bookinstance,
  })
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
// Delete object and redirect to the list of books.
  await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
  res.redirect("/catalog/books");
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  // Get BookInstance info
  const [bookInstance, allBooks] = await Promise.all([
    BookInstance.findById(req.params.id).exec(),
    Book.find({}, "title").sort({ title: 1 }).exec(),
  ]);

  if (bookInstance === null) {
    // No results.
    const err = new Error("Book instance not found");
    err.status = 404;
    return next(err);
  }

  res.render("layout", {
    title: "Update Book Instance",
    body: "bookinstance_form",
    bookinstance: bookInstance,
    book_list: allBooks,
    selected_book: bookInstance.book._id,
    errors: [],
  })
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

      res.render("layout", {
        title: "Update BookInstance",
        body: "bookinstance_form",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedBookInstance = await BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {})
      // Redirect to author detail page.
      res.redirect(updatedBookInstance.url);
    }
  }),
];
