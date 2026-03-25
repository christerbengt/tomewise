namespace Tomewise.Api.Domain.Entities;

public class BookAuthor
{
    public Guid BookId { get; set; }
    public Guid AuthorId { get; set; }

    // Navigation properties
    public Book Book { get; set; } = null!;
    public Author Author { get; set; } = null!;
}