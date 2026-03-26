using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Tomewise.Api.Data;
using Tomewise.Api.Domain.Entities;
using Tomewise.Api.Domain.Enums;
using Tomewise.Api.DTOs;

namespace Tomewise.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BooksController(BookTrackerDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetBooks()
    {
        var books = await context.Books
            .Include(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
            .Include(b => b.BookGenres)
                .ThenInclude(bg => bg.Genre)
            .ToListAsync();

        return Ok(books.Select(MapToResponse));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookResponseDto>> GetBook(Guid id)
    {
        var book = await context.Books
            .Include(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
            .Include(b => b.BookGenres)
                .ThenInclude(bg => bg.Genre)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null)
            return NotFound();

        return Ok(MapToResponse(book));
    }

    [HttpPost]
    public async Task<ActionResult<BookResponseDto>> CreateBook(
        [FromBody] CreateBookRequestDto request)
    {
        if (request.Isbn13 != null)
        {
            var existing = await context.Books
                .FirstOrDefaultAsync(b => b.Isbn13 == request.Isbn13);
            if (existing != null)
                return Ok(MapToResponse(existing));
        }

        if (request.Isbn10 != null)
        {
            var existing = await context.Books
                .FirstOrDefaultAsync(b => b.Isbn10 == request.Isbn10);
            if (existing != null)
                return Ok(MapToResponse(existing));
        }
        var book = new Book
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Isbn10 = request.Isbn10,
            Isbn13 = request.Isbn13,
            CoverImageUrl = request.CoverImageUrl,
            PublishedYear = request.PublishedYear,
            Publisher = request.Publisher,
            Language = request.Language,
            PageCount = request.PageCount,
            Source = BookSource.Manual
        };

        foreach (var authorName in request.Authors)
        {
            var author = await context.Authors
                .FirstOrDefaultAsync(a => a.Name == authorName)
                ?? new Author { Id = Guid.NewGuid(), Name = authorName };

            book.BookAuthors.Add(new BookAuthor { Book = book, Author = author });
        }

        foreach (var genreName in request.Genres)
        {
            var genre = await context.Genres
                .FirstOrDefaultAsync(g => g.Name == genreName)
                ?? new Genre { Id = Guid.NewGuid(), Name = genreName };

            book.BookGenres.Add(new BookGenre { Book = book, Genre = genre });
        }

        context.Books.Add(book);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBook), new { id = book.Id }, MapToResponse(book));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBook(Guid id,
        [FromBody] UpdateBookRequestDto request)
    {
        var book = await context.Books
            .Include(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
            .Include(b => b.BookGenres)
                .ThenInclude(bg => bg.Genre)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (book == null)
            return NotFound();

        book.Title = request.Title;
        book.Isbn10 = request.Isbn10;
        book.Isbn13 = request.Isbn13;
        book.CoverImageUrl = request.CoverImageUrl;
        book.PublishedYear = request.PublishedYear;
        book.Publisher = request.Publisher;
        book.Language = request.Language;
        book.PageCount = request.PageCount;

        book.BookAuthors.Clear();
        foreach (var authorName in request.Authors)
        {
            var author = await context.Authors
                .FirstOrDefaultAsync(a => a.Name == authorName)
                ?? new Author { Id = Guid.NewGuid(), Name = authorName };

            book.BookAuthors.Add(new BookAuthor { Book = book, Author = author });
        }

        book.BookGenres.Clear();
        foreach (var genreName in request.Genres)
        {
            var genre = await context.Genres
                .FirstOrDefaultAsync(g => g.Name == genreName)
                ?? new Genre { Id = Guid.NewGuid(), Name = genreName };

            book.BookGenres.Add(new BookGenre { Book = book, Genre = genre });
        }

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(Guid id)
    {
        var book = await context.Books.FindAsync(id);

        if (book == null)
            return NotFound();

        context.Books.Remove(book);
        await context.SaveChangesAsync();
        return NoContent();
    }

    private static BookResponseDto MapToResponse(Book book) => new(
        book.Id,
        book.Title,
        book.Isbn10,
        book.Isbn13,
        book.CoverImageUrl,
        book.PublishedYear,
        book.Publisher,
        book.Language,
        book.PageCount,
        book.BookAuthors.Select(ba => ba.Author.Name),
        book.BookGenres.Select(bg => bg.Genre.Name)
    );
}