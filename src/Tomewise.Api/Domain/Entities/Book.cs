using Tomewise.Api.Domain.Enums;
namespace Tomewise.Api.Domain.Entities;

public class Book
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Isbn10 { get; set; }
    public string? Isbn13 { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? PublishedYear { get; set; }
    public string? Publisher { get; set; }
    public string? Language { get; set; }
    public int? PageCount { get; set; }
    public BookSource Source { get; set; }

    // Navigation properties
    public ICollection<BookItem> BookItems { get; set; } = [];
    public ICollection<BookAuthor> BookAuthors { get; set; } = [];
    public ICollection<BookGenre> BookGenres { get; set; } = [];
}